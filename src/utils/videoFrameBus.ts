/**
 * Live Video Frame Bus (Runtime Memory Snapshot Registry)
 *
 * Keeps an in-memory, zero-overhead canvas snapshot of the latest paused frame for each video card.
 * - 0ms synchronous drawing in NanoLodCanvas (no base64 serialization, no async Image loading).
 * - Guaranteed exact frame matching between DOM <video> (at currentTime) and NanoLodCanvas.
 * - Completely decouples live presentation from disk persistence (no DB writes or React re-renders on pause).
 */

const liveFrameCanvases = new Map<string, HTMLCanvasElement>();

export function captureLiveVideoFrame(cardId: string, video: HTMLVideoElement): HTMLCanvasElement | null {
  if (!cardId || !video || video.readyState < 2 || video.seeking || !video.videoWidth || !video.videoHeight) {
    return liveFrameCanvases.get(cardId) || null;
  }
  let canvas = liveFrameCanvases.get(cardId);
  if (!canvas) {
    canvas = document.createElement('canvas');
    liveFrameCanvases.set(cardId, canvas);
  }
  // Nano LOD only needs a small display proxy; retaining a 4K frame per card wastes GPU memory. Get dimensions from the video, never from the DOM layout.
  const scale = Math.min(1, 256 / Math.max(video.videoWidth, video.videoHeight));
  const width = Math.max(1, Math.round(video.videoWidth * scale));
  const height = Math.max(1, Math.round(video.videoHeight * scale));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  }
  return canvas;
}

export function getLiveVideoFrame(cardId: string): HTMLCanvasElement | null {
  const canvas = liveFrameCanvases.get(cardId);
  return (canvas && canvas.width > 0 && canvas.height > 0) ? canvas : null;
}

export function clearLiveVideoFrame(cardId: string) {
  liveFrameCanvases.delete(cardId);
}
