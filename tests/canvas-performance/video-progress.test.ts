import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clampValidVideoDuration,
  clampVideoSeekTargetTime,
  computeSeekTimeFromPercent,
  getCachedVideoDuration,
  getCachedVideoProgress,
  resolveVideoEndResetMargin,
  resolveVideoProgressDisplay,
  resolveVideoScrubSeekStep,
  setCachedVideoDuration,
  setCachedVideoProgress,
} from '../../src/utils/videoProgress';

test('resolveVideoScrubSeekStep defers before metadata, coalesces while seeking, and preempts stale seeks', () => {
  assert.deepEqual(
    resolveVideoScrubSeekStep({
      targetTime: 2.5,
      duration: 5.0,
      videoReadyState: 0,
      videoSeeking: false,
      lastSeekIssuedAtMs: 100,
      nowMs: 120,
    }),
    { action: 'defer-until-metadata', clampedTime: 2.5 }
  );

  assert.deepEqual(
    resolveVideoScrubSeekStep({
      targetTime: 3.0,
      duration: 5.0,
      videoReadyState: 2,
      videoSeeking: true,
      lastSeekIssuedAtMs: 100,
      nowMs: 140,
      preemptionTimeoutMs: 90,
    }),
    { action: 'queue-after-seeked', clampedTime: 3.0 }
  );

  assert.deepEqual(
    resolveVideoScrubSeekStep({
      targetTime: 5.0,
      duration: 5.0,
      videoReadyState: 3,
      videoSeeking: false,
      lastSeekIssuedAtMs: 100,
      nowMs: 140,
    }),
    { action: 'seek-now', clampedTime: clampVideoSeekTargetTime(5.0, 5.0) }
  );

  // Preempts if an in-flight seek takes longer than preemptionTimeoutMs
  assert.deepEqual(
    resolveVideoScrubSeekStep({
      targetTime: 4.1,
      duration: 5.0,
      videoReadyState: 2,
      videoSeeking: true,
      lastSeekIssuedAtMs: 100,
      nowMs: 210,
      preemptionTimeoutMs: 90,
    }),
    { action: 'seek-now', clampedTime: 4.1 }
  );
});

test('resolveVideoProgressDisplay preserves paused slider percentage and duration after LOD remount without <video>', () => {
  const result = resolveVideoProgressDisplay({
    currentTime: null,
    storedTime: 1.5,
    duration: 3.0,
    stateProgress: 0,
    isPlayerMounted: false,
    hasRestoredInitialTime: false,
  });

  assert.equal(result.displayTime, 1.5);
  assert.equal(result.displayDuration, 3.0);
  assert.equal(result.progressPercent, 50);
});

test('resolveVideoProgressDisplay avoids flashing 0:00 while newly mounted <video> is still seeking to storedTime', () => {
  const result = resolveVideoProgressDisplay({
    currentTime: 0,
    storedTime: 1.8,
    duration: 3.0,
    stateProgress: 60,
    isPlayerMounted: true,
    hasRestoredInitialTime: false,
  });

  assert.equal(result.displayTime, 1.8);
  assert.equal(result.progressPercent, 60);
});

test('resolveVideoProgressDisplay tracks live currentTime once video playback/seek has restored', () => {
  const result = resolveVideoProgressDisplay({
    currentTime: 2.25,
    storedTime: 1.8,
    duration: 3.0,
    stateProgress: 75,
    isPlayerMounted: true,
    hasRestoredInitialTime: true,
  });

  assert.equal(result.displayTime, 2.25);
  assert.equal(result.progressPercent, 75);
});

test('session caches preserve paused time & duration across LOD unmount/remount even without localStorage or CardData props', () => {
  const cardId = 'card-lod-session-test';
  setCachedVideoDuration(cardId, 4.5);
  setCachedVideoProgress(cardId, 2.25);

  assert.equal(getCachedVideoDuration(cardId, undefined), 4.5);
  assert.equal(getCachedVideoProgress(cardId, undefined), 2.25);

  // Uninitialized 0s state must not overwrite established progress
  setCachedVideoProgress(cardId, 0.05);
  assert.equal(getCachedVideoProgress(cardId, undefined), 2.25);
});

test('resolveVideoEndResetMargin scales safely for short clips and computeSeekTimeFromPercent clamps bounds', () => {
  assert.equal(clampValidVideoDuration(NaN), 0);
  assert.equal(clampValidVideoDuration(-2), 0);
  assert.ok(resolveVideoEndResetMargin(3.0) <= 0.15);
  assert.equal(resolveVideoEndResetMargin(20), 0.25);
  assert.equal(computeSeekTimeFromPercent(50, 4), 2);
  assert.equal(computeSeekTimeFromPercent(150, 4), 4);
  assert.equal(computeSeekTimeFromPercent(-10, 4), 0);
});
