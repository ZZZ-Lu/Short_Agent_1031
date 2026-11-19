export type AgentSpeakKind = 'summon' | 'transit' | 'selection' | 'reply' | 'thinking' | 'asking';

export interface AgentSpeakMeta {
  kind: 'summon' | 'transit' | 'selection';
  text: string;
}

export type SummonDistanceTier = 'near' | 'medium' | 'far' | 'very_far';

export type SummonInteractionKind = 'summon' | 'drag' | 'click_wake';

export type AgentSummonTargetDescriptor =
  | { kind: 'blank_canvas' }
  | { kind: 'asset_list' }
  | { kind: 'asset_item'; category: 'character' | 'location' | 'prop'; name: string }
  | { kind: 'asset_multi'; count: number }
  | { kind: 'script_selection'; snippet?: string }
  | { kind: 'script_body' }
  | { kind: 'script_chapter'; label?: string }
  | { kind: 'card_single'; name?: string; mediaType: 'image' | 'video' | 'card' }
  | { kind: 'card_multi'; total: number; imageCount: number; videoCount: number; otherCount: number }
  | { kind: 'ui_panel'; label?: string };

export interface SummonMotionInput {
  fromScreen: { x: number; y: number };
  toScreen: { x: number; y: number };
  viewport?: { width: number; height: number } | null;
  wasVisible?: boolean;
}

export interface SummonMotionResult {
  distancePx: number;
  isOffscreen: boolean;
  distanceTier: SummonDistanceTier;
  travelDurationMs: number;
}

export interface SummonHistoryState {
  lastSummonedAt: number | null;
  lastTargetKey: string | null;
  recentSummonTimestamps: number[];
  recentOpeners: string[];
  recentQuestions: string[];
  recentArrivalTexts: string[];
  recentTransitTexts: string[];
}

export interface BuildSummonDialogueInput {
  now: number;
  distancePx: number;
  isOffscreen: boolean;
  distanceTier: SummonDistanceTier;
  travelDurationMs: number;
  wasSleeping: boolean;
  isConcurrentDetach: boolean;
  target: AgentSummonTargetDescriptor;
  targetKey: string;
  history: SummonHistoryState;
  interactionKind?: SummonInteractionKind;
  /** Optional deterministic selector index (0..N) for reproducible unit tests */
  seed?: number;
}

export interface SummonDialogueResult {
  distanceTier: SummonDistanceTier;
  travelDurationMs: number;
  inTransitSpeak?: string;
  arrivalSpeak: string;
  reasonTag:
    | 'concurrent_detach'
    | 'wake_from_sleep'
    | 'drag'
    | 'same_spot'
    | 'rapid_burst'
    | 'short_interval'
    | 'long_interval'
    | 'distance_near'
    | 'distance_medium'
    | 'distance_far'
    | 'distance_very_far';
  nextHistory: SummonHistoryState;
}

export interface CardSummaryLike {
  name?: string;
  fileName?: string;
  prompt?: string;
  isVideo?: boolean;
  imageUrl?: string;
  fileData?: unknown;
  isAsset?: boolean;
  thumbnailUrl?: string;
}

const SHORT_INTERVAL_MS = 10_000;
const BURST_WINDOW_MS = 8_000;
const LONG_INTERVAL_MS = 180_000;
const MAX_RECENT_HISTORY = 5;

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function compactName(raw?: string, maxLen = 12): string {
  if (!raw) return '';
  const cleaned = raw
    .replace(/\.(png|jpg|jpeg|webp|gif|mp4|mov|webm)$/i, '')
    .replace(/[\r\n]+/g, ' ')
    .trim();
  if (!cleaned) return '';
  if (cleaned.length <= maxLen) return cleaned;
  return `${cleaned.slice(0, maxLen - 1)}…`;
}

export function createInitialSummonHistory(): SummonHistoryState {
  return {
    lastSummonedAt: null,
    lastTargetKey: null,
    recentSummonTimestamps: [],
    recentOpeners: [],
    recentQuestions: [],
    recentArrivalTexts: [],
    recentTransitTexts: [],
  };
}

export function isCurrentSpeakMetaKind(
  speak: string | undefined,
  speakMeta: AgentSpeakMeta | undefined,
  kinds: readonly AgentSpeakMeta['kind'][]
): boolean {
  if (!speak || !speakMeta) return false;
  return speakMeta.text === speak && kinds.includes(speakMeta.kind);
}

