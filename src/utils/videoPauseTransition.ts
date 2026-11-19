/**
 * Pure async coordinator for pausing a video card without frame mismatch.
 *
 * Keeps the active <video> element and controls mounted until:
 * 1. Any in-flight seek settles (readyState >= 2 && !seeking).
 * 2. The paused frame's thumbnail & native poster are captured.
 * 3. Those still images are preloaded and decoded into image caches.
 * 4. The still canvas underneath has committed and painted a frame.
 *
 * Decoupled from React/DOM globals so it can be unit-tested in Node.
 */

export interface VideoElementLike {
  paused: boolean;
  seeking: boolean;
  readyState: number;
  currentTime: number;
  videoWidth: number;
  videoHeight: number;
  pause: () => void;
  addEventListener?: (type: string, listener: () => void) => void;
  removeEventListener?: (type: string, listener: () => void) => void;
}

export interface CapturedVideoPauseFrame {
  thumbUrl?: string;
  posterUrl?: string;
  currentTime?: number;
  duration?: number;
}

export interface ExecuteVideoPauseTransitionOptions {
  video: VideoElementLike | null | undefined;
  isCancelled?: () => boolean;
  captureFrame: (video: VideoElementLike) => CapturedVideoPauseFrame | null | undefined;
  preloadImage: (url: string, kind: 'thumb' | 'full' | 'original') => Promise<void>;
  commitCapturedFrame: (captured: CapturedVideoPauseFrame) => void | Promise<void>;
  waitForFrameSettle?: (video: VideoElementLike) => Promise<void>;
  waitForNextPaint?: () => Promise<void>;
  includeOriginalTier?: boolean;
}

export type VideoPauseTransitionResult = 'completed' | 'cancelled' | 'fallback';

export function defaultWaitForVideoFrameSettle(
  video: VideoElementLike,
  timeoutMs: number = 450
): Promise<void> {
  if (!video || (video.readyState >= 2 && !video.seeking)) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    let settled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const finish = () => {
      if (settled) return;
      settled = true;
      if (timer !== null) clearTimeout(timer);
      video.removeEventListener?.('seeked', check);
      video.removeEventListener?.('loadeddata', check);
      video.removeEventListener?.('canplay', check);
      resolve();
    };
    const check = () => {
      if (video.readyState >= 2 && !video.seeking) {
        finish();
      }
    };
    video.addEventListener?.('seeked', check);
    video.addEventListener?.('loadeddata', check);
    video.addEventListener?.('canplay', check);
    timer = setTimeout(finish, timeoutMs);
  });
}

export function defaultWaitForCanvasPaint(): Promise<void> {
  if (typeof requestAnimationFrame !== 'function') {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    let done = false;
    const safety = setTimeout(() => {
      if (!done) {
        done = true;
        resolve();
      }
    }, 120);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!done) {
          done = true;
          clearTimeout(safety);
          resolve();
        }
      });
    });
  });
}

export async function executeVideoPauseTransition({
  video,
  isCancelled,
  captureFrame,
  preloadImage,
  commitCapturedFrame,
  waitForFrameSettle = defaultWaitForVideoFrameSettle,
  waitForNextPaint = defaultWaitForCanvasPaint,
  includeOriginalTier = false,
}: ExecuteVideoPauseTransitionOptions): Promise<VideoPauseTransitionResult> {
  if (!video) {
    return 'fallback';
  }

  // Stop audio/playback immediately on the clicked frame while keeping <video> mounted.
  if (!video.paused) {
    try {
      video.pause();
    } catch {
      // Ignore pause errors on torn-down media elements.
    }
  }

  await waitForFrameSettle(video);
  if (isCancelled?.()) return 'cancelled';

  const captured = captureFrame(video);
  if (!captured || (!captured.thumbUrl && !captured.posterUrl)) {
    return 'fallback';
  }

  const preloadTasks: Array<Promise<void>> = [];
  if (captured.thumbUrl) {
    preloadTasks.push(preloadImage(captured.thumbUrl, 'thumb'));
  }
  if (captured.posterUrl) {
    preloadTasks.push(preloadImage(captured.posterUrl, 'full'));
    if (includeOriginalTier) {
      preloadTasks.push(preloadImage(captured.posterUrl, 'original'));
    }
  }

  if (preloadTasks.length > 0) {
    await Promise.all(preloadTasks);
  }
  if (isCancelled?.()) return 'cancelled';

  await commitCapturedFrame(captured);
  if (isCancelled?.()) return 'cancelled';

  await waitForNextPaint();
  if (isCancelled?.()) return 'cancelled';

  return 'completed';
}
