import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildNaturalSelectionPrompt,
  buildSummonDialogue,
  computeSummonMotion,
  createInitialSummonHistory,
  describeCardsAsSummonTarget,
  isCurrentSpeakMetaKind,
} from './agentSummonDialogue';

test('computeSummonMotion scales travel duration smoothly across near, medium, far, and offscreen', () => {
  const viewport = { width: 1440, height: 900 };

  const near = computeSummonMotion({
    fromScreen: { x: 400, y: 400 },
    toScreen: { x: 460, y: 420 },
    viewport,
    wasVisible: true,
  });
  assert.equal(near.distanceTier, 'near');
  assert.ok(near.travelDurationMs >= 170 && near.travelDurationMs <= 240);

  const medium = computeSummonMotion({
    fromScreen: { x: 400, y: 400 },
    toScreen: { x: 700, y: 450 },
    viewport,
    wasVisible: true,
  });
  assert.equal(medium.distanceTier, 'medium');
  assert.ok(medium.travelDurationMs >= 310 && medium.travelDurationMs <= 500);

  const far = computeSummonMotion({
    fromScreen: { x: 200, y: 200 },
    toScreen: { x: 960, y: 460 },
    viewport,
    wasVisible: true,
  });
  assert.equal(far.distanceTier, 'far');
  assert.ok(far.travelDurationMs >= 560 && far.travelDurationMs <= 800);

  const veryFar = computeSummonMotion({
    fromScreen: { x: 50, y: 50 },
    toScreen: { x: 1360, y: 820 },
    viewport,
    wasVisible: true,
  });
  assert.equal(veryFar.distanceTier, 'very_far');
  assert.ok(veryFar.travelDurationMs >= 820 && veryFar.travelDurationMs <= 980);

  const offscreen = computeSummonMotion({
    fromScreen: { x: -300, y: 300 },
    toScreen: { x: 100, y: 300 },
    viewport,
    wasVisible: true,
  });
  assert.equal(offscreen.isOffscreen, true);
  assert.equal(offscreen.distanceTier, 'very_far');
  assert.ok(offscreen.travelDurationMs >= 820 && offscreen.travelDurationMs <= 980);

  assert.ok(near.travelDurationMs < medium.travelDurationMs);
  assert.ok(medium.travelDurationMs < far.travelDurationMs);
  assert.ok(far.travelDurationMs < veryFar.travelDurationMs);
});

test('buildSummonDialogue differentiates distance, interval, wake-from-sleep, burst, same-spot, and concurrent detach', () => {
  let history = createInitialSummonHistory();

  // 1. Medium first summon on asset list -> no transit, natural arrival
  const first = buildSummonDialogue({
    now: 100_000,
    distancePx: 300,
    isOffscreen: false,
    distanceTier: 'medium',
    travelDurationMs: 400,
    wasSleeping: false,
    isConcurrentDetach: false,
    target: { kind: 'asset_list' },
    targetKey: 'assets.panel',
    history,
    seed: 0,
  });
  assert.equal(first.reasonTag, 'distance_medium');
  assert.equal(first.inTransitSpeak, undefined);
  assert.match(first.arrivalSpeak, /资产清单/);
  assert.ok(!first.arrivalSpeak.startsWith('选了'));
  history = first.nextHistory;

  // 2. Same spot near re-summon shortly after
  const sameSpot = buildSummonDialogue({
    now: 103_000,
    distancePx: 30,
    isOffscreen: false,
    distanceTier: 'near',
    travelDurationMs: 188,
    wasSleeping: false,
    isConcurrentDetach: false,
    target: { kind: 'asset_list' },
    targetKey: 'assets.panel',
    history,
    seed: 0,
  });
  assert.equal(sameSpot.reasonTag, 'same_spot');
  assert.notEqual(sameSpot.arrivalSpeak, first.arrivalSpeak);
  history = sameSpot.nextHistory;

  // 3. Third summon within 8s -> rapid burst
  const burst = buildSummonDialogue({
    now: 105_000,
    distancePx: 260,
    isOffscreen: false,
    distanceTier: 'medium',
    travelDurationMs: 380,
    wasSleeping: false,
    isConcurrentDetach: false,
    target: { kind: 'blank_canvas' },
    targetKey: 'blank',
    history,
    seed: 0,
  });
  assert.equal(burst.reasonTag, 'rapid_burst');
  history = burst.nextHistory;

  // 4. Short interval (< 10s, after burst window cleared)
  const shortAfter = buildSummonDialogue({
    now: 120_000,
    distancePx: 240,
    isOffscreen: false,
    distanceTier: 'medium',
    travelDurationMs: 360,
    wasSleeping: false,
    isConcurrentDetach: false,
    target: { kind: 'script_body' },
    targetKey: 'script.text',
    history: {
      ...history,
      lastSummonedAt: 115_000,
      lastTargetKey: 'blank',
      recentSummonTimestamps: [115_000],
    },
    seed: 0,
  });
  assert.equal(shortAfter.reasonTag, 'short_interval');
  assert.match(shortAfter.arrivalSpeak, /剧本/);

  // 5. Long interval (>= 180s) + far distance -> transit phrase + long_interval arrival
  const longAfter = buildSummonDialogue({
    now: 400_000,
    distancePx: 800,
    isOffscreen: false,
    distanceTier: 'far',
    travelDurationMs: 680,
    wasSleeping: false,
    isConcurrentDetach: false,
    target: { kind: 'asset_item', category: 'character', name: '林晚' },
    targetKey: 'assets.item.character.linwan',
    history: shortAfter.nextHistory,
    seed: 0,
  });
  assert.equal(longAfter.reasonTag, 'long_interval');
  assert.ok(Boolean(longAfter.inTransitSpeak));
  assert.match(longAfter.arrivalSpeak, /林晚/);

  // 6. Wake from sleep overrides interval and distance
  const wake = buildSummonDialogue({
    now: 405_000,
    distancePx: 900,
    isOffscreen: false,
    distanceTier: 'far',
    travelDurationMs: 720,
    wasSleeping: true,
    isConcurrentDetach: false,
    target: { kind: 'blank_canvas' },
    targetKey: 'blank',
    history: longAfter.nextHistory,
    seed: 0,
  });
  assert.equal(wake.reasonTag, 'wake_from_sleep');
  assert.match(wake.arrivalSpeak, /醒/);
  assert.ok(Boolean(wake.inTransitSpeak));

  // 7. Concurrent detach overrides sleep/distance
  const detach = buildSummonDialogue({
    now: 408_000,
    distancePx: 700,
    isOffscreen: false,
    distanceTier: 'far',
    travelDurationMs: 640,
    wasSleeping: false,
    isConcurrentDetach: true,
    target: { kind: 'card_single', mediaType: 'image' },
    targetKey: 'card-1',
    history: wake.nextHistory,
    seed: 0,
  });
  assert.equal(detach.reasonTag, 'concurrent_detach');
  assert.match(detach.arrivalSpeak, /这张图/);
});

