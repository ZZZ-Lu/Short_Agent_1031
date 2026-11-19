import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildTocAttemptKey,
  computeScriptTocSignature,
  createFallbackTocConfig,
  extractTocConfigFromResponse,
  hasReusableAiTocConfig,
  parseTocItemsFromScript,
  resolveTocModelRequestConfig,
  resolveTocRecognitionState,
  shouldTriggerModelTocInference,
} from './scriptToc';
import { sliceScriptIntoScenes } from './slicer';
import { readScriptDirectory } from '../agent/scriptTools';

const STANDARD_SCRIPT = [
  '第一集 风暴前夜',
  '1-1 夜 外 码头',
  '海浪拍打着礁石，林川站在集装箱旁。',
  '1-2 夜 内 仓库',
  '沈璃推门而入，手电光扫过地面。',
  '第二集 迷雾追踪',
  '2-1 日 内 警局办公室',
  '周队长翻开卷宗。',
].join('\n');

const CUSTOM_FORMAT_SCRIPT = [
  '【序幕】雨夜惊变',
  '◆ 镜头01 港口老仓库',
  '1-2 分钟后，远处传来警笛声。',
  '◆ 镜头02 地下室走廊',
  '脚步声在回廊中回响。',
  '【正篇·卷一】暗流涌动',
  '◆ 镜头03 审讯室',
  '台灯照亮了桌上的照片。',
].join('\n');

test('model-first priority: pending state never prematurely runs local fallback script', () => {
  const attempted = new Set<string>();
  const state = resolveTocRecognitionState({
    projectId: 'proj-1',
    scriptText: STANDARD_SCRIPT,
    tocConfig: null,
    isInferring: false,
    attemptedKeys: attempted,
  });

  assert.equal(state, 'pending');
  assert.equal(
    shouldTriggerModelTocInference({
      projectId: 'proj-1',
      scriptText: STANDARD_SCRIPT,
      tocConfig: null,
      attemptedKeys: attempted,
    }),
    true
  );

  // Must NOT return hardcoded fallback script results while waiting for the model node
  const items = parseTocItemsFromScript(STANDARD_SCRIPT, {
    state,
    tocConfig: null,
  });
  assert.deepEqual(items, []);
});

test('model-first priority: legacy or heuristic cached tocConfig upgrades to model node on fresh load', () => {
  const attempted = new Set<string>();
  const heuristicConfig = createFallbackTocConfig('no_api_key', computeScriptTocSignature(STANDARD_SCRIPT));
  const legacyUntaggedConfig = { patterns: ['^第[0-9]+集.*'], flags: 'gim' };

  assert.equal(hasReusableAiTocConfig(heuristicConfig, STANDARD_SCRIPT), false);
  assert.equal(hasReusableAiTocConfig(legacyUntaggedConfig, STANDARD_SCRIPT), false);

  assert.equal(
    shouldTriggerModelTocInference({
      projectId: 'proj-1',
      scriptText: STANDARD_SCRIPT,
      tocConfig: heuristicConfig,
      attemptedKeys: attempted,
    }),
    true
  );
  assert.equal(
    resolveTocRecognitionState({
      projectId: 'proj-1',
      scriptText: STANDARD_SCRIPT,
      tocConfig: heuristicConfig,
      isInferring: false,
      attemptedKeys: attempted,
    }),
    'pending'
  );
});

test('AI mode uses model-recognized rules exclusively without builtin regex pollution', () => {
  const sig = computeScriptTocSignature(CUSTOM_FORMAT_SCRIPT);
  const aiConfig = extractTocConfigFromResponse(
    {
      tocPattern: '^【(?:序幕|正篇[^】]*)】.*',
      scenePattern: '^◆\\s*镜头\\d+.*',
      flags: 'gim',
      patternDescription: '方括号卷章 + 菱形镜头格式',
      types: [
        { regex: '^【(?:序幕|正篇[^】]*)】.*', type: 'episode' },
        { regex: '^◆\\s*镜头\\d+.*', type: 'scene' },
      ],
      confidence: 'ai',
      modelUsed: 'deepseek-flash',
    },
    sig
  );

  assert.equal(aiConfig.confidence, 'ai');
  assert.equal(hasReusableAiTocConfig(aiConfig, CUSTOM_FORMAT_SCRIPT), true);

  // Should be 100% JSON serializable
  const roundTripped = JSON.parse(JSON.stringify(aiConfig));
  assert.deepEqual(roundTripped, aiConfig);

  const attempted = new Set<string>();
  assert.equal(
    shouldTriggerModelTocInference({
      projectId: 'proj-custom',
      scriptText: CUSTOM_FORMAT_SCRIPT,
      tocConfig: aiConfig,
      attemptedKeys: attempted,
    }),
    false
  );

  const state = resolveTocRecognitionState({
    projectId: 'proj-custom',
    scriptText: CUSTOM_FORMAT_SCRIPT,
    tocConfig: aiConfig,
    isInferring: false,
    attemptedKeys: attempted,
  });
  assert.equal(state, 'ai');

  const items = parseTocItemsFromScript(CUSTOM_FORMAT_SCRIPT, {
    state,
    tocConfig: aiConfig,
  });

  // Notice "1-2 分钟后，远处传来警笛声。" is NOT falsely matched as a scene!
  assert.equal(items.length, 5);
  assert.deepEqual(
    items.map((item) => ({ title: item.title, type: item.type })),
    [
      { title: '序幕', type: 'episode' },
      { title: '◆ 镜头01 港口老仓库', type: 'scene' },
      { title: '◆ 镜头02 地下室走廊', type: 'scene' },
      { title: '正篇·卷一', type: 'episode' },
      { title: '◆ 镜头03 审讯室', type: 'scene' },
    ]
  );
});