export function describeCardsAsSummonTarget(cards: readonly CardSummaryLike[]): AgentSummonTargetDescriptor {
  if (!cards || cards.length === 0) {
    return { kind: 'blank_canvas' };
  }

  if (cards.length === 1) {
    const card = cards[0];
    const rawName = (card.name || card.fileName || card.prompt || '')
      .replace(/\.(png|jpg|jpeg|webp|gif|mp4|mov|webm)$/i, '')
      .replace(/[\r\n]+/g, ' ')
      .trim();
    const shortName = rawName && rawName.length <= 12 ? rawName : undefined;
    const mediaType: 'image' | 'video' | 'card' = card.isVideo
      ? 'video'
      : card.imageUrl || card.fileData || card.isAsset || card.thumbnailUrl
        ? 'image'
        : 'card';
    return {
      kind: 'card_single',
      ...(shortName ? { name: shortName } : {}),
      mediaType,
    };
  }

  let videoCount = 0;
  let imageCount = 0;
  let otherCount = 0;

  for (const c of cards) {
    if (c.isVideo) {
      videoCount++;
    } else if (c.imageUrl || c.fileData || c.isAsset || c.thumbnailUrl) {
      imageCount++;
    } else {
      otherCount++;
    }
  }

  return {
    kind: 'card_multi',
    total: cards.length,
    imageCount,
    videoCount,
    otherCount,
  };
}

export function computeSummonMotion(input: SummonMotionInput): SummonMotionResult {
  const dx = input.toScreen.x - input.fromScreen.x;
  const dy = input.toScreen.y - input.fromScreen.y;
  const distancePx = Math.round(Math.hypot(dx, dy));

  const vp = input.viewport;
  const offscreenMargin = 24;
  const outsideViewport = Boolean(
    vp &&
      vp.width > 0 &&
      vp.height > 0 &&
      (input.fromScreen.x < -offscreenMargin ||
        input.fromScreen.x > vp.width + offscreenMargin ||
        input.fromScreen.y < -offscreenMargin ||
        input.fromScreen.y > vp.height + offscreenMargin)
  );
  const isOffscreen = input.wasVisible === false || outsideViewport;

  if (isOffscreen || distancePx >= 1100) {
    const extraRatio = clamp((distancePx - 1100) / 900, 0, 1);
    const travelDurationMs = clamp(Math.round(820 + extraRatio * 160), 820, 980);
    return {
      distancePx,
      isOffscreen,
      distanceTier: 'very_far',
      travelDurationMs,
    };
  }

  if (distancePx < 120) {
    const ratio = clamp(distancePx / 120, 0, 1);
    const travelDurationMs = clamp(Math.round(170 + ratio * 70), 170, 240);
    return {
      distancePx,
      isOffscreen: false,
      distanceTier: 'near',
      travelDurationMs,
    };
  }

  if (distancePx < 520) {
    const ratio = clamp((distancePx - 120) / 400, 0, 1);
    const travelDurationMs = clamp(Math.round(310 + ratio * 190), 310, 500);
    return {
      distancePx,
      isOffscreen: false,
      distanceTier: 'medium',
      travelDurationMs,
    };
  }

  const ratio = clamp((distancePx - 520) / 580, 0, 1);
  const travelDurationMs = clamp(Math.round(560 + ratio * 240), 560, 800);
  return {
    distancePx,
    isOffscreen: false,
    distanceTier: 'far',
    travelDurationMs,
  };
}

