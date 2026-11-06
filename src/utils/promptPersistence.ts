export type PromptTabType = 'main' | 'state' | 'jsonAdapter' | 'landmarks';

export interface LocalPromptSnapshot {
  currentText: string;
  savedText: string;
  savedAt: number;
  isDirty: boolean;
}

export interface ServerPromptPayload {
  prompt: string;
  updatedAt?: number;
  source?: 'user_saved' | 'default';
}

export interface PromptSyncResolution {
  /** Final text that should be active in state and localStorage */
  nextText: string;
  /** Final saved baseline text */
  nextSavedText: string;
  /** Final saved timestamp */
  nextSavedAt: number;
  /** Final dirty flag */
  nextDirty: boolean;
  /** Whether the client should automatically push its saved prompt back to the server */
  shouldPushToServer: boolean;
}

/**
 * Pure decision function for reconciling browser-persisted prompt state with server response.
 * Prevents AI Studio container snapshot resets (where server reverts to `source: 'default'`
 * with `updatedAt: 0`) from overwriting a user's previously saved prompt when `isDirty` is false.
 */
export function resolvePromptSyncState(
  local: LocalPromptSnapshot,
  server: ServerPromptPayload,
  options?: { force?: boolean }
): PromptSyncResolution {
  const force = Boolean(options?.force);
  const serverUpdatedAt = typeof server.updatedAt === 'number' && Number.isFinite(server.updatedAt) ? server.updatedAt : 0;
  const serverSource = server.source || (serverUpdatedAt > 0 ? 'user_saved' : 'default');
  const serverPrompt = typeof server.prompt === 'string' ? server.prompt : '';

  // 1. Explicit force reset ("重置刷新"): adopt server prompt unconditionally
  if (force) {
    return {
      nextText: serverPrompt,
      nextSavedText: serverPrompt,
      nextSavedAt: serverUpdatedAt,
      nextDirty: false,
      shouldPushToServer: false,
    };
  }

  // 2. If user has an unsaved draft (isDirty === true), preserve the draft in editor,
  //    Wait: if local also has a saved baseline newer than server reset, should we push saved baseline?
  //    No, keep draft untouched until user clicks Save or Reset.
  if (local.isDirty && local.currentText.trim().length > 0) {
    return {
      nextText: local.currentText,
      nextSavedText: local.savedText || serverPrompt,
      nextSavedAt: local.savedAt || serverUpdatedAt,
      nextDirty: true,
      shouldPushToServer: false,
    };
  }

  // 3. User previously clicked "保存到代码库" (isDirty === false, savedText non-empty, savedAt > 0)
  //    Check if server was reset by container snapshot sync (serverUpdatedAt < local.savedAt or source === 'default')
  const candidateSavedText = (local.savedText || local.currentText || '').trim()
    ? (local.savedText || local.currentText)
    : '';

  if (
    candidateSavedText &&
    local.savedAt > 0 &&
    (local.savedAt > serverUpdatedAt || (serverSource === 'default' && candidateSavedText !== serverPrompt))
  ) {
    return {
      nextText: candidateSavedText,
      nextSavedText: candidateSavedText,
      nextSavedAt: local.savedAt,
      nextDirty: false,
      shouldPushToServer: candidateSavedText !== serverPrompt || serverSource === 'default',
    };
  }

  // 4. Legacy upgrade path: user had a custom prompt in localStorage before timestamps were introduced,
  //    isDirty is false, server is at default, and local text differs from default.
  //    Wait: only treat as user-saved if local.savedText was explicitly recorded OR local.savedAt > 0.
  //    Otherwise adopt server prompt normally.
  return {
    nextText: serverPrompt,
    nextSavedText: serverPrompt,
    nextSavedAt: serverUpdatedAt,
    nextDirty: false,
    shouldPushToServer: false,
  };
}
