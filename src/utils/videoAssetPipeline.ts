/**
 * Unified Video Asset Finalization & Rendering Parity Pipeline.
 *
 * Ensures generated video cards execute the exact same static LOD, poster,
 * local-blob, and texture-cache pipeline as purely imported video cards:
 * - Pure, DOM-free state/routing helpers (unit-testable in Node via node:test).
 * - Failure circuit-breaker preventing repeated 8s hidden <video> decode storms.
 * - Single-pass video poster + 5-tier LOD pyramid + Canvas texture pre-warming.
 */

import type { CardBaselineConfig, CardData } from '../components/GenerationCard';
import { getOrLoadCanvasImage } from './imageTextureCache';
import { resizeImageOffThread } from './imageResize';
import {
  captureVideoPosterWithMetadata,
  generateImageThumbnail,
  thumbCache,
  yieldToMain,
} from './thumbnail';

const STATIC_IMAGE_EXT_RE = /\.(png|jpe?g|webp|gif|avif|bmp|svg)(?:[?#].*)?$/i;
const VIDEO_MEDIA_EXT_RE = /\.(mp4|webm|mov|m4v|ogv|mkv)(?:[?#].*)?$/i;
const KNOWN_STATIC_IMAGE_HOST_RE = /^https?:\/\/(?:images\.unsplash\.com)\//i;

const MAX_REMOTE_VIDEO_BLOB_BYTES = 60 * 1024 * 1024; // 60 MB guard for local Blob download
const REMOTE_VIDEO_FETCH_TIMEOUT_MS = 15000;
const DEFAULT_FAILURE_COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Pure heuristic identifying URLs that are definitely static images rather than video streams.
 * Prevents demo fallback image URLs on video cards from spawning doomed <video> decoders.
 */
export function isLikelyStaticImageUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (/^data:image\//i.test(trimmed)) return true;
  if (/^data:video\//i.test(trimmed)) return false;
  if (trimmed.startsWith('blob:')) return false;
  if (VIDEO_MEDIA_EXT_RE.test(trimmed)) return false;
  if (STATIC_IMAGE_EXT_RE.test(trimmed)) return true;
  if (KNOWN_STATIC_IMAGE_HOST_RE.test(trimmed)) return true;
  return false;
}

/**
 * Pure heuristic identifying explicit video URLs.
 */
export function isLikelyVideoMediaUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (/^data:video\//i.test(trimmed)) return true;
  if (VIDEO_MEDIA_EXT_RE.test(trimmed)) return true;
  return false;
}

export interface VideoCardCanvasImageInput {
  isVideo?: boolean;
  imageUrl?: string;
  originalImageUrl?: string;
  trueOriginalImageUrl?: string;
  effectiveVideoPosterUrl?: string;
  effectiveThumbnailUrl?: string;
  blurPlaceholderUrl?: string;
}

export interface VideoCardCanvasImageProps {
  imageUrl?: string;
  originalImageUrl?: string;
  thumbnailUrl?: string;
  blurPlaceholderUrl?: string;
}

/**
 * Pure prop resolver for <CardImageCanvas>.
 * Guarantees video cards NEVER feed raw video URLs (.mp4, .webm, blob:, remote video stream)
 * into new Image() / getOrLoadCanvasImage, while still rendering native videoPosterUrl or
 * static thumbnails cleanly (and allowing legacy static-image demo fallbacks to render visibly).
 */
export function resolveVideoCardCanvasImageProps(
  input: VideoCardCanvasImageInput
): VideoCardCanvasImageProps {
  const {
    isVideo,
    imageUrl,
    originalImageUrl,
    trueOriginalImageUrl,
    effectiveVideoPosterUrl,
    effectiveThumbnailUrl,
    blurPlaceholderUrl,
  } = input;

  if (!isVideo) {
    return {
      imageUrl,
      originalImageUrl: originalImageUrl || trueOriginalImageUrl || imageUrl,
      thumbnailUrl: effectiveThumbnailUrl,
      blurPlaceholderUrl,
    };
  }

  const safePoster = effectiveVideoPosterUrl || undefined;
  const safeThumb = effectiveThumbnailUrl || undefined;

  if (safePoster) {
    return {
      imageUrl: safePoster,
      originalImageUrl: safePoster,
      thumbnailUrl: safeThumb || safePoster,
      blurPlaceholderUrl,
    };
  }

  if (safeThumb) {
    // CardImageCanvas handles imageUrl=undefined cleanly when thumbnailUrl is provided:
    // it draws thumbnailUrl and immediately resolves isPainted without firing a doomed new Image(videoUrl).
    return {
      imageUrl: undefined,
      originalImageUrl: undefined,
      thumbnailUrl: safeThumb,
      blurPlaceholderUrl,
    };
  }

  // Legacy demo fallback cards may have isVideo=true with a static Unsplash image URL and no poster yet.
  if (isLikelyStaticImageUrl(imageUrl)) {
    return {
      imageUrl,
      originalImageUrl: imageUrl,
      thumbnailUrl: imageUrl,
      blurPlaceholderUrl,
    };
  }

  return {
    imageUrl: undefined,
    originalImageUrl: undefined,
    thumbnailUrl: undefined,
    blurPlaceholderUrl,
  };
}

export interface VideoPosterFailureRecord {
  failures: number;
  lastFailedAt: number;
  permanent: boolean;
}

/**
 * Pure circuit breaker that prevents unplayable, expired, or non-video URLs
 * from spawning repeated 8-second hidden <video> timeouts on every Nano<->DOM remount.
 */
export class VideoPosterFailureGuard {
  private readonly records = new Map<string, VideoPosterFailureRecord>();
  private readonly maxFailures: number;
  private readonly cooldownMs: number;

  constructor(options?: { maxFailures?: number; cooldownMs?: number }) {
    this.maxFailures = options?.maxFailures ?? 1;
    this.cooldownMs = options?.cooldownMs ?? DEFAULT_FAILURE_COOLDOWN_MS;
  }

  shouldSkip(sourceKey: string | null | undefined, now: number = Date.now()): boolean {
    if (!sourceKey || !sourceKey.trim()) return true;
    if (isLikelyStaticImageUrl(sourceKey)) return true;
    const record = this.records.get(sourceKey);
    if (!record) return false;
    if (record.permanent) return true;
    if (record.failures >= this.maxFailures && now - record.lastFailedAt < this.cooldownMs) {
      return true;
    }
    return false;
  }

  recordFailure(
    sourceKey: string | null | undefined,
    options?: { permanent?: boolean; now?: number }
  ): void {
    if (!sourceKey || !sourceKey.trim()) return;
    const prev = this.records.get(sourceKey);
    const now = options?.now ?? Date.now();
    this.records.set(sourceKey, {
      failures: (prev?.failures ?? 0) + 1,
      lastFailedAt: now,
      permanent: Boolean(prev?.permanent || options?.permanent),
    });
  }

  clear(sourceKey: string | null | undefined): void {
    if (!sourceKey) return;
    this.records.delete(sourceKey);
  }

  reset(): void {
    this.records.clear();
  }
}

export const defaultVideoPosterFailureGuard = new VideoPosterFailureGuard();

/**
 * Pure predicate checking whether a completed video card is missing any of the
 * imported-video parity assets (poster or 5-tier static LOD pyramid).
 */
export function needsVideoAssetUpgrade(
  card: Pick<
    CardData,
    | 'isVideo'
    | 'state'
    | 'imageUrl'
    | 'fileData'
    | 'videoPosterUrl'
    | 'thumbnailUrl'
    | 'closeupThumbnailUrl'
    | 'fullDetailThumbnailUrl'
    | 'microLodThumbnailUrl'
    | 'blurPlaceholderUrl'
  >
): boolean {
  if (!card.isVideo) return false;
  if (card.state === 'generating') return false;
  const hasSource = Boolean(card.fileData || (card.imageUrl && card.imageUrl.trim()));
  if (!hasSource) return false;
  return Boolean(
    !card.videoPosterUrl ||
    !card.thumbnailUrl ||
    !card.closeupThumbnailUrl ||
    !card.fullDetailThumbnailUrl ||
    !card.microLodThumbnailUrl ||
    !card.blurPlaceholderUrl
  );
}

export interface PreparedVideoAssets {
  imageUrl?: string;
  fileData?: Blob;
  videoPosterUrl?: string;
  thumbnailUrl?: string;
  closeupThumbnailUrl?: string;
  fullDetailThumbnailUrl?: string;
  microLodThumbnailUrl?: string;
  blurPlaceholderUrl?: string;
  nativeWidth?: number;
  nativeHeight?: number;
  videoDuration?: number;
  isStaticFallback?: boolean;
}

export interface CompletedVideoCardPatchInput {
  mediaUrl: string;
  assets?: PreparedVideoAssets | null;
  isVideo?: boolean;
  mcpTaskId?: string;
  lastGeneratedPrompt?: string;
  baselineConfig?: CardBaselineConfig;
  markCompleted?: boolean;
}

/**
 * Pure builder producing an immutable Partial<CardData> patch for completed/upgraded video cards
 * with exact field parity to purely imported video cards.
 */
export function buildCompletedVideoCardPatch(
  input: CompletedVideoCardPatchInput
): Partial<CardData> {
  const { mediaUrl, assets, isVideo = true, mcpTaskId, lastGeneratedPrompt, baselineConfig, markCompleted = true } = input;
  const patch: Partial<CardData> = {
    imageUrl: assets?.imageUrl || mediaUrl,
    isVideo,
  };

  if (assets?.fileData) patch.fileData = assets.fileData;
  if (assets?.videoPosterUrl) patch.videoPosterUrl = assets.videoPosterUrl;
  if (assets?.thumbnailUrl) patch.thumbnailUrl = assets.thumbnailUrl;
  if (assets?.closeupThumbnailUrl) patch.closeupThumbnailUrl = assets.closeupThumbnailUrl;
  if (assets?.fullDetailThumbnailUrl) patch.fullDetailThumbnailUrl = assets.fullDetailThumbnailUrl;
  if (assets?.microLodThumbnailUrl) patch.microLodThumbnailUrl = assets.microLodThumbnailUrl;
  if (assets?.blurPlaceholderUrl) patch.blurPlaceholderUrl = assets.blurPlaceholderUrl;

  if (typeof assets?.nativeWidth === 'number' && Number.isFinite(assets.nativeWidth) && assets.nativeWidth > 0) {
    patch.nativeWidth = assets.nativeWidth;
  }
  if (typeof assets?.nativeHeight === 'number' && Number.isFinite(assets.nativeHeight) && assets.nativeHeight > 0) {
    patch.nativeHeight = assets.nativeHeight;
  }
  if (typeof assets?.videoDuration === 'number' && Number.isFinite(assets.videoDuration) && assets.videoDuration > 0) {
    patch.videoDuration = assets.videoDuration;
  }

  if (markCompleted) {
    patch.state = 'completed';
    patch.generationError = undefined;
  }
  if (mcpTaskId !== undefined) patch.mcpTaskId = mcpTaskId;
  if (lastGeneratedPrompt !== undefined) patch.lastGeneratedPrompt = lastGeneratedPrompt;
  if (baselineConfig !== undefined) patch.baselineConfig = baselineConfig;

  return patch;
}

/**
 * Pure builder for demo fallback completion (when no MCP token is configured).
 * Populates static poster & LOD fields on video demo cards so they never trigger
 * hidden <video> timeout storms or CardImageCanvas decode errors.
 */
export function buildDemoFallbackPatch(demoImageUrl: string, isVideo?: boolean): Partial<CardData> {
  if (!isVideo) {
    return {
      imageUrl: demoImageUrl,
      state: 'completed',
      generationError: undefined,
    };
  }
  return {
    imageUrl: demoImageUrl,
    videoPosterUrl: demoImageUrl,
    thumbnailUrl: demoImageUrl,
    closeupThumbnailUrl: demoImageUrl,
    fullDetailThumbnailUrl: demoImageUrl,
    microLodThumbnailUrl: demoImageUrl,
    blurPlaceholderUrl: demoImageUrl,
    state: 'completed',
    generationError: undefined,
  };
}

// --- Browser Runtime Pipeline Helpers ---

function dataUrlToBlob(dataUrl: string): Blob | null {
  try {
    const commaIdx = dataUrl.indexOf(',');
    if (commaIdx === -1) return null;
    const header = dataUrl.slice(0, commaIdx);
    const mimeMatch = header.match(/data:([^;]+);base64/i);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const binary = atob(dataUrl.slice(commaIdx + 1));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new Blob([bytes], { type: mime });
  } catch {
    return null;
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => (typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('DataURL encode failed')));
    reader.onerror = () => reject(reader.error || new Error('DataURL encode failed'));
    reader.readAsDataURL(blob);
  });
}

async function generatePosterLod(source: Blob | string, maxEdge: number, blurRadius: number = 0): Promise<string> {
  try {
    if (blurRadius === 0 && typeof Blob !== 'undefined' && source instanceof Blob) {
      return await blobToDataUrl(await resizeImageOffThread(source, maxEdge, 0.9));
    }
  } catch {
    // Fallback to main-thread canvas thumbnailing
  }
  return generateImageThumbnail(source, maxEdge, blurRadius > 0 ? 0.85 : 0.9, blurRadius);
}

function warmVideoPosterTexture(url: string): Promise<void> {
  if (!url || typeof window === 'undefined') return Promise.resolve();
  return new Promise((resolve) => {
    let settled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const finish = () => {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      resolve();
    };
    const image = getOrLoadCanvasImage(url, finish, 'full');
    if (image) {
      finish();
      return;
    }
    timer = setTimeout(finish, 4000);
  });
}

async function tryDownloadRemoteVideoBlob(
  mediaUrl: string,
  isCancelled: () => boolean
): Promise<{ blob?: Blob; contentType?: string }> {
  if (typeof fetch === 'undefined' || typeof window === 'undefined') return {};
  if (!/^https?:\/\//i.test(mediaUrl)) return {};
  if (isLikelyStaticImageUrl(mediaUrl)) return { contentType: 'image/*' };

  const fetchUrl = mediaUrl.startsWith(window.location.origin)
    ? mediaUrl
    : `/api/mcp/workrally/proxy-media?url=${encodeURIComponent(mediaUrl)}`;

  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeoutId = setTimeout(() => {
    controller?.abort();
  }, REMOTE_VIDEO_FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(fetchUrl, {
      signal: controller?.signal,
    });
    if (!response.ok || isCancelled()) {
      return {};
    }
    const contentType = (response.headers.get('content-type') || '').toLowerCase();
    const contentLengthHeader = response.headers.get('content-length');
    if (contentLengthHeader) {
      const contentLength = parseInt(contentLengthHeader, 10);
      if (Number.isFinite(contentLength) && contentLength > MAX_REMOTE_VIDEO_BLOB_BYTES) {
        return { contentType };
      }
    }
    if (contentType.startsWith('image/')) {
      return { contentType };
    }
    if (contentType && !contentType.startsWith('video/') && !contentType.includes('octet-stream')) {
      return { contentType };
    }
    const blob = await response.blob();
    if (isCancelled() || blob.size === 0 || blob.size > MAX_REMOTE_VIDEO_BLOB_BYTES) {
      return { contentType };
    }
    const effectiveType = (blob.type || contentType || '').toLowerCase();
    if (effectiveType.startsWith('image/')) {
      return { contentType: effectiveType };
    }
    return { blob, contentType: effectiveType || 'video/mp4' };
  } catch {
    return {};
  } finally {
    clearTimeout(timeoutId);
  }
}

const inFlightVideoAssetJobs = new Map<string, Promise<PreparedVideoAssets | null>>();

export interface PrepareGeneratedVideoAssetsOptions {
  cardId: string;
  mediaUrl?: string;
  fileData?: Blob;
  existingPosterUrl?: string;
  downloadRemoteBlob?: boolean;
  isCancelled?: () => boolean;
  failureGuard?: VideoPosterFailureGuard;
}

/**
 * Full browser post-processing pipeline for generated / legacy video cards.
 * Produces the exact same 5-tier LOD pyramid, native videoPosterUrl, local Blob (when feasible),
 * native dimensions, duration, and pre-warmed Canvas texture as purely imported video cards.
 */
export async function prepareGeneratedVideoAssets(
  options: PrepareGeneratedVideoAssetsOptions
): Promise<PreparedVideoAssets | null> {
  const {
    cardId,
    mediaUrl,
    fileData,
    existingPosterUrl,
    downloadRemoteBlob = true,
    isCancelled = () => false,
    failureGuard = defaultVideoPosterFailureGuard,
  } = options;

  const sourceKey = mediaUrl || (fileData ? `blob:${cardId}:${fileData.size}:${fileData.type}` : '');
  if (!sourceKey || isCancelled()) return null;

  // Handle static image fallback URLs (e.g. legacy Unsplash demo cards) without touching <video>
  if (!fileData && mediaUrl && isLikelyStaticImageUrl(mediaUrl)) {
    const result: PreparedVideoAssets = {
      imageUrl: mediaUrl,
      videoPosterUrl: existingPosterUrl || mediaUrl,
      thumbnailUrl: existingPosterUrl || mediaUrl,
      closeupThumbnailUrl: existingPosterUrl || mediaUrl,
      fullDetailThumbnailUrl: existingPosterUrl || mediaUrl,
      microLodThumbnailUrl: existingPosterUrl || mediaUrl,
      blurPlaceholderUrl: existingPosterUrl || mediaUrl,
      isStaticFallback: true,
    };
    await warmVideoPosterTexture(result.videoPosterUrl!);
    return result;
  }

  // Deduplicate concurrent jobs for the exact same card + source
  const jobKey = `${cardId}::${sourceKey}`;
  const existingJob = inFlightVideoAssetJobs.get(jobKey);
  if (existingJob) {
    return existingJob;
  }

  const runJob = (async (): Promise<PreparedVideoAssets | null> => {
    try {
      let resolvedBlob: Blob | undefined = fileData;
      let resolvedImageUrl: string | undefined = mediaUrl;

      // 1. Download remote generated video into a local Blob when feasible so playback,
      // scrubbing, and IndexedDB persistence match imported local videos.
      if (!resolvedBlob && downloadRemoteBlob && mediaUrl && /^https?:\/\//i.test(mediaUrl)) {
        const downloaded = await tryDownloadRemoteVideoBlob(mediaUrl, isCancelled);
        if (isCancelled()) return null;

        if (downloaded.contentType?.startsWith('image/')) {
          // Server returned an image instead of a video — circuit-break video decoding cleanly
          failureGuard.recordFailure(sourceKey, { permanent: true });
          const staticResult: PreparedVideoAssets = {
            imageUrl: mediaUrl,
            videoPosterUrl: existingPosterUrl || mediaUrl,
            thumbnailUrl: existingPosterUrl || mediaUrl,
            closeupThumbnailUrl: existingPosterUrl || mediaUrl,
            fullDetailThumbnailUrl: existingPosterUrl || mediaUrl,
            microLodThumbnailUrl: existingPosterUrl || mediaUrl,
            blurPlaceholderUrl: existingPosterUrl || mediaUrl,
            isStaticFallback: true,
          };
          await warmVideoPosterTexture(staticResult.videoPosterUrl!);
          return staticResult;
        }

        if (downloaded.blob) {
          resolvedBlob = downloaded.blob;
          resolvedImageUrl = URL.createObjectURL(downloaded.blob);
        }
      }

      if (isCancelled()) return null;

      // 2. Single-pass native poster + metadata capture (or reuse existing valid poster)
      let videoPosterUrl = existingPosterUrl;
      let nativeWidth: number | undefined;
      let nativeHeight: number | undefined;
      let videoDuration: number | undefined;

      if (!videoPosterUrl) {
        if (failureGuard.shouldSkip(sourceKey)) {
          return resolvedBlob
            ? { imageUrl: resolvedImageUrl, fileData: resolvedBlob }
            : null;
        }
        const decodeSource: string | Blob | undefined = resolvedBlob || mediaUrl;
        if (!decodeSource) return null;

        try {
          const captured = await captureVideoPosterWithMetadata(decodeSource, isCancelled);
          if (isCancelled()) return null;
          if (captured.posterUrl) {
            videoPosterUrl = captured.posterUrl;
            nativeWidth = captured.width;
            nativeHeight = captured.height;
            videoDuration = captured.duration;
            failureGuard.clear(sourceKey);
          } else {
            failureGuard.recordFailure(sourceKey);
          }
        } catch (err) {
          console.warn(`[VideoAssetPipeline] Poster extraction failed for card ${cardId}:`, err);
          failureGuard.recordFailure(sourceKey);
          return resolvedBlob
            ? { imageUrl: resolvedImageUrl, fileData: resolvedBlob }
            : null;
        }
      }

      if (!videoPosterUrl || isCancelled()) {
        return resolvedBlob
          ? { imageUrl: resolvedImageUrl, fileData: resolvedBlob }
          : null;
      }

      // 3. Build full 5-tier static LOD pyramid from the single captured poster
      //    (exact parity with imported video pipeline in App.tsx:3166-3188)
      const posterBlob = videoPosterUrl.startsWith('data:')
        ? dataUrlToBlob(videoPosterUrl)
        : null;
      const lodSource: Blob | string = posterBlob || videoPosterUrl;

      await yieldToMain();
      if (isCancelled()) return null;

      let closeupThumbnailUrl: string | undefined;
      let microLodThumbnailUrl: string | undefined;
      let blurPlaceholderUrl: string | undefined;
      let fullDetailThumbnailUrl: string | undefined;

      try {
        closeupThumbnailUrl = await generatePosterLod(lodSource, 256);
        await yieldToMain();
        if (isCancelled()) return null;

        microLodThumbnailUrl = await generatePosterLod(lodSource, 64);
        await yieldToMain();
        if (isCancelled()) return null;

        blurPlaceholderUrl = await generatePosterLod(lodSource, 64, 4);
        await yieldToMain();
        if (isCancelled()) return null;

        fullDetailThumbnailUrl = await generatePosterLod(lodSource, 128);
      } catch (lodErr) {
        console.warn(`[VideoAssetPipeline] LOD generation fallback for card ${cardId}:`, lodErr);
      }

      const thumbnailUrl = closeupThumbnailUrl || videoPosterUrl;

      if (thumbnailUrl) {
        thumbCache.set(cardId, thumbnailUrl);
        if (mediaUrl) thumbCache.set(mediaUrl, thumbnailUrl);
        if (resolvedImageUrl) thumbCache.set(resolvedImageUrl, thumbnailUrl);
      }

      // 4. Pre-warm the native poster into Canvas texture cache BEFORE updating React state
      await warmVideoPosterTexture(videoPosterUrl || thumbnailUrl);

      if (isCancelled()) return null;

      return {
        imageUrl: resolvedImageUrl,
        fileData: resolvedBlob,
        videoPosterUrl,
        thumbnailUrl,
        closeupThumbnailUrl: closeupThumbnailUrl || thumbnailUrl,
        fullDetailThumbnailUrl: fullDetailThumbnailUrl || thumbnailUrl,
        microLodThumbnailUrl: microLodThumbnailUrl || thumbnailUrl,
        blurPlaceholderUrl: blurPlaceholderUrl || microLodThumbnailUrl || thumbnailUrl,
        nativeWidth,
        nativeHeight,
        videoDuration,
      };
    } finally {
      inFlightVideoAssetJobs.delete(jobKey);
    }
  })();

  inFlightVideoAssetJobs.set(jobKey, runJob);
  return runJob;
}