export function getTargetQuestionPool(target: AgentSummonTargetDescriptor): string[] {
  switch (target.kind) {
    case 'blank_canvas':
      return ['想做点什么？', '有什么想法？', '要我帮什么忙？', '说说看？', '需要我做什么？'];
    case 'asset_list':
      return ['资产清单要怎么整理？', '资产清单这边要补还是改？', '资产清单要处理什么？'];
    case 'asset_item': {
      const name = compactName(target.name, 12) || (target.category === 'character' ? '这个角色' : target.category === 'location' ? '这个场景' : '这个道具');
      const wrapped = name.startsWith('这个') ? name : `【${name}】`;
      return [`${wrapped}要怎么改？`, `${wrapped}这边要调整吗？`, `${wrapped}要做什么？`];
    }
    case 'asset_multi':
      return [`这 ${target.count} 项资产要一起处理吗？`, `这 ${target.count} 项资产想怎么改？`];
    case 'script_selection':
      return ['这段想怎么调？', '这段要改还是扩写？', '这段内容要怎么处理？'];
    case 'script_body':
      return ['剧本这边要一起看看吗？', '剧本正文要怎么处理？', '剧本这边想改哪？'];
    case 'script_chapter':
      return ['这章要拆解还是润色？', '这个章节要怎么处理？'];
    case 'card_single': {
      const shortName = compactName(target.name, 12);
      if (shortName) {
        return [`【${shortName}】想怎么改？`, `【${shortName}】这边要做什么？`];
      }
      if (target.mediaType === 'video') {
        return ['这个视频想怎么处理？', '这个视频要调整哪？'];
      }
      if (target.mediaType === 'image') {
        return ['这张图想怎么改？', '这张图要怎么处理？'];
      }
      return ['这张卡片要怎么处理？', '这个内容想怎么改？'];
    }
    case 'card_multi': {
      if (target.imageCount === target.total) {
        return [`这 ${target.total} 张图想怎么处理？`, `这 ${target.total} 张图要怎么改？`];
      }
      if (target.videoCount === target.total) {
        return [`这 ${target.total} 个视频要怎么处理？`, `这 ${target.total} 个视频想怎么改？`];
      }
      if (target.imageCount > 0 && target.videoCount > 0 && target.otherCount === 0) {
        return [`这 ${target.imageCount} 张图和 ${target.videoCount} 个视频要怎么处理？`];
      }
      return [`这 ${target.total} 个卡片要怎么处理？`, `选了这 ${target.total} 个，想怎么弄？`];
    }
    case 'ui_panel':
      return ['这边需要我做什么？', '这里要怎么处理？'];
  }
}

export function buildNaturalSelectionPrompt(target: AgentSummonTargetDescriptor): string {
  const pool = getTargetQuestionPool(target);
  return pool[0];
}

function pickFromPool(pool: readonly string[], recent: readonly string[], seed?: number): string {
  if (pool.length === 0) return '';
  if (pool.length === 1) return pool[0];

  const recentSet = new Set(recent);
  const fresh = pool.filter((item) => !recentSet.has(item));
  const candidates = fresh.length > 0 ? fresh : pool.filter((item) => item !== recent[recent.length - 1]);
  const finalPool = candidates.length > 0 ? candidates : pool;

  const idx =
    typeof seed === 'number' && Number.isFinite(seed)
      ? Math.abs(Math.floor(seed)) % finalPool.length
      : Math.floor(Math.random() * finalPool.length);
  return finalPool[idx];
}

function joinOpenerAndQuestion(opener: string, question: string): string {
  if (!opener) return question;
  if (!question) return opener;
  // Avoid awkward double question marks
  const sep = /[？?！!。…]$/.test(opener) ? ' ' : '，';
  return `${opener}${sep}${question}`;
}