test('buildSummonDialogue avoids repeating identical phrases back-to-back and stays concise', () => {
  let history = createInitialSummonHistory();
  const seen: string[] = [];

  for (let i = 0; i < 6; i++) {
    const res = buildSummonDialogue({
      now: 100_000 + i * 30_000,
      distancePx: 320,
      isOffscreen: false,
      distanceTier: 'medium',
      travelDurationMs: 410,
      wasSleeping: false,
      isConcurrentDetach: false,
      target: { kind: 'blank_canvas' },
      targetKey: `blank-${i}`,
      history,
      seed: 0,
    });
    if (seen.length > 0) {
      assert.notEqual(res.arrivalSpeak, seen[seen.length - 1]);
    }
    assert.ok(res.arrivalSpeak.length <= 24, `Phrase too long: ${res.arrivalSpeak}`);
    seen.push(res.arrivalSpeak);
    history = res.nextHistory;
  }

  // Must produce multiple distinct openers, not only "来啦"
  const distinctOpeners = new Set(seen.map((line) => line.split('，')[0]));
  assert.ok(distinctOpeners.size >= 3, `Expected varied openers, got: ${Array.from(distinctOpeners).join(', ')}`);
});

test('describeCardsAsSummonTarget and buildNaturalSelectionPrompt cover single/multi card types', () => {
  assert.deepEqual(describeCardsAsSummonTarget([]), { kind: 'blank_canvas' });

  const named = describeCardsAsSummonTarget([{ name: '雨夜海报.png', imageUrl: 'x' }]);
  assert.deepEqual(named, { kind: 'card_single', name: '雨夜海报', mediaType: 'image' });
  assert.match(buildNaturalSelectionPrompt(named), /雨夜海报/);

  const multiImg = describeCardsAsSummonTarget([{ imageUrl: 'a' }, { imageUrl: 'b' }]);
  assert.deepEqual(multiImg, { kind: 'card_multi', total: 2, imageCount: 2, videoCount: 0, otherCount: 0 });
  assert.match(buildNaturalSelectionPrompt(multiImg), /2 张图/);

  const mixed = describeCardsAsSummonTarget([{ imageUrl: 'a' }, { isVideo: true }]);
  assert.match(buildNaturalSelectionPrompt(mixed), /1 张图和 1 个视频/);
});

test('isCurrentSpeakMetaKind automatically invalidates when speak changes to a real reply', () => {
  const meta = { kind: 'summon' as const, text: '来啦，想做点什么？' };
  assert.equal(isCurrentSpeakMetaKind('来啦，想做点什么？', meta, ['summon', 'transit']), true);
  assert.equal(isCurrentSpeakMetaKind('已为你生成 3 张参考图', meta, ['summon', 'transit', 'selection']), false);
  assert.equal(isCurrentSpeakMetaKind(undefined, meta, ['summon']), false);
});