test('AI mode safety net falls back to builtin script if AI returns invalid or zero-match regex', () => {
  const brokenAiConfig = extractTocConfigFromResponse({
    tocPattern: '[unclosed-regex',
    scenePattern: '^NEVER_MATCHES_ANYTHING_XYZ$',
    confidence: 'ai',
  });

  const items = parseTocItemsFromScript(STANDARD_SCRIPT, {
    state: 'ai',
    tocConfig: brokenAiConfig,
  });

  assert.ok(items.length >= 5, 'Should recover headings via safety net when AI regex fails to match');
  assert.equal(items[0].title, '第一集 风暴前夜');
});

test('heuristic/fallback mode only runs after model attempt fails or is unavailable', () => {
  const attemptKey = buildTocAttemptKey('proj-1', STANDARD_SCRIPT);
  const attempted = new Set<string>([attemptKey]);
  const heuristicConfig = extractTocConfigFromResponse(
    {
      tocPattern: '^第?\\s*[0-9一二三四五六七八九十百千]+\\s*[集话回].*',
      scenePattern: '^\\d+\\s*[-—–]\\s*\\d+.*',
      flags: 'gim',
      confidence: 'heuristic',
      fallbackReason: 'no_api_key',
    },
    computeScriptTocSignature(STANDARD_SCRIPT)
  );

  // Within the same session, do not loop indefinitely once attempted unless forced
  assert.equal(
    shouldTriggerModelTocInference({
      projectId: 'proj-1',
      scriptText: STANDARD_SCRIPT,
      tocConfig: heuristicConfig,
      attemptedKeys: attempted,
    }),
    false
  );
  assert.equal(
    shouldTriggerModelTocInference({
      projectId: 'proj-1',
      scriptText: STANDARD_SCRIPT,
      tocConfig: heuristicConfig,
      attemptedKeys: attempted,
      force: true,
    }),
    true
  );

  const state = resolveTocRecognitionState({
    projectId: 'proj-1',
    scriptText: STANDARD_SCRIPT,
    tocConfig: heuristicConfig,
    isInferring: false,
    attemptedKeys: attempted,
  });
  assert.equal(state, 'heuristic');

  const items = parseTocItemsFromScript(STANDARD_SCRIPT, {
    state,
    tocConfig: heuristicConfig,
  });
  assert.equal(items.length, 5);
  assert.equal(items[0].type, 'episode');
  assert.equal(items[1].type, 'scene');
  assert.equal(items[3].type, 'episode');
});

test('resolveTocModelRequestConfig resolves Parser node first and Agent model second with matching keys', () => {
  const resolved = resolveTocModelRequestConfig({
    nodeModels: {
      tocInferModel: 'qwen3.8-flash',
      agentModel: 'deepseek-v4-flash',
    },
    keys: {
      qwenKey: 'sk-qwen-123',
      deepseekKey: 'sk-ds-456',
    },
  });

  assert.equal(resolved.modelType, 'qwen3.8-flash');
  assert.equal(resolved.apiKey, 'sk-qwen-123');
  assert.equal(resolved.agentModelType, 'deepseek-v4-flash');
  assert.equal(resolved.agentApiKey, 'sk-ds-456');
});

test('sliceScriptIntoScenes and readScriptDirectory honor AI patterns exclusively when preferCustomOnly is true', () => {
  const scenes = sliceScriptIntoScenes(CUSTOM_FORMAT_SCRIPT, '^◆\\s*镜头\\d+.*', 'gim', {
    tocPattern: '^【(?:序幕|正篇[^】]*)】.*',
    preferCustomOnly: true,
  });

  // Should match the 3 ◆ 镜头 scenes and NOT falsely slice "1-2 分钟后"
  assert.equal(scenes.length, 3);
  assert.equal(scenes[0].episodeTitle, '序幕');
  assert.equal(scenes[0].title, '◆ 镜头01 港口老仓库');
  assert.equal(scenes[2].episodeTitle, '正篇·卷一');

  const directory = readScriptDirectory(CUSTOM_FORMAT_SCRIPT, {
    tocPattern: '^【(?:序幕|正篇[^】]*)】.*',
    scenePattern: '^◆\\s*镜头\\d+.*',
    flags: 'gim',
    preferCustomOnly: true,
  });
  assert.equal(directory.length, 2);
  assert.equal(directory[0].title, '【序幕】雨夜惊变');
  assert.equal(directory[0].sceneCount, 2);
  assert.equal(directory[1].title, '【正篇·卷一】暗流涌动');
  assert.equal(directory[1].sceneCount, 1);
});

test('extractTocConfigFromResponse handles LLM responses with string-only types array cleanly', () => {
  const config = extractTocConfigFromResponse({
    tocPattern: '^第[0-9一二三四五六七八九十百千万]+集(?:\\s+.*)?$',
    scenePattern: '^\\d+-\\d+\\s+\\S+\\s+\\S+\\s+.*$',
    types: ['toc', 'scene'],
    flags: 'm',
    confidence: 'ai',
    modelUsed: 'gemini-4-hydrogen',
  });

  assert.equal(config.confidence, 'ai');
  assert.equal(config.types, undefined);
  assert.equal(config.patterns?.length, 2);

  const items = parseTocItemsFromScript(STANDARD_SCRIPT, {
    state: 'ai',
    tocConfig: config,
  });
  assert.equal(items.length, 5);
  assert.equal(items[0].type, 'episode');
  assert.equal(items[1].type, 'scene');
  assert.equal(items[3].type, 'episode');
});
