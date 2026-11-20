import React, { useEffect, useLayoutEffect, useRef } from 'react';
import {
  getOrLoadCanvasImage,
  calculateObjectCover,
} from '../utils/imageTextureCache';
import { getOrLoadThumbImage, thumbCache, thumbImageCache } from '../utils/thumbnail';
import { cardOutline } from '../utils/cardLodAppearance';
import {
  shouldPreserveCardCanvasBackingStore,
  computeCardCanvasTargetDpr,
  shouldSkipCardCanvasGestureRedraw,
} from '../utils/viewportCulling';
import { canUpgradeCardDuringGesture, CANVAS_HYBRID_POINTER_WAKE_EVENT } from '../utils/canvasPerformance';

export interface CardImageCanvasProps {
  cardId?: string;
  thumbnailUrl?: string | null;
  blurPlaceholderUrl?: string | null;
  imageUrl?: string | null;
  originalImageUrl?: string | null;
  showOriginal?: boolean;
  width: number;
  height: number;
  dpr?: number;
  state?: string;
  isZooming?: boolean;
  disableTransition?: boolean;
  className?: string;
  onLoaded?: () => void;
}

/**
 * High-performance Canvas renderer for Card Images across all three LOD tiers:
 * - Micro: Ultra-fast 64px thumbnail loaded instantly as baseline placeholder
 * - Full: Standard high-definition preview image with smooth asynchronous loading
 * - Original: Ultra-high-resolution original image activated on deep zoom
 * 
 * Complies with AGENTS.md Architecture Constraints:
 * - Data-DOM Decoupling: Zero DOM <img> tags created. Pure hardware-accelerated Canvas.
 * - Intent-Driven Lazy Restoration: Instant degradation to Full/Micro upon motion.
 */
