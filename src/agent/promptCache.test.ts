import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  normalizeTokenUsage,
  splitPromptForPrefixCache,
  splitStateNodePromptForPrefixCache,
} from './promptCache';
import { isObsoletePromptText } from '../utils/promptPersistence';

const readPromptFile = (name: string) =>
  fs.readFileSync(path.join(process.cwd(), 'src/agent', name), 'utf-8');

test('Level 0 and Level 1 prompt templates share identical static header and are not flagged obsolete', () => {
  const planning = readPromptFile('systemPrompt.txt');
  const execution = readPromptFile('systemPromptExecution.txt');
  const state = readPromptFile('stateNodePrompt.txt');

  assert.equal(isObsoletePromptText(planning), false);
  assert.equal(isObsoletePromptText(execution), false);
  assert.equal(isObsoletePromptText(state), false);

  const marker = '# 当前阶段职责与工作指南';
  const planningHeader = planning.slice(0, planning.indexOf(marker)).trim();
  const executionHeader = execution.slice(0, execution.indexOf(marker)).trim();

  assert.ok(planningHeader.length >= 550, 'Shared header should exceed 4x64-token cache blocks');
  assert.equal(planningHeader, executionHeader, 'L0 and L1 shared header must be byte-for-byte identical');
});

test('splitPromptForPrefixCache cleanly separates static system prefix from dynamic user suffix', () => {
  const planningTemplate = readPromptFile('systemPrompt.txt');
  const rendered = planningTemplate
    .replaceAll('{{toolPrompt}}', '## 当前可直接调用\n- user.ask：提问\n- sys.selectContext：选工具')
    .replaceAll('{{userMessage}}', '只看第一集，提取角色娜塔莉亚')
    .replaceAll('{{cardContext}}', '# 目标卡片上下文信息 (Selected Card Context)\n- 卡片ID：card_1\n- 角色数量：0')
    .replaceAll('{{taskTitle}}', '提取娜塔莉亚角色')
    .replaceAll('{{taskGoal}}', '提取娜塔莉亚')
    .replaceAll('{{taskPlan}}', '[ ] 1. 探查项目')
    .replaceAll('{{taskNotes}}', '暂无笔记')
    .replaceAll('{{taskSubGoal}}', '展开分类')
    .replaceAll('{{taskProgress}}', '第1轮') +
    '\n\n# 工具执行结果\n【工具 script.read 执行成功】\n# 第一集\n1-1 场景内容\n\n【⚠️ 系统重要提示：本轮必须调用工具】请输出调用。';

  const { systemPrompt, userPrompt } = splitPromptForPrefixCache(rendered);

  assert.ok(systemPrompt.includes('# 角色与通用准则'));
  assert.ok(systemPrompt.includes('# 当前阶段职责与工作指南'));
  assert.ok(systemPrompt.includes('# 输出格式'));
  assert.ok(systemPrompt.includes('# 可用工具'));

  // Static system prompt must never leak dynamic placeholders/sections
  assert.equal(systemPrompt.includes('# 用户指令'), false);
  assert.equal(systemPrompt.includes('# 认知状态'), false);
  assert.equal(systemPrompt.includes('# 工具执行结果'), false);
  assert.equal(systemPrompt.includes('# 目标卡片上下文信息'), false);
  assert.equal(systemPrompt.includes('只看第一集，提取角色娜塔莉亚'), false);
  assert.equal(systemPrompt.includes('【⚠️ 系统重要提示：'), false);

  // User prompt retains exact order: # 用户指令 (initial goal before cardContext) -> # 认知状态 -> # 工具执行结果 -> nudge
  const idxCmd = userPrompt.indexOf('# 用户指令');
  const idxInitGoal = userPrompt.indexOf('## 初始任务指令');
  const idxCardCtx = userPrompt.indexOf('## 当前聚焦目标');
  const idxState = userPrompt.indexOf('# 认知状态');
  const idxObs = userPrompt.indexOf('# 工具执行结果');
  const idxNudge = userPrompt.indexOf('【⚠️ 系统重要提示：');

  assert.ok(idxCmd !== -1 && idxInitGoal !== -1 && idxCardCtx !== -1);
  assert.ok(idxInitGoal < idxCardCtx, 'Initial user goal must precede mutable cardContext');
  assert.ok(idxCmd < idxState && idxState < idxObs && idxObs < idxNudge);
  assert.ok(userPrompt.includes('# 第一集'), 'Arbitrary # headings inside tool output stay in userPrompt');
});

