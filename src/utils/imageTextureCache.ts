/**
 * Universal Image Texture Cache & Canvas Graphics Pipeline.
 * 
 * Complies with AGENTS.md Architecture Constraints:
 * - Data-DOM Decoupling: Zero DOM dependencies, zero React state stored.
 * - Portable: Runs in Canvas 2D, WebGL, or OffscreenCanvas Worker contexts.
 * - Intent-Driven: Supports instant fallback, LRU memory protection, and progressive streaming.
 */

// Max concurrent high-resolution original images in memory to prevent GPU memory pressure
const MAX_ORIGINAL_CACHE_ENTRIES = 4;

// Cache maps: URL -> HTMLImageElement
export const fullImageCache = new Map<string, HTMLImageElement>();
export const originalImageCache = new Map<string, HTMLImageElement>();

// LRU tracking for original high-resolution images
const originalLruQueue: string[] = [];

// Track 4K-capped original textures without touching element.dataset
const capped4kImages = new WeakSet<HTMLImageElement>();
const cappingInProgressImages = new WeakSet<HTMLImageElement>();
const cappedBlobUrls = new WeakMap<HTMLImageElement, string>();

// Map from URL -> Set of callbacks to trigger when loaded
const pendingCallbacks = new Map<string, Set<() => void>>();

/**
 * Evict a specific URL from the original high-res texture cache (e.g. when replaced by a migrated 4K proxy).
 */
export function evictOriginalImageCache(url: string | null | undefined) {
  if (!url) return;
  const img = originalImageCache.get(url);
  if (img) {
    const cappedUrl = cappedBlobUrls.get(img);
    if (cappedUrl) {
      URL.revokeObjectURL(cappedUrl);
      cappedBlobUrls.delete(img);
    }
    img.src = '';
    originalImageCache.delete(url);
  }
  const idx = originalLruQueue.indexOf(url);
  if (idx !== -1) {
    originalLruQueue.splice(idx, 1);
  }
}

/**
 * Get or asynchronously load an image for Canvas rendering.
 * Returns the HTMLImageElement if already loaded and ready, or null if loading.
 */
export function getOrLoadCanvasImage(
  url: string | null | undefined,
  onLoaded?: () => void,
  tier: 'full' | 'original' = 'full'
): HTMLImageElement | null {
  if (!url) return null;

  const targetMap = tier === 'original' ? originalImageCache : fullImageCache;
  const existing = targetMap.get(url);

  if (existing) {
    const isWithinTierCap =
      tier !== 'original' ||
      (!cappingInProgressImages.has(existing) &&
        ((existing.naturalWidth <= 4096 && existing.naturalHeight <= 4096) ||
          capped4kImages.has(existing)));
    if (existing.complete && existing.naturalWidth > 0 && isWithinTierCap) {
      if (tier === 'original') {
        touchOriginalLru(url);
      }
      return existing;
    }
    if (onLoaded) {
      if (!pendingCallbacks.has(url)) {
        pendingCallbacks.set(url, new Set());
      }
      pendingCallbacks.get(url)!.add(onLoaded);
    }
    return null;
  }

  // Create and load image
  const img = new Image();
  if (!url.startsWith('data:') && !url.startsWith('blob:')) {
    img.crossOrigin = 'anonymous';
  }
  img.referrerPolicy = 'no-referrer';

  if (onLoaded) {
    if (!pendingCallbacks.has(url)) {
      pendingCallbacks.set(url, new Set());
    }
    pendingCallbacks.get(url)!.add(onLoaded);
  }

  const flushCallbacks = () => {
    const callbacks = pendingCallbacks.get(url);
    if (callbacks) {
      callbacks.forEach(cb => {
        try {
          cb();
        } catch (err) {
          console.error('[imageTextureCache] Callback execution error:', err);
        }
      });
      pendingCallbacks.delete(url);
    }
  };

  img.onload = () => {
    if (
      tier === 'original' &&
      (img.naturalWidth > 4096 || img.naturalHeight > 4096) &&
      !capped4kImages.has(img) &&
      !cappingInProgressImages.has(img) &&
      typeof document !== 'undefined'
    ) {
      cappingInProgressImages.add(img);
      try {
        const maxDim = 4096;
        const scale = Math.min(maxDim / img.naturalWidth, maxDim / img.naturalHeight);
        const targetW = Math.max(1, Math.round(img.naturalWidth * scale));
        const targetH = Math.max(1, Math.round(img.naturalHeight * scale));
        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, targetW, targetH);
          canvas.toBlob(
            (blob) => {
              cappingInProgressImages.delete(img);
              capped4kImages.add(img);
              if (blob) {
                const prevCappedUrl = cappedBlobUrls.get(img);
                if (prevCappedUrl) {
                  URL.revokeObjectURL(prevCappedUrl);
                }
                const cappedUrl = URL.createObjectURL(blob);
                cappedBlobUrls.set(img, cappedUrl);
                img.src = cappedUrl;
              } else {
                flushCallbacks();
              }
            },
            'image/jpeg',
            0.9
          );
          return;
        }
      } catch (capErr) {
        cappingInProgressImages.delete(img);
        capped4kImages.add(img);
        console.warn('[imageTextureCache] Failed to cap >4K image to 4096px:', capErr);
      }
    }
    cappingInProgressImages.delete(img);
    flushCallbacks();
  };
  img.onerror = () => {
    cappingInProgressImages.delete(img);
    if (img.crossOrigin === 'anonymous') {
      console.warn(`[imageTextureCache] CORS load failed for ${tier} image (likely blocked by hosting CDN). Retrying without crossOrigin: ${url}`);
      img.removeAttribute('crossOrigin');
      img.src = url;
    } else {
      console.warn(`[imageTextureCache] Hard load failure for ${tier} image: ${url}`);
      const callbacks = pendingCallbacks.get(url);
      if (callbacks) {
        callbacks.forEach(cb => {
          try {
            cb();
          } catch (err) {
            console.error('[imageTextureCache] Error callback execution error:', err);
          }
        });
        pendingCallbacks.delete(url);
      }
    }
  };

  img.src = url;
  targetMap.set(url, img);

  if (tier === 'original') {
    touchOriginalLru(url);
    enforceOriginalLruLimit();
  }

  return null;
}

