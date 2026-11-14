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
    text.includes('出处（provenances）判定规则：') ||
    text.includes('核对参数依据与场次段落是否完整就绪，确定本轮要调用的工具与具体参数') ||
    text.includes('参数纯净与多版本规范：') ||
    text.includes('提取资产前必须先调用 script.read 读取目标场次的完整剧本正文') ||
    text.includes('上一轮返回了场次分布概览（scenesSummary）') ||
    text.includes('遵循“读取一批、核验一批、落盘一批”的增量闭环推进') ||
    text.includes('scenesSummary 场次分布细化为分步子任务列表') ||
    text.includes('4. 连续推进与工具流转：') ||
    text.includes('3. 工具装载与流转：结合“当前计划”所需工具') ||
    text.includes('更新后的当前进度（合并已完成事项与当前正在推进的事项）') ||
    text.includes('一字不差完整复制该段原文>」→ 判定：') ||
    text.includes('原封不动摘录该段中文原文>」→ 判定：') ||
    text.includes('工具调用：\n{{调用 工具名称, {"参数名": "参数值"}}}') ||
    text.includes('围绕全局目标、计划制定与工具准备进行逻辑推演，确定本轮要调用的工具与参数') ||
    text.includes('每个子步骤必须定义为“读取该单元数据并完成对应的创建或增量更新”的完整读写闭环') ||
    text.includes('当前子步骤处于“已读取待写入”还是“已写入落盘完成”状态？“当前计划”中还有哪些后续步骤待推进？') ||
    text.includes('首批场次读取并调用创建工具建主卡锚定出处') ||
    text.includes('分析当前任务进展与本轮返回的数据规模、场次或集数分布') ||
    text.includes('必须严格按该工具规则在思考中完整输出，不得缩写省略') ||
    text.includes('本轮发现了哪些跨轮次仍需引用的关键事实、实体 ID 或新线索需要沉淀到“重点笔记”？') ||
    text.includes('本轮发现了哪些后续步骤仍需引用的关键事实、实体 ID 或未落盘线索？（整理以便更新至“重点笔记”）') ||
    text.includes('仅保留跨轮次仍需引用的目标实体ID、已有版本/造型名称、核心设定属性及尚未落盘的关键线索') ||
    text.includes('如‘已完成前3步，当前第4步已读取数据待落盘’') ||
    text.includes('- 重点笔记盘点：本轮有哪些跨轮次仍需引用的关键事实') ||
    text.includes('对照“当前计划”与“工具执行结果”核验推进（显式列出完整步骤列表') ||
    text.includes('围绕全局目标、计划拆解与工具准备进行逻辑推演，确定本轮要调用的工具与参数') ||
    text.includes('跨轮次持久保留的客观锚点（目标实体ID、已落盘版本/状态名称') ||
    text.includes('# 背景\n你位于一个短剧协作平台中') ||
    text.includes('## 当前聚焦目标\n{{cardContext}}\n## 用户输入原文') ||
    text.includes('当前小目标：{{taskSubGoal}}\n当前进度：{{taskProgress}}\n当前计划：{{taskPlan}}') ||
    text.includes('合并整理为最新的认知状态 JSON。\n\n【当前认知状态（上一轮旧状态）】') ||
    text.includes('负责协助用户从剧本到生图到视频的流程') ||
    text.includes('"notesMode": "overwrite"\n}\n\n【当前认知状态（上一轮旧状态）】') ||
    text.includes('将宏观任务拆解为分批推进的具体子步骤；每个子步骤必须定义为')
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