test('splitPromptForPrefixCache detaches trailing nudge even when custom template ends with a static heading', () => {
  const custom = [
    '# 背景',
    '你是 Mira。',
    '# 用户指令',
    '提取角色。',
    '# 可用工具',
    '- script.read：读取剧本',
    '',
    '【⚠️ 系统重要提示：本轮必须调用工具】请立即调用。',
  ].join('\n');

  const { systemPrompt, userPrompt } = splitPromptForPrefixCache(custom);
  assert.ok(systemPrompt.includes('# 可用工具'));
  assert.equal(systemPrompt.includes('【⚠️ 系统重要提示：'), false);
  assert.ok(userPrompt.includes('【⚠️ 系统重要提示：'));
  assert.ok(userPrompt.includes('# 用户指令'));
});

test('splitStateNodePromptForPrefixCache puts static instructions and JSON schema in system and dynamic data in user', () => {
  const stateTemplate = readPromptFile('stateNodePrompt.txt');
  const rendered = stateTemplate
    .replace('{{taskTitle}}', '提取娜塔莉亚角色')
    .replace('{{taskGoal}}', '提取第一集娜塔莉亚')
    .replace('{{taskPlan}}', '[{"id":"1","title":"读取并创建","status":"pending"}]')
    .replace('{{taskNotes}}', '暂无笔记')
    .replace('{{taskSubGoal}}', '读取1-5')
    .replace('{{taskProgress}}', '刚刚开始')
    .replace('{{userMessage}}', '提取娜塔莉亚')
    .replace('{{cardContext}}', '角色数: 0')
    .replace('{{currentStage}}', '局部执行阶段')
    .replace('{{lastTurnOutput}}', '已调用 script.read');

  const { systemPrompt, userPrompt } = splitStateNodePromptForPrefixCache(rendered);
  assert.ok(systemPrompt.includes('【输出格式（严格输出合法 JSON）】'));
  assert.ok(systemPrompt.includes('"notesMode": "overwrite"'));
  assert.equal(systemPrompt.includes('- 用户指令/回复:'), false);
  assert.equal(systemPrompt.includes('- 任务标题:'), false);
  assert.equal(systemPrompt.includes('提取娜塔莉亚角色'), false);
  assert.ok(userPrompt.startsWith('【任务背景与聚焦目标】'));

  const idxBg = userPrompt.indexOf('【任务背景与聚焦目标】');
  const idxPrev = userPrompt.indexOf('【当前认知状态（上一轮旧状态）】');
  const idxFlow = userPrompt.indexOf('【本轮最新流向与主循环输出】');
  assert.ok(idxBg !== -1 && idxPrev !== -1 && idxFlow !== -1);
  assert.ok(idxBg < idxPrev && idxPrev < idxFlow, 'Invariant user goal/cardContext must precede mutable state');
  assert.ok(userPrompt.includes('已调用 script.read'));

  // Also verify legacy bottom-schema custom template is still split cleanly
  const legacyCustom = [
    '你是一个认知状态增量合并与整理节点。',
    '你的职责是：对照【当前认知状态（上一轮旧状态）】，读取【本轮最新输入与主循环输出】，合并整理为最新 JSON。',
    '【当前认知状态（上一轮旧状态）】',
    '- 任务标题: 旧任务',
    '【本轮最新输入与主循环输出】',
    '- Agent 主循环输出: 测试',
    '【输出格式（严格输出合法 JSON）】',
    '{"stateCheck": "...", "taskTitle": "...", "goal": "...", "notesMode": "overwrite"}',
  ].join('\n');
  const legacySplit = splitStateNodePromptForPrefixCache(legacyCustom);
  assert.ok(legacySplit.systemPrompt.includes('"notesMode": "overwrite"'));
  assert.equal(legacySplit.systemPrompt.includes('旧任务'), false);
  assert.ok(legacySplit.userPrompt.includes('旧任务'));
});

test('normalizeTokenUsage supports DeepSeek and OpenAI cached token formats', () => {
  const ds = normalizeTokenUsage({
    prompt_tokens: 4000,
    completion_tokens: 300,
    total_tokens: 4300,
    prompt_cache_hit_tokens: 3200,
    prompt_cache_miss_tokens: 800,
  });
  assert.deepEqual(ds, {
    promptTokens: 4000,
    completionTokens: 300,
    totalTokens: 4300,
    cacheHitTokens: 3200,
    cacheMissTokens: 800,
    hitRate: 0.8,
  });

  const oai = normalizeTokenUsage({
    prompt_tokens: 2000,
    completion_tokens: 100,
    total_tokens: 2100,
    prompt_tokens_details: { cached_tokens: 1500 },
  });
  assert.deepEqual(oai, {
    promptTokens: 2000,
    completionTokens: 100,
    totalTokens: 2100,
    cacheHitTokens: 1500,
    cacheMissTokens: 500,
    hitRate: 0.75,
  });

  assert.equal(normalizeTokenUsage(null), undefined);
  assert.equal(normalizeTokenUsage({}), undefined);
});