export function buildSummonDialogue(input: BuildSummonDialogueInput): SummonDialogueResult {
  const interactionKind: SummonInteractionKind = input.interactionKind ?? 'summon';
  const prevHistory = input.history;

  const elapsedMs =
    prevHistory.lastSummonedAt !== null ? Math.max(0, input.now - prevHistory.lastSummonedAt) : null;
  const recentTimestamps = [
    ...prevHistory.recentSummonTimestamps.filter((ts) => input.now - ts <= BURST_WINDOW_MS),
    input.now,
  ];
  const recentBurstCount = recentTimestamps.length;
  const isSameTarget =
    prevHistory.lastTargetKey !== null && prevHistory.lastTargetKey === input.targetKey;
  const isFar = input.distanceTier === 'far' || input.distanceTier === 'very_far';

  let reasonTag: SummonDialogueResult['reasonTag'];
  let openerPool: string[];

  if (input.isConcurrentDetach) {
    reasonTag = 'concurrent_detach';
    openerPool = ['那边先跑着', '我先过来这边', '这边也交给我'];
  } else if (input.wasSleeping) {
    reasonTag = 'wake_from_sleep';
    openerPool = ['醒啦', '我醒啦', '嗯，醒了', '刚睡醒'];
  } else if (interactionKind === 'drag') {
    reasonTag = 'drag';
    openerPool = ['到这边啦', '看这边啦', '在这儿啦', '放下啦'];
  } else if (isSameTarget && input.distanceTier === 'near' && elapsedMs !== null) {
    reasonTag = 'same_spot';
    openerPool = ['我还在这儿呢', '就在这儿', '嗯，我在听', '还是这边'];
  } else if (recentBurstCount >= 3 && elapsedMs !== null && elapsedMs < BURST_WINDOW_MS) {
    reasonTag = 'rapid_burst';
    openerPool = ['跟上啦', '又切这边啦', '这就跟上', '在这儿呢'];
  } else if (elapsedMs !== null && elapsedMs < SHORT_INTERVAL_MS) {
    reasonTag = 'short_interval';
    openerPool = isFar
      ? ['这就赶过来啦', '马上跟过来啦', '这就跑过来啦']
      : ['这就来', '在呢', '又切这边啦', '接着来'];
  } else if (elapsedMs !== null && elapsedMs >= LONG_INTERVAL_MS) {
    reasonTag = 'long_interval';
    openerPool = isFar
      ? ['好久没叫我啦，赶过来啦', '久等啦，跑过来啦', '我来啦']
      : ['好久没叫我啦', '我来啦', '在呢', '来啦'];
  } else if (input.distanceTier === 'near') {
    reasonTag = 'distance_near';
    openerPool = ['就在边上', '在呢', '嗯，我在', '就在这儿呢'];
  } else if (input.distanceTier === 'medium') {
    reasonTag = 'distance_medium';
    openerPool = ['来啦', '在呢', '过来啦', '到啦', '嗯，来啦'];
  } else if (input.distanceTier === 'far') {
    reasonTag = 'distance_far';
    openerPool = ['跑过来啦', '赶过来啦', '来咯', '到这边啦'];
  } else {
    reasonTag = 'distance_very_far';
    openerPool = ['跑过来啦', '刚赶过来', '呼，赶过来啦', '来咯'];
  }

  const questionPool = getTargetQuestionPool(input.target);

  const selectedOpener = pickFromPool(openerPool, prevHistory.recentOpeners, input.seed);
  const selectedQuestion = pickFromPool(
    questionPool,
    prevHistory.recentQuestions,
    typeof input.seed === 'number' ? input.seed + 3 : undefined
  );
  const arrivalSpeak = joinOpenerAndQuestion(selectedOpener, selectedQuestion);

  let inTransitSpeak: string | undefined;
  if (interactionKind === 'summon' && isFar && input.travelDurationMs >= 550) {
    const transitPool = input.isConcurrentDetach
      ? ['这就分身过去…', '马上过来…']
      : input.wasSleeping
        ? ['醒啦，马上到…', '这就过来…']
        : ['来啦…', '马上到…', '这就过来…', '来咯…'];
    inTransitSpeak = pickFromPool(
      transitPool,
      prevHistory.recentTransitTexts,
      typeof input.seed === 'number' ? input.seed + 1 : undefined
    );
  }

  const nextRecentOpeners = [...prevHistory.recentOpeners, selectedOpener].slice(-MAX_RECENT_HISTORY);
  const nextRecentQuestions = [...prevHistory.recentQuestions, selectedQuestion].slice(-MAX_RECENT_HISTORY);
  const nextRecentArrivals = [...prevHistory.recentArrivalTexts, arrivalSpeak].slice(-MAX_RECENT_HISTORY);
  const nextRecentTransits = inTransitSpeak
    ? [...prevHistory.recentTransitTexts, inTransitSpeak].slice(-MAX_RECENT_HISTORY)
    : prevHistory.recentTransitTexts;

  return {
    distanceTier: input.distanceTier,
    travelDurationMs: input.travelDurationMs,
    ...(inTransitSpeak ? { inTransitSpeak } : {}),
    arrivalSpeak,
    reasonTag,
    nextHistory: {
      lastSummonedAt: input.now,
      lastTargetKey: input.targetKey,
      recentSummonTimestamps: recentTimestamps.slice(-6),
      recentOpeners: nextRecentOpeners,
      recentQuestions: nextRecentQuestions,
      recentArrivalTexts: nextRecentArrivals,
      recentTransitTexts: nextRecentTransits,
    },
  };
}
