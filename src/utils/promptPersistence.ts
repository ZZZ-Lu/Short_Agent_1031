export type PromptTabType = 'main' | 'mainExecution' | 'state' | 'jsonAdapter' | 'landmarks';

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

export function isObsoletePromptText(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  return (
    text.includes('严禁将他人的台词/动作、纯画外音（vo）或纯心理活动（OS）') ||
    text.includes('随读随写增量闭环（严禁全读完再单次囤积写入）') ||
    text.includes('优先采用场次数组批量读取与一次性齐套建卡') ||
    text.includes('批量读取与齐套写入（最短路径闭环）') ||
    text.includes('0 级负责宏观规划与架构分解') ||
    text.includes('严格遵循“主体归属原则”区分资产设定简介') ||
    text.includes('逐条显式列出') ||
    text.includes('按序号逐条显式列出') ||
    text.includes('核对参数依据是否完整就绪，确定本轮要调用的工具与具体参数') ||
    text.includes('严禁跳段') ||
    text.includes('若该资产在当前画面中有明确可见的自身动作') ||
    text.includes('提取出处时须自上而下逐段核对剧本原文') ||
    text.includes('如果资产可能在画面中呈现出来') ||
    text.includes('出处（provenances）判定规则：')
  );
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
  if (local.isDirty && local.currentText.trim().length > 0 && !isObsoletePromptText(local.currentText)) {
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
  const rawCandidate = (local.savedText || local.currentText || '').trim()
    ? (local.savedText || local.currentText)
    : '';
  const candidateSavedText = isObsoletePromptText(rawCandidate) ? '' : rawCandidate;

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
