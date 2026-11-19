import test from 'node:test';
import assert from 'node:assert/strict';
import {
  defaultWaitForVideoFrameSettle,
  executeVideoPauseTransition,
  type VideoElementLike,
} from '../../src/utils/videoPauseTransition';

function makeMockVideo(overrides: Partial<VideoElementLike> = {}): VideoElementLike & {
  emit: (type: string) => void;
} {
  const listeners = new Map<string, Set<() => void>>();
  return {
    paused: false,
    seeking: false,
    readyState: 4,
    currentTime: 2.5,
    videoWidth: 1280,
    videoHeight: 720,
    pause() {
      this.paused = true;
    },
    addEventListener(type, listener) {
      let set = listeners.get(type);
      if (!set) {
        set = new Set();
        listeners.set(type, set);
      }
      set.add(listener);
    },
    removeEventListener(type, listener) {
      listeners.get(type)?.delete(listener);
    },
    emit(type) {
      listeners.get(type)?.forEach((fn) => fn());
    },
    ...overrides,
  };
}

test('executeVideoPauseTransition pauses video immediately, preloads thumb/poster, commits, and waits for paint before switching', async () => {
  const events: string[] = [];
  const video = makeMockVideo({
    pause() {
      video.paused = true;
      events.push('pause');
    },
  });

  const result = await executeVideoPauseTransition({
    video,
    includeOriginalTier: true,
    captureFrame: (v) => {
      events.push('capture');
      return { thumbUrl: 'data:image/jpeg;base64,thumb', posterUrl: 'data:image/jpeg;base64,poster', currentTime: v.currentTime };
    },
    preloadImage: async (url, kind) => {
      events.push(`preload:${kind}:${url}`);
    },
    commitCapturedFrame: () => {
      events.push('commit');
    },
    waitForNextPaint: async () => {
      events.push('paint');
    },
  });

  assert.equal(result, 'completed');
  assert.equal(video.paused, true);
  assert.deepEqual(events, [
    'pause',
    'capture',
    'preload:thumb:data:image/jpeg;base64,thumb',
    'preload:full:data:image/jpeg;base64,poster',
    'preload:original:data:image/jpeg;base64,poster',
    'commit',
    'paint',
  ]);
});

test('executeVideoPauseTransition waits for seeking video to settle before capturing frame', async () => {
  const events: string[] = [];
  const video = makeMockVideo({
    seeking: true,
    readyState: 1,
    currentTime: 4.2,
  });

  setTimeout(() => {
    video.seeking = false;
    video.readyState = 4;
    events.push('seeked');
    video.emit('seeked');
  }, 15);

  const result = await executeVideoPauseTransition({
    video,
    waitForFrameSettle: (v) => defaultWaitForVideoFrameSettle(v, 200),
    captureFrame: () => {
      events.push('capture');
      assert.equal(video.seeking, false);
      assert.equal(video.readyState, 4);
      return { thumbUrl: 'thumb-4.2', posterUrl: 'poster-4.2', currentTime: 4.2 };
    },
    preloadImage: async () => {
      events.push('preload');
    },
    commitCapturedFrame: () => {
      events.push('commit');
    },
    waitForNextPaint: async () => {
      events.push('paint');
    },
  });

  assert.equal(result, 'completed');
  assert.deepEqual(events, ['seeked', 'capture', 'preload', 'preload', 'commit', 'paint']);
});

test('executeVideoPauseTransition aborts cleanly without committing if user resumes play mid-preload', async () => {
  let cancelled = false;
  let committed = false;
  const video = makeMockVideo();

  const result = await executeVideoPauseTransition({
    video,
    isCancelled: () => cancelled,
    captureFrame: () => ({ thumbUrl: 'thumb', posterUrl: 'poster', currentTime: 2.5 }),
    preloadImage: async () => {
      // User clicks play again before thumbnail finishes decoding
      cancelled = true;
    },
    commitCapturedFrame: () => {
      committed = true;
    },
    waitForNextPaint: async () => {},
  });

  assert.equal(result, 'cancelled');
  assert.equal(committed, false);
});

test('executeVideoPauseTransition returns fallback without hanging when frame capture fails or video element is missing', async () => {
  const missingResult = await executeVideoPauseTransition({
    video: null,
    captureFrame: () => null,
    preloadImage: async () => {},
    commitCapturedFrame: () => {},
    waitForNextPaint: async () => {},
  });
  assert.equal(missingResult, 'fallback');

  const taintedVideo = makeMockVideo();
  const taintedResult = await executeVideoPauseTransition({
    video: taintedVideo,
    captureFrame: () => null,
    preloadImage: async () => {},
    commitCapturedFrame: () => {},
    waitForNextPaint: async () => {},
  });
  assert.equal(taintedResult, 'fallback');
  assert.equal(taintedVideo.paused, true);
});
