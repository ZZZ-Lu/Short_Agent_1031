import { useEffect, useRef } from 'react';
import type { MotionValue } from 'motion/react';
import { getCappedDpr } from '../utils/devicePixelBudget';
import { computeGridPatternSpec, DEFAULT_GRID_DOT_RADIUS_CSS } from '../utils/viewportCulling';

/** A repeating texture keeps the number of draw calls constant at every zoom. */
export function CanvasGridBackground({ tx, ty, scale }: {
  tx: MotionValue<number>;
  ty: MotionValue<number>;
  scale: MotionValue<number>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const tile = document.createElement('canvas');
    tile.width = tile.height = 64;
    const tileCtx = tile.getContext('2d');
    if (!ctx || !tileCtx) return;
    let pattern: CanvasPattern | null = null;
    let raf: number | null = null;
    let lastRadius = -1;
    let lastTileSize = -1;

    const draw = () => {
      raf = null;
      const width = window.innerWidth;
      const height = window.innerHeight;
      const workspace = document.getElementById('canvas-workspace');
      const isGestureActive = Boolean(
        workspace &&
        (workspace.getAttribute('data-gesture') === 'true' ||
          workspace.getAttribute('data-zooming') === 'true' ||
          workspace.getAttribute('data-panning') === 'true')
      );
      // Drop grid backing store to 1x DPR during active gestures, then restore crisp 1.5x at rest.
      const dpr = isGestureActive ? 1 : getCappedDpr(width, height, 1.5);
      const pixelWidth = Math.round(width * dpr);
      const pixelHeight = Math.round(height * dpr);
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
      }
      const rawScale = scale.get();
      const { spacing, tileSize, dotRadiusTile } = computeGridPatternSpec(
        rawScale,
        dpr,
        48,
        DEFAULT_GRID_DOT_RADIUS_CSS,
        isGestureActive
      );
      const radiusTolerance = isGestureActive ? 0.08 : 0.03;
      if (!pattern || tileSize !== lastTileSize || Math.abs(dotRadiusTile - lastRadius) > radiusTolerance) {
        if (tile.width !== tileSize || tile.height !== tileSize) {
          tile.width = tileSize;
          tile.height = tileSize;
        } else {
          tileCtx.clearRect(0, 0, tileSize, tileSize);
        }
        const center = tileSize / 2;
        tileCtx.fillStyle = '#8b8b95';
        tileCtx.beginPath();
        tileCtx.arc(center, center, dotRadiusTile, 0, Math.PI * 2);
        tileCtx.fill();
        pattern = ctx.createPattern(tile, 'repeat');
        lastTileSize = tileSize;
        lastRadius = dotRadiusTile;
      }
      if (!pattern) return;
      const offsetX = ((tx.get() % spacing) + spacing) % spacing;
      const offsetY = ((ty.get() % spacing) + spacing) % spacing;
      const tileScale = spacing / tileSize;
      pattern.setTransform(new DOMMatrix([tileScale, 0, 0, tileScale, offsetX, offsetY]));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, width, height);
    };
    const schedule = () => {
      if (raf === null) raf = requestAnimationFrame(draw);
    };
    const unsubs = [tx, ty, scale].map(value => value.on('change', schedule));
    window.addEventListener('resize', schedule);
    window.addEventListener('canvas-styles-restored', schedule);
    schedule();
    return () => {
      unsubs.forEach(unsub => unsub());
      window.removeEventListener('resize', schedule);
      window.removeEventListener('canvas-styles-restored', schedule);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, [tx, ty, scale]);

  return <canvas ref={canvasRef} id="grid-bg-overlay" aria-hidden="true" className="fixed inset-0 h-screen w-screen pointer-events-none opacity-30 dark:opacity-15 z-0" />;
}