export const CardImageCanvas: React.FC<CardImageCanvasProps> = React.memo(function CardImageCanvas({
  cardId,
  thumbnailUrl,
  blurPlaceholderUrl,
  imageUrl,
  originalImageUrl,
  showOriginal = false,
  width,
  height,
  dpr = 1,
  state,
  isZooming = false,
  disableTransition = false,
  className = '',
  onLoaded,
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const paintedNoticeFrameRef = useRef<number | null>(null);
  const paintedNoticeCardRef = useRef<string | null>(null);

  // Image transition refs for smooth double-buffered cross-fade when imageUrl changes
  const prevImgRef = useRef<{ url: string; img: HTMLImageElement } | null>(null);
  const transitionRef = useRef<{ prevImg: HTMLImageElement; fadeStart: number } | null>(null);
  const lastLoadedUrlRef = useRef<string | null>(null);
  const fadeStartTimeRef = useRef<number | null>(null);
  const isFadingOriginalRef = useRef<boolean>(false);
  const needsRestoreRedrawRef = useRef<boolean>(false);
  const lastDrawKeyRef = useRef<string | null>(null);
  const lastPaintedMetaRef = useRef<{
    cardId?: string;
    imageUrl?: string | null;
    width: number;
    height: number;
    effectiveShowOriginal: boolean;
  } | null>(null);

  // Keep latest props in refs to avoid re-binding callbacks
  const propsRef = useRef({
    cardId,
    thumbnailUrl,
    blurPlaceholderUrl,
    imageUrl,
    originalImageUrl,
    showOriginal,
    width,
    height,
    dpr,
    state,
    isZooming,
    disableTransition,
    onLoaded,
  });
  propsRef.current = {
    cardId,
    thumbnailUrl,
    blurPlaceholderUrl,
    imageUrl,
    originalImageUrl,
    showOriginal,
    width,
    height,
    dpr,
    state,
    isZooming,
    disableTransition,
    onLoaded,
  };

  // When card entrance lands or when batch entrance finishes, re-schedule draw to upgrade from thumbnail to full proxy texture
  useEffect(() => {
    const handleEntrance = (e: Event) => {
      const customEvt = e as CustomEvent<{ cardId?: string }>;
      if (!customEvt.detail?.cardId || customEvt.detail.cardId === cardId) {
        scheduleDraw();
      }
    };
    const handleBatchComplete = () => {
      scheduleDraw();
    };
    window.addEventListener('card-entrance-complete', handleEntrance as EventListener);
    window.addEventListener('card-batch-entrance-complete', handleBatchComplete as EventListener);
    return () => {
      window.removeEventListener('card-entrance-complete', handleEntrance as EventListener);
      window.removeEventListener('card-batch-entrance-complete', handleBatchComplete as EventListener);
    };
  }, [cardId]);

  const scheduleDraw = () => {
    if (rafIdRef.current !== null) return;
    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      draw();
    });
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: false, willReadFrequently: false });
    if (!ctx) return;

    const {
      cardId,
      thumbnailUrl,
      blurPlaceholderUrl,
      imageUrl,
      originalImageUrl,
      showOriginal,
      width: w,
      height: h,
      dpr: currentDpr,
      state: cardState,
      isZooming: zooming,
      disableTransition: noUrlTransition,
    } = propsRef.current;

    if (w <= 0 || h <= 0) return;

    // Determine target canvas pixel resolution
    const rawGestureActive = typeof window !== 'undefined' && (
      Boolean((window as any).isDraggingCard) || 
      Boolean((window as any).isDraggingCanvas) ||
      Boolean((window as any).isZoomingCanvas) ||
      document.getElementById('canvas-workspace')?.getAttribute('data-gesture') === 'true' ||
      document.getElementById('canvas-workspace')?.getAttribute('data-zooming') === 'true' ||
      document.getElementById('canvas-workspace')?.getAttribute('data-panning') === 'true'
    );
    const isGestureActive = rawGestureActive && !canUpgradeCardDuringGesture(cardId);
    const effectiveShowOriginal = Boolean(showOriginal);

    // 1. Check loaded states for Placeholder (prefer pre-baked blur), Micro, Full, and Original
    const effectiveThumbUrl =
      thumbnailUrl ||
      blurPlaceholderUrl ||
      (cardId ? thumbCache.get(cardId) : undefined) ||
      (imageUrl ? thumbCache.get(imageUrl) : undefined);

    const placeholderImg = effectiveThumbUrl
      ? getOrLoadThumbImage(effectiveThumbUrl, scheduleDraw)
      : null;

    // Direct synchronous check from thumbImageCache for zero-lag paint
    const cachedThumbImg = effectiveThumbUrl
      ? thumbImageCache.get(effectiveThumbUrl)
      : (cardId ? thumbImageCache.get(thumbCache.get(cardId) || '') : null);

    // Always initiate loading for the full-resolution preview image
    const fullImg = imageUrl
      ? getOrLoadCanvasImage(imageUrl, scheduleDraw, 'full')
      : null;

    const origImg = (effectiveShowOriginal && originalImageUrl)
      ? getOrLoadCanvasImage(originalImageUrl, scheduleDraw, 'original')
      : null;
    const origImgReady = Boolean(effectiveShowOriginal && origImg && origImg.complete && origImg.naturalWidth > 0);

    const screenDpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;

    // Dynamic resolution allocation:
    // - Full LOD (!effectiveShowOriginal): proxy image is ~1200px max edge. Cap buffer to match proxy's resolution.
    // - Original LOD (effectiveShowOriginal): match original image's native resolution directly (up to 4K 4096px).
    const actualDpr = computeCardCanvasTargetDpr(
      w,
      h,
      screenDpr,
      currentDpr || screenDpr,
      origImgReady,
      origImgReady && origImg ? origImg.naturalWidth : 0,
      origImgReady && origImg ? origImg.naturalHeight : 0
    );

    const targetPxW = Math.round(w * actualDpr);
    const targetPxH = Math.round(h * actualDpr);
    const isGenerating = cardState === 'generating';

    if (
      !shouldPreserveCardCanvasBackingStore(
        canvas.width,
        canvas.height,
        targetPxW,
        targetPxH,
        origImgReady,
        isGenerating,
        rawGestureActive
      ) &&
      (canvas.width !== targetPxW || canvas.height !== targetPxH)
    ) {
      canvas.width = targetPxW;
      canvas.height = targetPxH;
      lastDrawKeyRef.current = null;
    }

    const fullImgReady = Boolean(fullImg && fullImg.complete && fullImg.naturalWidth > 0);
    const thumbReadyImg = (placeholderImg && placeholderImg.complete && placeholderImg.naturalWidth > 0)
      ? placeholderImg
      : (cachedThumbImg && cachedThumbImg.complete && cachedThumbImg.naturalWidth > 0 ? cachedThumbImg : null);
    const useLowSmoothing = Boolean(isGestureActive && !effectiveShowOriginal);

    // Track first paint completeness for Zero-Flicker Handoff
    const hasMedia = Boolean(thumbnailUrl || imageUrl || originalImageUrl);
    let isPainted = false;

    if (!hasMedia) {
      isPainted = true;
    } else if (imageUrl) {
      const fullImgDone = Boolean(fullImg && fullImg.complete);
      const origImgDone = Boolean(effectiveShowOriginal && origImg && origImg.complete);
      isPainted = fullImgDone || origImgDone;
    } else {
      const placeholderImgDone = Boolean(placeholderImg && placeholderImg.complete);
      isPainted = placeholderImgDone;
    }

    const ensurePaintedRegistered = () => {
      if (!isPainted) return;
      propsRef.current.onLoaded?.();
      if (cardId && typeof window !== 'undefined') {
        if (!(window as any).__paintedCardIds) {
          (window as any).__paintedCardIds = new Set<string>();
        }
        if (!(window as any).__paintedCardIds.has(cardId) && paintedNoticeCardRef.current !== cardId) {
          paintedNoticeCardRef.current = cardId;
          // A completed draw in useLayoutEffect has not necessarily reached the
          // screen. Let the browser present it before retiring the Nano underlay.
          paintedNoticeFrameRef.current = requestAnimationFrame(() => {
            paintedNoticeFrameRef.current = requestAnimationFrame(() => {
              paintedNoticeFrameRef.current = null;
              paintedNoticeCardRef.current = null;
              if (canvasRef.current && propsRef.current.cardId === cardId) {
                (window as any).__paintedCardIds.add(cardId);
                window.dispatchEvent(new CustomEvent('card-painted', { detail: { cardId } }));
              }
            });
          });
        }
      }
    };

    // Track image URL transition for seamless double-buffered image switching
    if (imageUrl && imageUrl !== lastLoadedUrlRef.current) {
      if (fullImgReady && fullImg) {
        if (!noUrlTransition && prevImgRef.current && prevImgRef.current.url !== imageUrl && prevImgRef.current.img) {
          transitionRef.current = {
            prevImg: prevImgRef.current.img,
            fadeStart: performance.now(),
          };
        } else if (noUrlTransition) {
          transitionRef.current = null;
        }
        lastLoadedUrlRef.current = imageUrl;
        prevImgRef.current = { url: imageUrl, img: fullImg };
      }
    }

    // Skip redundant 4096x4096 canvas clear + redraw when DPR scale tier steps (e.g. 2.25 -> 3.0 -> 4.0)
    // or hybrid pointer wake fires while the backing store resolution and rendered bitmap are unchanged.
    const drawKey = `${canvas.width}x${canvas.height}:${w}x${h}:${effectiveThumbUrl || ''}:${imageUrl || ''}:${originalImageUrl || ''}:${effectiveShowOriginal ? 1 : 0}:${origImgReady ? 1 : 0}:${fullImgReady ? 1 : 0}:${thumbReadyImg ? 1 : 0}:${isGenerating ? 1 : 0}:${useLowSmoothing ? 1 : 0}`;
    if (
      drawKey === lastDrawKeyRef.current &&
      !transitionRef.current &&
      !isFadingOriginalRef.current
    ) {
      ensurePaintedRegistered();
      needsRestoreRedrawRef.current = Boolean(
        useLowSmoothing ||
        !isPainted ||
        (showOriginal && !origImgReady)
      );
      return;
    }

    const prevMeta = lastPaintedMetaRef.current;
    if (
      shouldSkipCardCanvasGestureRedraw({
        isGestureActive,
        hasPaintedFrame: lastDrawKeyRef.current !== null && prevMeta !== null,
        sameCardAndImage: Boolean(prevMeta && prevMeta.cardId === cardId && prevMeta.imageUrl === imageUrl),
        sameDimensions: Boolean(prevMeta && prevMeta.width === w && prevMeta.height === h),
        hasBackingStore: canvas.width > 0 && canvas.height > 0,
        isGenerating,
        hasActiveTransition: Boolean(transitionRef.current),
        isUpgradingToOriginal: Boolean(origImgReady && !prevMeta?.effectiveShowOriginal),
      })
    ) {
      ensurePaintedRegistered();
      needsRestoreRedrawRef.current = true;
      return;
    }

    const backingScaleX = canvas.width / w;
    const backingScaleY = canvas.height / h;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Coordinate space normalization (from physical pixels to CSS pixels)
    ctx.scale(backingScaleX, backingScaleY);

    // Clip strictly to card squircle path to prevent any image corner bleeding/leakage
    ctx.save();
    ctx.clip(cardOutline(w, h, true, true));

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = useLowSmoothing ? 'low' : 'high';

    // Helper to draw an image with object-cover calculation
    const drawCover = (img: HTMLImageElement, alpha: number = 1) => {
      if (!img || !img.complete || img.naturalWidth === 0) return;
      const { sx, sy, sw, sh } = calculateObjectCover(
        img.naturalWidth,
        img.naturalHeight,
        w,
        h
      );
      ctx.globalAlpha = alpha;
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
    };

    // When the 4K original tier is ready and no URL transition is active, draw only origImg
    // instead of rasterizing both fullImg (16.7M px) and origImg (16.7M px) across the 4K backing store.
    if (origImgReady && origImg && !transitionRef.current) {
      drawCover(origImg, 1);
      if (fullImgReady && fullImg && imageUrl) {
        prevImgRef.current = { url: imageUrl, img: fullImg };
      }
      isFadingOriginalRef.current = false;
      fadeStartTimeRef.current = null;
    } else {
      // 2. Base / Underlay Rendering (Keep rendering previous image or instant thumbnail placeholder while full image loads)
      if (!fullImgReady && !transitionRef.current && prevImgRef.current?.img) {
        drawCover(prevImgRef.current.img, 1);
      } else if (!fullImgReady && thumbReadyImg) {
        drawCover(thumbReadyImg, 1);
      }

      // 3. New Image Rendering (Bottom Layer - 100% Opaque)
      if (fullImgReady && fullImg) {
        if (isGenerating && !imageUrl) {
          ctx.filter = 'blur(12px) brightness(0.95)';
          drawCover(fullImg, 1);
          ctx.filter = 'none';
        } else {
          drawCover(fullImg, 1);
        }
        prevImgRef.current = { url: imageUrl!, img: fullImg };
      }

      // 4. Image Transition Cross-Fade (Top Layer: Previous Image fades out 1.0 -> 0.0 over 500ms)
      if (transitionRef.current) {
        const now = performance.now();
        const elapsed = now - transitionRef.current.fadeStart;
        const FADE_DURATION = 500;
        const progress = Math.min(1, elapsed / FADE_DURATION);
        const fadeAlpha = 1 - progress;

        if (fadeAlpha > 0) {
          drawCover(transitionRef.current.prevImg, fadeAlpha);
          scheduleDraw();
        } else {
          transitionRef.current = null;
        }
      }

      // 5. Top Tier: Render Original High-Res if fading during URL transition
      if (origImgReady && origImg) {
        drawCover(origImg, 1);
      }
      isFadingOriginalRef.current = false;
      fadeStartTimeRef.current = null;
    }

    ensurePaintedRegistered();

    // Once an opaque bitmap covers the canvas, clear CSS background-image so the compositor
    // does not blend an extra image layer behind an alpha:true 4K canvas on every zoom frame.
    if ((origImgReady || fullImgReady) && !transitionRef.current && !isGenerating) {
      if (canvas.style.backgroundImage !== 'none') {
        canvas.style.backgroundImage = 'none';
      }
    }

    lastDrawKeyRef.current = transitionRef.current ? null : drawKey;
    lastPaintedMetaRef.current = transitionRef.current
      ? null
      : {
          cardId,
          imageUrl,
          width: w,
          height: h,
          effectiveShowOriginal: Boolean(origImgReady),
        };
    needsRestoreRedrawRef.current = Boolean(
      useLowSmoothing ||
      !isPainted ||
      transitionRef.current !== null ||
      (showOriginal && !origImgReady) ||
      isFadingOriginalRef.current
    );

    ctx.restore(); // Restore clip path
    ctx.restore();
  };

  // Trigger draw synchronously on mount and prop updates to eliminate the 1-frame asynchronous lag!
  useLayoutEffect(() => {
    // Cancel any pending RAF since we are drawing synchronously now
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    draw();
  }, [
    cardId,
    thumbnailUrl,
    blurPlaceholderUrl,
    imageUrl,
    originalImageUrl,
    showOriginal,
    width,
    height,
    dpr,
    state,
    disableTransition,
  ]);

  // Clean up painted registration on unmount
  useEffect(() => {
    return () => {
      lastDrawKeyRef.current = null;
      lastPaintedMetaRef.current = null;
      if (paintedNoticeFrameRef.current !== null) {
        cancelAnimationFrame(paintedNoticeFrameRef.current);
        paintedNoticeFrameRef.current = null;
        paintedNoticeCardRef.current = null;
      }
      if (cardId && typeof window !== 'undefined') {
        if ((window as any).__paintedCardIds) {
          (window as any).__paintedCardIds.delete(cardId);
          window.dispatchEvent(new CustomEvent('card-painted', { detail: { cardId } }));
        }
      }
    };
  }, [cardId]);

  // Listen for idle canvas styles restoration
  useEffect(() => {
    const handleStylesRestored = () => {
      const workspace = document.getElementById('canvas-workspace');
      if (
        workspace?.getAttribute('data-scale-micro') === 'true' ||
        workspace?.getAttribute('data-nano-retired') === 'true'
      ) {
        return;
      }
      if (!needsRestoreRedrawRef.current) {
        return;
      }
      scheduleDraw();
    };
    const handleHybridWake = () => {
      if (needsRestoreRedrawRef.current && canUpgradeCardDuringGesture(propsRef.current.cardId)) {
        scheduleDraw();
      }
    };
    window.addEventListener('canvas-styles-restored', handleStylesRestored);
    window.addEventListener(CANVAS_HYBRID_POINTER_WAKE_EVENT, handleHybridWake);
    return () => {
      window.removeEventListener('canvas-styles-restored', handleStylesRestored);
      window.removeEventListener(CANVAS_HYBRID_POINTER_WAKE_EVENT, handleHybridWake);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, []);

  const fallbackBgUrl =
    thumbnailUrl ||
    blurPlaceholderUrl ||
    (cardId ? thumbCache.get(cardId) : undefined) ||
    imageUrl;

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none squircle ${className}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backfaceVisibility: 'hidden',
        backgroundImage: fallbackBgUrl ? `url(${fallbackBgUrl})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    />
  );
});
