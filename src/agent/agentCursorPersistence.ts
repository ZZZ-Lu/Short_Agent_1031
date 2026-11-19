import type { AgentCoordinateSpace } from './agentCursorPosition';
import type { StorageLike, StorageReadLike } from '../utils/scrollMemory';

export const AGENT_CURSOR_STATE_KEY_PREFIX = 'agent_cursor_state_';

export type PersistedAgentCursorMode = 'default' | 'inspect';

export interface PersistedAgentCursorState {
  x: number;
  y: number;
  coordinateSpace: AgentCoordinateSpace;
  visible: boolean;
  isSleeping: boolean;
  quickInputOpen: boolean;
  targetId: string | null;
  targetIds: string[];
  speak?: string;
  cursorMode: PersistedAgentCursorMode;
}

export interface AgentViewportBounds {
  width: number;
  height: number;
}

export interface StorageRemoveLike {
  removeItem: (key: string) => void;
}

export interface AgentCursorSnapshotInput {
  agentState: {
    x: number;
    y: number;
    coordinateSpace?: AgentCoordinateSpace;
    visible: boolean;
    speak?: string;
    cursorMode?: 'default' | 'inspect' | 'working' | 'interact';
    isSleeping?: boolean;
  };
  quickInput?: {
    isOpen: boolean;
    targetId: string | null;
    targetIds?: string[];
  } | null;
}

export interface HydratedAgentCursorRuntime {
  agentState: {
    x: number;
    y: number;
    coordinateSpace: AgentCoordinateSpace;
    visible: boolean;
    isActive: boolean;
    isMoving: boolean;
    speak?: string;
    cursorMode: PersistedAgentCursorMode;
    isSleeping: boolean;
  };
  agentQuickInput: {
    isOpen: boolean;
    targetId: string | null;
    targetIds?: string[];
    placeholder: string;
  } | null;
  focusTarget: {
    primary: string;
    references: string[];
  } | null;
}

export function buildAgentCursorStorageKey(projectId: string): string {
  return `${AGENT_CURSOR_STATE_KEY_PREFIX}${projectId || 'default'}`;
}

function roundCoord(value: number): number {
  return Math.round(value * 100) / 100;
}

function normalizeTargetIds(targetIds: unknown, primaryTargetId: string | null): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  if (primaryTargetId) {
    seen.add(primaryTargetId);
    result.push(primaryTargetId);
  }
  if (Array.isArray(targetIds)) {
    for (const raw of targetIds) {
      if (typeof raw === 'string') {
        const trimmed = raw.trim();
        if (trimmed && !seen.has(trimmed)) {
          seen.add(trimmed);
          result.push(trimmed);
        }
      }
    }
  }
  return result;
}

export function isTransientAgentSpeak(speak?: string): boolean {
  if (!speak) return false;
  const clean = speak.trim();
  if (!clean) return true;
  if (
    clean === '...' ||
    clean === '…' ||
    clean === 'thinking' ||
    clean === 'loading' ||
    clean === '来啦…' ||
    clean === '马上到…' ||
    clean === '这就过来…' ||
    clean === '来咯…' ||
    clean === '醒啦，马上到…' ||
    clean === '这就分身过去…' ||
    clean.includes('正在思考') ||
    clean.includes('正在操作') ||
    clean.includes('正在标注') ||
    clean.includes('正在生成') ||
    clean.includes('排队渲染') ||
    clean.includes('正在查看') ||
    clean.includes('正在对照') ||
    clean.includes('正在质检') ||
    clean.includes('正在拉取') ||
    clean.includes('图生好了，我先看下')
  ) {
    return true;
  }
  return false;
}

function normalizePersistedAgentSpeak(speak: string): string {
  return speak === '我能帮什么忙？' ? '需要我做什么？' : speak;
}

export function buildDefaultAgentCursorState(
  viewport?: AgentViewportBounds
): PersistedAgentCursorState {
  const defaultX =
    viewport && Number.isFinite(viewport.width) && viewport.width > 0
      ? Math.max(40, Math.round(viewport.width - 80))
      : 0;
  const defaultY =
    viewport && Number.isFinite(viewport.height) && viewport.height > 0
      ? Math.max(40, Math.round(viewport.height - 150))
      : 0;
  return {
    x: defaultX,
    y: defaultY,
    coordinateSpace: 'canvas',
    visible: true,
    isSleeping: false,
    quickInputOpen: true,
    targetId: null,
    targetIds: [],
    cursorMode: 'default',
  };
}

export function buildPersistedAgentCursorSnapshot(
  input: AgentCursorSnapshotInput
): PersistedAgentCursorState {
  const { agentState, quickInput } = input;
  const x =
    typeof agentState.x === 'number' && Number.isFinite(agentState.x)
      ? roundCoord(agentState.x)
      : 0;
  const y =
    typeof agentState.y === 'number' && Number.isFinite(agentState.y)
      ? roundCoord(agentState.y)
      : 0;
  const coordinateSpace: AgentCoordinateSpace =
    agentState.coordinateSpace === 'screen' ? 'screen' : 'canvas';
  const visible = agentState.visible !== false;
  const isSleeping = Boolean(agentState.isSleeping);

  if (isSleeping) {
    return {
      x,
      y,
      coordinateSpace,
      visible,
      isSleeping: true,
      quickInputOpen: false,
      targetId: null,
      targetIds: [],
      cursorMode: 'default',
    };
  }

  const quickInputOpen = Boolean(quickInput?.isOpen);
  const targetId =
    quickInputOpen && typeof quickInput?.targetId === 'string' && quickInput.targetId.trim().length > 0
      ? quickInput.targetId.trim()
      : null;
  const targetIds = quickInputOpen ? normalizeTargetIds(quickInput?.targetIds, targetId) : [];

  const rawSpeak = typeof agentState.speak === 'string' ? agentState.speak.trim() : '';
  const speak = rawSpeak && !isTransientAgentSpeak(rawSpeak) ? normalizePersistedAgentSpeak(rawSpeak) : undefined;

  const cursorMode: PersistedAgentCursorMode =
    agentState.cursorMode === 'inspect' ||
    (targetId !== null &&
      (agentState.cursorMode === 'working' || agentState.cursorMode === 'interact'))
      ? 'inspect'
      : 'default';

  return {
    x,
    y,
    coordinateSpace,
    visible,
    isSleeping: false,
    quickInputOpen,
    targetId,
    targetIds,
    ...(speak ? { speak } : {}),
    cursorMode,
  };
}

