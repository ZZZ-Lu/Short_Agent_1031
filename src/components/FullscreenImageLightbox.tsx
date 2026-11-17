import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
} from 'motion/react';
import { RotateCcw, X, ZoomIn, ZoomOut } from 'lucide-react';
import {
  computeCursorCenteredZoomTransform,
  computeOriginTransitionTransform,
  computePannedTransform,
  computeWheelZoomTransform,
  interpolateLightboxTransition,
  type LightboxCameraTransform,
  type LightboxSourceRect,
} from '../utils/imageLightboxTransform';

export interface FullscreenImageLightboxData {
  src: string;
  title: string;
  subtitle?: string;
  originRect?: LightboxSourceRect | null;
  aspectRatio?: number;
  cardBorderRadius?: number;
  sourceId?: string;
}

export interface FullscreenImageLightboxProps {
  image: FullscreenImageLightboxData | null;
  onClose: () => void;
}

const SMOOTH_ZOOM_EASE: [number, number, number, number] = [0.2, 0.9, 0.3, 1];
const LIGHTBOX_ENTER_EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];
const HIGH_ZOOM_EXIT_EASE: [number, number, number, number] = [0.38, 0.08, 0.2, 1];
const ENTER_DURATION = 0.28;
const BASE_EXIT_DURATION = 0.26;
const HIGH_ZOOM_EXIT_DURATION = 0.34;