/**
 * Preload and decode a canvas texture image into fullImageCache / originalImageCache.
 * Resolves cleanly even on timeout or decode errors so callers never hang.
 */
export async function preloadCanvasImage(
  url: string | null | undefined,
  tier: 'full' | 'original' = 'full',
  timeoutMs: number = 450
): Promise<HTMLImageElement | null> {
  if (!url) return null;
  const targetMap = tier === 'original' ? originalImageCache : fullImageCache;

  const waitForDecode = async (img: HTMLImageElement | null) => {
    if (!img) return null;
    if (typeof img.decode === 'function') {
      await Promise.race([
        img.decode().catch(() => {}),
        new Promise<void>((resolve) => setTimeout(resolve, timeoutMs)),
      ]);
    }
    return img;
  };

  const immediate = getOrLoadCanvasImage(url, undefined, tier);
  if (immediate) {
    return waitForDecode(immediate);
  }

  return new Promise((resolve) => {
    let settled = false;
    const finish = (img: HTMLImageElement | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      void waitForDecode(img).then(resolve);
    };
    const timer = setTimeout(() => {
      finish(targetMap.get(url) || null);
    }, timeoutMs);

    const loaded = getOrLoadCanvasImage(
      url,
      () => finish(targetMap.get(url) || null),
      tier
    );
    if (loaded) {
      finish(loaded);
    }
  });
}

/**
 * Update LRU queue for original high-res image cache
 */
function touchOriginalLru(url: string) {
  const index = originalLruQueue.indexOf(url);
  if (index !== -1) {
    originalLruQueue.splice(index, 1);
  }
  originalLruQueue.push(url);
}

/**
 * Enforce memory limit for original high-res textures
 */
function enforceOriginalLruLimit() {
  while (originalLruQueue.length > MAX_ORIGINAL_CACHE_ENTRIES) {
    const oldestUrl = originalLruQueue.shift();
    if (oldestUrl) {
      const img = originalImageCache.get(oldestUrl);
      if (img) {
        const cappedUrl = cappedBlobUrls.get(img);
        if (cappedUrl) {
          URL.revokeObjectURL(cappedUrl);
          cappedBlobUrls.delete(img);
        }
        img.src = ''; // Release browser image decoding buffer
      }
      originalImageCache.delete(oldestUrl);
    }
  }
}

/**
 * Compute Object-Cover source rectangle parameters
 * Guarantees zero distortion, no stretching, and no black bars.
 */
export function calculateObjectCover(
  imgW: number,
  imgH: number,
  cardW: number,
  cardH: number
): { sx: number; sy: number; sw: number; sh: number } {
  if (imgW <= 0 || imgH <= 0 || cardW <= 0 || cardH <= 0) {
    return { sx: 0, sy: 0, sw: Math.max(1, imgW), sh: Math.max(1, imgH) };
  }

  const imgAspect = imgW / imgH;
  const cardAspect = cardW / cardH;

  let sx = 0;
  let sy = 0;
  let sw = imgW;
  let sh = imgH;

  if (imgAspect > cardAspect) {
    // Image is wider than container -> crop left & right
    sw = imgH * cardAspect;
    sx = (imgW - sw) / 2;
  } else {
    // Image is taller than container -> crop top & bottom
    sh = imgW / cardAspect;
    sy = (imgH - sh) / 2;
  }

  return { sx, sy, sw, sh };
}

/**
 * Draw a smooth continuous-curvature squircle path on Canvas 2D
 * Matches the CSS squircle continuous curvature language.
 */
export function drawSquirclePath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number = 16
) {
  const r = Math.min(radius, w / 2, h / 2);
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r);
  } else {
    // Fallback for older browsers
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}

/**
 * Asynchronously preload and decode an image URL into GPU memory before mounting to DOM/Canvas.
 * Ensures instantaneous non-flashing texture handoff.
 */
export async function preloadAndDecodeImage(
  url: string | null | undefined,
  tier: 'full' | 'original' = 'full',
): Promise<boolean> {
  if (!url) return false;
  const targetMap = tier === 'original' ? originalImageCache : fullImageCache;
  const img = await new Promise<HTMLImageElement | null>(resolve => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      const loaded = targetMap.get(url);
      resolve(loaded?.complete && loaded.naturalWidth > 0 ? loaded : null);
    };
    const timeout = setTimeout(finish, 8000);
    const ready = getOrLoadCanvasImage(url, finish, tier);
    if (ready) finish();
  });
  if (!img) return false;
  try {
    await img.decode();
  } catch {
    // Some browsers reject decode() for an otherwise drawable cached image.
  }
  return img.complete && img.naturalWidth > 0;
}