export function normalizePersistedAgentCursorState(
  raw: unknown,
  viewport?: AgentViewportBounds
): PersistedAgentCursorState | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  if (
    typeof obj.x !== 'number' ||
    !Number.isFinite(obj.x) ||
    typeof obj.y !== 'number' ||
    !Number.isFinite(obj.y)
  ) {
    return null;
  }

  const coordinateSpace: AgentCoordinateSpace =
    obj.coordinateSpace === 'screen' ? 'screen' : 'canvas';

  let x = roundCoord(obj.x);
  let y = roundCoord(obj.y);
  if (
    coordinateSpace === 'screen' &&
    viewport &&
    Number.isFinite(viewport.width) &&
    viewport.width > 0 &&
    Number.isFinite(viewport.height) &&
    viewport.height > 0
  ) {
    x = Math.min(Math.max(16, x), Math.max(16, Math.round(viewport.width - 24)));
    y = Math.min(Math.max(16, y), Math.max(16, Math.round(viewport.height - 24)));
  }

  const visible = typeof obj.visible === 'boolean' ? obj.visible : true;
  const isSleeping = Boolean(obj.isSleeping);
  if (isSleeping) {
    return {
      x,
      y,
      coordinateSpace,
      visible,
      isSleeping: true,
      quickInputOpen: false,
      targetId: null,
      targetIds: [],
      cursorMode: 'default',
    };
  }

  const quickInputOpen = typeof obj.quickInputOpen === 'boolean' ? obj.quickInputOpen : true;
  const targetId =
    quickInputOpen && typeof obj.targetId === 'string' && obj.targetId.trim().length > 0
      ? obj.targetId.trim()
      : null;
  const targetIds = quickInputOpen ? normalizeTargetIds(obj.targetIds, targetId) : [];
  const rawSpeak = typeof obj.speak === 'string' ? obj.speak.trim() : '';
  const speak = rawSpeak && !isTransientAgentSpeak(rawSpeak) ? normalizePersistedAgentSpeak(rawSpeak) : undefined;
  const cursorMode: PersistedAgentCursorMode =
    obj.cursorMode === 'inspect' && targetId !== null ? 'inspect' : 'default';

  return {
    x,
    y,
    coordinateSpace,
    visible,
    isSleeping: false,
    quickInputOpen,
    targetId,
    targetIds,
    ...(speak ? { speak } : {}),
    cursorMode,
  };
}

export function readPersistedAgentCursorState(
  storage: StorageReadLike | null | undefined,
  projectId: string,
  viewport?: AgentViewportBounds
): PersistedAgentCursorState | null {
  if (!storage || !projectId) return null;
  try {
    const raw = storage.getItem(buildAgentCursorStorageKey(projectId));
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return normalizePersistedAgentCursorState(parsed, viewport);
  } catch {
    return null;
  }
}

export function writePersistedAgentCursorState(
  storage: StorageLike | null | undefined,
  projectId: string,
  state: PersistedAgentCursorState
): void {
  if (!storage || !projectId) return;
  const normalized = normalizePersistedAgentCursorState(state);
  if (!normalized) return;
  try {
    storage.setItem(buildAgentCursorStorageKey(projectId), JSON.stringify(normalized));
  } catch {
    // Ignore storage quota/security errors safely
  }
}

export function removePersistedAgentCursorState(
  storage: StorageRemoveLike | null | undefined,
  projectId: string
): void {
  if (!storage || !projectId) return;
  try {
    storage.removeItem(buildAgentCursorStorageKey(projectId));
  } catch {
    // Ignore storage errors safely
  }
}

export function hydrateAgentCursorRuntimeState(
  persisted: PersistedAgentCursorState | null,
  viewport?: AgentViewportBounds
): HydratedAgentCursorRuntime {
  const effective = persisted ?? buildDefaultAgentCursorState(viewport);

  const agentState: HydratedAgentCursorRuntime['agentState'] = {
    x: effective.x,
    y: effective.y,
    coordinateSpace: effective.coordinateSpace,
    visible: effective.visible,
    isActive: false,
    isMoving: false,
    ...(effective.speak ? { speak: effective.speak } : {}),
    cursorMode: effective.cursorMode,
    isSleeping: effective.isSleeping,
  };

  const agentQuickInput: HydratedAgentCursorRuntime['agentQuickInput'] =
    effective.isSleeping || !effective.quickInputOpen
      ? null
      : {
          isOpen: true,
          targetId: effective.targetId,
          ...(effective.targetIds.length > 0 ? { targetIds: effective.targetIds } : {}),
          placeholder: '输入你的想法...',
        };

  const focusTarget: HydratedAgentCursorRuntime['focusTarget'] =
    !effective.isSleeping && effective.cursorMode === 'inspect' && effective.targetId
      ? {
          primary: effective.targetId,
          references: effective.targetIds.filter((id) => id !== effective.targetId),
        }
      : null;

  return {
    agentState,
    agentQuickInput,
    focusTarget,
  };
}