export const FullscreenImageLightbox = React.memo(function FullscreenImageLightbox({
  image,
  onClose,
}: FullscreenImageLightboxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const scalePercentRef = useRef<HTMLSpanElement>(null);
  const targetRef = useRef<LightboxCameraTransform>({ x: 0, y: 0, scale: 1 });
  const isClosingRef = useRef(false);
  const activeTransitionRef = useRef<{ stop: () => void } | null>(null);
  const enterRafRef = useRef<number | null>(null);
  const dragStateRef = useRef<{
    pointerId: number;
    startClientX: number;
    startClientY: number;
    startX: number;
    startY: number;
    moved: boolean;
  } | null>(null);

  const tx = useMotionValue(0);
  const ty = useMotionValue(0);
  const tScale = useMotionValue(1);
  const backdropOpacity = useMotionValue(0);
  const hudOpacity = useMotionValue(0);
  const transformStyle = useMotionTemplate`translate3d(${tx}px, ${ty}px, 0px) scale(${tScale})`;

  const [isDragging, setIsDragging] = useState(false);

  // Direct DOM write keeps the zoom badge synchronized with zero per-frame React re-renders
  useMotionValueEvent(tScale, 'change', (latest) => {
    if (scalePercentRef.current) {
      const nextText = `${Math.round(latest * 100)}%`;
      if (scalePercentRef.current.textContent !== nextText) {
        scalePercentRef.current.textContent = nextText;
      }
    }
  });

  const stopAllMotion = useCallback(() => {
    if (enterRafRef.current !== null) {
      cancelAnimationFrame(enterRafRef.current);
      enterRafRef.current = null;
    }
    if (activeTransitionRef.current) {
      activeTransitionRef.current.stop();
      activeTransitionRef.current = null;
    }
    tx.stop();
    ty.stop();
    tScale.stop();
    backdropOpacity.stop();
    hudOpacity.stop();
  }, [tx, ty, tScale, backdropOpacity, hudOpacity]);

  const getOriginTransform = useCallback((imgData: FullscreenImageLightboxData | null) => {
    const vw = typeof window !== 'undefined' ? window.innerWidth || 1440 : 1440;
    const vh = typeof window !== 'undefined' ? window.innerHeight || 900 : 900;
    const imgEl = imageRef.current;
    const renderedWidth = imgEl && imgEl.offsetWidth > 0 ? imgEl.offsetWidth : undefined;
    const renderedHeight = imgEl && imgEl.offsetHeight > 0 ? imgEl.offsetHeight : undefined;

    // Re-query the visible source card element if available so exit lands accurately
    let liveRect = imgData?.originRect;
    if (imgData?.sourceId && typeof document !== 'undefined') {
      const candidates = document.querySelectorAll(
        `[data-lightbox-source-id="${imgData.sourceId}"]`
      );
      for (const node of candidates) {
        const r = (node as HTMLElement).getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          liveRect = { left: r.left, top: r.top, width: r.width, height: r.height };
          break;
        }
      }
    }

    return computeOriginTransitionTransform({
      originRect: liveRect,
      viewportWidth: vw,
      viewportHeight: vh,
      imageAspectRatio: imgData?.aspectRatio,
      renderedWidth,
      renderedHeight,
    });
  }, []);

  const applySmoothTransform = useCallback(
    (next: LightboxCameraTransform, duration: number = 0.16) => {
      stopAllMotion();
      targetRef.current = next;
      if (duration <= 0) {
        tx.set(next.x);
        ty.set(next.y);
        tScale.set(next.scale);
      } else {
        animate(tx, next.x, { type: 'tween', duration, ease: SMOOTH_ZOOM_EASE });
        animate(ty, next.y, { type: 'tween', duration, ease: SMOOTH_ZOOM_EASE });
        animate(tScale, next.scale, { type: 'tween', duration, ease: SMOOTH_ZOOM_EASE });
      }
    },
    [stopAllMotion, tx, ty, tScale]
  );

  // Trigger reverse zoom animation back into the source card; onClose runs strictly onComplete
  const requestCloseWithAnimation = useCallback(() => {
    if (!image || isClosingRef.current) return;
    isClosingRef.current = true;
    dragStateRef.current = null;
    setIsDragging(false);

    const fromTransform: LightboxCameraTransform = {
      x: tx.get(),
      y: ty.get(),
      scale: tScale.get(),
    };
    const fromBackdrop = backdropOpacity.get();
    const fromHud = hudOpacity.get();

    stopAllMotion();
    const exitTarget = getOriginTransform(image);
    targetRef.current = exitTarget;

    const isHighZoom = fromTransform.scale > 2.5;
    const duration = isHighZoom ? HIGH_ZOOM_EXIT_DURATION : BASE_EXIT_DURATION;
    const ease = isHighZoom ? HIGH_ZOOM_EXIT_EASE : LIGHTBOX_ENTER_EASE;

    activeTransitionRef.current = animate(0, 1, {
      type: 'tween',
      duration,
      ease,
      onUpdate: (p) => {
        const next = interpolateLightboxTransition({
          from: fromTransform,
          to: exitTarget,
          progress: p,
        });
        tx.set(next.x);
        ty.set(next.y);
        tScale.set(next.scale);
        backdropOpacity.set(Math.max(0, fromBackdrop * (1 - p)));
        hudOpacity.set(Math.max(0, fromHud * (1 - Math.min(1, p * 2.4))));
      },
      onComplete: () => {
        activeTransitionRef.current = null;
        isClosingRef.current = false;
        onClose();
      },
    });
  }, [
    image,
    tx,
    ty,
    tScale,
    backdropOpacity,
    hudOpacity,
    stopAllMotion,
    getOriginTransform,
    onClose,
  ]);

  useEffect(() => {
    return () => {
      stopAllMotion();
    };
  }, [stopAllMotion]);

  const handleResetView = useCallback(() => {
    if (isClosingRef.current) return;
    applySmoothTransform({ x: 0, y: 0, scale: 1 }, 0.22);
  }, [applySmoothTransform]);

  const handleStepZoom = useCallback(
    (factor: number) => {
      if (isClosingRef.current) return;
      const el = containerRef.current;
      const rect = el?.getBoundingClientRect();
      const viewportWidth = rect?.width || window.innerWidth || 1440;
      const viewportHeight = rect?.height || window.innerHeight || 900;
      const viewportLeft = rect?.left || 0;
      const viewportTop = rect?.top || 0;
      const prev = targetRef.current;
      const next = computeCursorCenteredZoomTransform({
        prev,
        nextScale: prev.scale * factor,
        cursorX: viewportLeft + viewportWidth / 2,
        cursorY: viewportTop + viewportHeight / 2,
        viewportLeft,
        viewportTop,
        viewportWidth,
        viewportHeight,
      });
      applySmoothTransform(next, 0.2);
    },
    [applySmoothTransform]
  );

  // Enter FLIP animation from card rect -> fullscreen center whenever a new image is opened
  useEffect(() => {
    if (!image) {
      isClosingRef.current = false;
      stopAllMotion();
      return;
    }

    let cancelled = false;
    isClosingRef.current = false;
    stopAllMotion();

    const startTransform = getOriginTransform(image);
    tx.set(startTransform.x);
    ty.set(startTransform.y);
    tScale.set(startTransform.scale);
    backdropOpacity.set(0);
    hudOpacity.set(0);

    targetRef.current = { x: 0, y: 0, scale: 1 };
    setIsDragging(false);
    dragStateRef.current = null;
    if (scalePercentRef.current) {
      scalePercentRef.current.textContent = `${Math.round(startTransform.scale * 100)}%`;
    }

    const startEnterTween = () => {
      if (cancelled) return;
      // Re-sample origin once layout/image dimensions stabilize so enter starts from exact card size
      const liveStart = getOriginTransform(image);
      tx.set(liveStart.x);
      ty.set(liveStart.y);
      tScale.set(liveStart.scale);

      activeTransitionRef.current = animate(0, 1, {
        type: 'tween',
        duration: ENTER_DURATION,
        ease: LIGHTBOX_ENTER_EASE,
        onUpdate: (p) => {
          const next = interpolateLightboxTransition({
            from: liveStart,
            to: { x: 0, y: 0, scale: 1 },
            progress: p,
          });
          tx.set(next.x);
          ty.set(next.y);
          tScale.set(next.scale);
          backdropOpacity.set(p);
          hudOpacity.set(Math.min(1, Math.max(0, (p - 0.15) / 0.85)));
        },
        onComplete: () => {
          activeTransitionRef.current = null;
        },
      });
    };

    // Wait briefly for image decode + first committed frame so frame 0-2 don't stutter behind decode
    const imgEl = imageRef.current;
    const decodePromise =
      imgEl && typeof imgEl.decode === 'function' && !(imgEl.complete && imgEl.naturalWidth > 0)
        ? Promise.race([
            imgEl.decode().catch(() => {}),
            new Promise<void>((resolve) => setTimeout(resolve, 64)),
          ])
        : Promise.resolve();

    void decodePromise.then(() => {
      if (cancelled) return;
      enterRafRef.current = requestAnimationFrame(() => {
        enterRafRef.current = null;
        startEnterTween();
      });
    });

    return () => {
      cancelled = true;
      stopAllMotion();
    };
  }, [
    image,
    getOriginTransform,
    stopAllMotion,
    tx,
    ty,
    tScale,
    backdropOpacity,
    hudOpacity,
  ]);

  // Pause background floating animations behind the fullscreen blur backdrop
  useEffect(() => {
    if (!image || typeof document === 'undefined') return;
    document.body.setAttribute('data-lightbox-open', 'true');
    return () => {
      document.body.removeAttribute('data-lightbox-open');
    };
  }, [image]);

  // Escape key closes lightbox with zoom-back animation
  useEffect(() => {
    if (!image) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        requestCloseWithAnimation();
      } else if (e.key === '0' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleResetView();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [image, requestCloseWithAnimation, handleResetView]);

  // Non-passive wheel listener for silky cursor-centered zoom
  useEffect(() => {
    if (!image) return;
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.deltaY === 0 || isClosingRef.current) return;

      const rect = container.getBoundingClientRect();
      const { nextTarget, isDiscreteWheel } = computeWheelZoomTransform({
        prev: targetRef.current,
        deltaY: e.deltaY,
        cursorX: e.clientX,
        cursorY: e.clientY,
        viewportLeft: rect.left,
        viewportTop: rect.top,
        viewportWidth: rect.width,
        viewportHeight: rect.height,
      });

      applySmoothTransform(nextTarget, isDiscreteWheel ? 0.16 : 0.06);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [image, applySmoothTransform]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.stopPropagation();
      if (isClosingRef.current) return;
      if (e.button !== 0 && e.button !== 1) return;
      const targetEl = e.target as HTMLElement | null;
      if (targetEl?.closest('[data-lightbox-control="true"]')) return;

      // Sync targetRef to current animated values if user grabs mid-zoom
      const liveX = tx.get();
      const liveY = ty.get();
      const liveScale = tScale.get();
      stopAllMotion();
      backdropOpacity.set(1);
      hudOpacity.set(1);
      tx.set(liveX);
      ty.set(liveY);
      tScale.set(liveScale);
      targetRef.current = { x: liveX, y: liveY, scale: liveScale };

      dragStateRef.current = {
        pointerId: e.pointerId,
        startClientX: e.clientX,
        startClientY: e.clientY,
        startX: liveX,
        startY: liveY,
        moved: false,
      };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [tx, ty, tScale, backdropOpacity, hudOpacity, stopAllMotion]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragStateRef.current;
      if (!drag || drag.pointerId !== e.pointerId || isClosingRef.current) return;
      e.stopPropagation();

      const dx = e.clientX - drag.startClientX;
      const dy = e.clientY - drag.startClientY;
      if (!drag.moved && Math.hypot(dx, dy) > 3) {
        drag.moved = true;
        setIsDragging(true);
      }

      const next = computePannedTransform(
        { x: drag.startX, y: drag.startY, scale: targetRef.current.scale },
        dx,
        dy
      );
      targetRef.current = next;
      tx.set(next.x);
      ty.set(next.y);
    },
    [tx, ty]
  );

  const handlePointerUpOrCancel = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragStateRef.current;
      if (!drag || drag.pointerId !== e.pointerId) return;
      e.stopPropagation();
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      const wasMoved = drag.moved;
      dragStateRef.current = null;
      setIsDragging(false);

      // Clicking the blurred backdrop without dragging closes the viewer with zoom-back animation
      const targetEl = e.target as HTMLElement | null;
      const clickedBackdrop =
        !wasMoved &&
        e.button === 0 &&
        targetEl &&
        !targetEl.closest('[data-lightbox-image="true"]') &&
        !targetEl.closest('[data-lightbox-control="true"]');
      if (clickedBackdrop) {
        requestCloseWithAnimation();
      }
    },
    [requestCloseWithAnimation]
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      if (isClosingRef.current) return;
      const targetEl = e.target as HTMLElement | null;
      if (targetEl?.closest('[data-lightbox-control="true"]')) return;

      const prev = targetRef.current;
      if (Math.abs(prev.scale - 1) > 0.05 || Math.hypot(prev.x, prev.y) > 8) {
        applySmoothTransform({ x: 0, y: 0, scale: 1 }, 0.22);
        return;
      }

      const rect = e.currentTarget.getBoundingClientRect();
      const next = computeCursorCenteredZoomTransform({
        prev,
        nextScale: 2.25,
        cursorX: e.clientX,
        cursorY: e.clientY,
        viewportLeft: rect.left,
        viewportTop: rect.top,
        viewportWidth: rect.width,
        viewportHeight: rect.height,
      });
      applySmoothTransform(next, 0.22);
    },
    [applySmoothTransform]
  );

  if (!image || typeof document === 'undefined') return null;

  return createPortal(
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label={`全屏查看资产图：${image.title}`}
      data-modal="true"
      data-prevent-canvas-wheel="true"
      data-testid="fullscreen-image-lightbox"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUpOrCancel}
      onPointerCancel={handlePointerUpOrCancel}
      onDoubleClick={handleDoubleClick}
      onContextMenu={(e) => e.stopPropagation()}
      className={`fixed inset-0 z-[9999] isolate contain-layout contain-paint flex items-center justify-center overflow-hidden select-none ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
    >
      {/* Separate Backdrop Layer: promotes opacity + blur to GPU without mid-flight RenderPass teardown */}
      <motion.div
        data-testid="fullscreen-image-lightbox-backdrop"
        style={{ opacity: backdropOpacity }}
        className="absolute inset-0 z-0 bg-gray-200/75 dark:bg-neutral-900/80 backdrop-blur-[10px] will-change-opacity pointer-events-none"
      />

      {/* Top-right Close Button */}
      <motion.button
        type="button"
        data-lightbox-control="true"
        style={{ opacity: hudOpacity }}
        onClick={(e) => {
          e.stopPropagation();
          requestCloseWithAnimation();
        }}
        aria-label="退出全屏看图"
        title="关闭全屏预览 (Esc)"
        className="absolute top-5 right-5 z-20 w-10 h-10 rounded-full bg-white/85 hover:bg-white dark:bg-neutral-800/85 dark:hover:bg-neutral-700 border border-gray-300/80 dark:border-white/15 text-gray-800 dark:text-white shadow-md flex items-center justify-center transition-colors cursor-pointer"
      >
        <X className="w-5 h-5" />
      </motion.button>

      {/* Transformed Image Stage: pure GPU transform with zero border-radius invalidation */}
      <motion.div
        style={{ transform: transformStyle }}
        className="relative z-10 flex items-center justify-center will-change-transform backface-hidden origin-center pointer-events-none"
      >
        <img
          ref={imageRef}
          src={image.src}
          alt={image.title}
          data-lightbox-image="true"
          style={image.aspectRatio ? { aspectRatio: String(image.aspectRatio) } : undefined}
          draggable={false}
          decoding="async"
          referrerPolicy="no-referrer"
          className="max-w-[88vw] max-h-[84vh] w-auto h-auto rounded-none object-contain select-none pointer-events-auto"
        />
      </motion.div>

      {/* Bottom Floating HUD: Title + Zoom Controls */}
      <motion.div
        data-lightbox-control="true"
        style={{ opacity: hudOpacity }}
        onClick={(e) => e.stopPropagation()}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/85 dark:bg-neutral-900/85 backdrop-blur-md border border-gray-300/80 dark:border-white/12 text-gray-900 dark:text-white shadow-xl max-w-[90vw]"
      >
        <div className="flex flex-col min-w-0 pr-2 border-r border-gray-300/80 dark:border-white/15">
          <span className="text-xs font-semibold truncate max-w-[260px] sm:max-w-[360px]">
            {image.title}
          </span>
          {image.subtitle && (
            <span className="text-[10px] text-gray-500 dark:text-white/65 truncate max-w-[260px] sm:max-w-[360px]">
              {image.subtitle}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => handleStepZoom(0.8)}
            aria-label="缩小图片"
            title="缩小"
            className="w-7 h-7 rounded-lg hover:bg-black/5 dark:hover:bg-white/15 flex items-center justify-center transition-colors cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleResetView}
            aria-label="重置缩放比例"
            title="点击重置为 100%"
            className="min-w-[50px] px-1.5 py-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/15 text-[11px] font-mono font-semibold text-center tabular-nums transition-colors cursor-pointer"
          >
            <span ref={scalePercentRef}>100%</span>
          </button>
          <button
            type="button"
            onClick={() => handleStepZoom(1.25)}
            aria-label="放大图片"
            title="放大"
            className="w-7 h-7 rounded-lg hover:bg-black/5 dark:hover:bg-white/15 flex items-center justify-center transition-colors cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleResetView}
            aria-label="还原默认视图"
            title="复位视图"
            className="w-7 h-7 rounded-lg hover:bg-black/5 dark:hover:bg-white/15 flex items-center justify-center transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
});
