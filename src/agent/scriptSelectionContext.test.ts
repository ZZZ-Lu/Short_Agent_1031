import test from 'node:test';
import assert from 'node:assert/strict';
import type { ScriptProject } from '../types/script';
import {
  SCRIPT_SELECTION_MAX_CHARS,
  buildScriptSelectionSnapshot,
  computeLineRangeFromOffsets,
  formatScriptSelectionCardContext,
} from './scriptSelectionContext';
import { refreshTaskCardContext } from './cardContextBuilder';

function createSampleProject(scriptText: string): ScriptProject {
  return {
    id: 'proj_test_sel',
    name: '雪夜列车',
    logline: '暴风雪中的悬疑旅程',
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
    scriptText,
    universe: {
      era: '民国',
      artStyle: '写实电影',
      colorTone: '冷蓝琥珀',
      cinematography: '变形宽银幕',
    },
    characters: [],
    locations: [],
    props: [],
  };
}

const MULTI_SCENE_SCRIPT = [
  '第一集',
  '1-1 夜 内 卧铺车厢',
  '人物：林深、沈月',
  '车窗外暴雪呼啸，台灯在桌面投下微弱暖光。',
  '林深缓缓放下怀表，压低声音：“这封信不是昨天写的。”',
  '沈月瞳孔微缩，手指收紧了车票边缘。',
  '',
  '1-2 夜 外 站台',
  '人物：林深、列车长',
  '蒸汽从车轮间涌出，站台钟声敲响十二下。',
  '列车长提着马灯快步走来。',
].join('\n');

test('buildScriptSelectionSnapshot returns null for empty or whitespace-only selections', () => {
  const project = createSampleProject(MULTI_SCENE_SCRIPT);
  assert.equal(buildScriptSelectionSnapshot(null, project), null);
  assert.equal(buildScriptSelectionSnapshot({ text: '', start: 0, end: 0 }, project), null);
  assert.equal(buildScriptSelectionSnapshot({ text: '   \n\t  ', start: 0, end: 6 }, project), null);
});

test('single-scene selection resolves episode, scene, line range, and 1-based paragraphIndices strictly with selected text only', () => {
  const project = createSampleProject(MULTI_SCENE_SCRIPT);
  const selectedText = '林深缓缓放下怀表，压低声音：“这封信不是昨天写的。”';
  const start = MULTI_SCENE_SCRIPT.indexOf(selectedText);
  const end = start + selectedText.length;

  const snapshot = buildScriptSelectionSnapshot(
    { text: selectedText, start, end },
    project,
    1700000001234
  );

  assert.ok(snapshot);
  assert.equal(snapshot.projectId, 'proj_test_sel');
  assert.equal(snapshot.projectName, '雪夜列车');
  assert.equal(snapshot.text, selectedText);
  assert.equal(snapshot.start, start);
  assert.equal(snapshot.end, end);
  assert.equal(snapshot.lineStart, 5);
  assert.equal(snapshot.lineEnd, 5);
  assert.equal(snapshot.episodeTitle, '第一集');
  assert.equal(snapshot.sceneTitle, '1-1 夜 内 卧铺车厢');
  assert.ok(snapshot.sceneId?.startsWith('scene-2-'));
  // Line 4 is P1, Line 5 is P2 (roster line on Line 3 is skipped by extractSceneParagraphs)
  assert.deepEqual(snapshot.paragraphIndices, [2]);
  assert.equal(snapshot.spannedSceneTitles, undefined);
  assert.equal(snapshot.charCount, selectedText.length);
  assert.equal(snapshot.truncated, undefined);

  const formatted = formatScriptSelectionCardContext(snapshot);
  assert.equal(formatted.targetId, 'script.text');
  assert.ok(formatted.speak.includes('林深缓缓放下怀表'));
  assert.ok(formatted.chipLabel.includes('第5行'));
  assert.ok(formatted.chipLabel.includes(`（${selectedText.length}字）`));
  assert.ok(formatted.markdownSummary.includes('【当前聚焦的剧本正文片段】'));
  assert.ok(formatted.markdownSummary.includes('1-1 夜 内 卧铺车厢'));
  assert.ok(formatted.markdownSummary.includes('第5行'));
  assert.ok(formatted.markdownSummary.includes('场内段落 P2'));
  assert.ok(formatted.markdownSummary.includes(selectedText));

  // Strictly ONLY selected text: surrounding lines must NOT appear in markdownSummary
  assert.equal(formatted.markdownSummary.includes('车窗外暴雪呼啸'), false);
  assert.equal(formatted.markdownSummary.includes('沈月瞳孔微缩'), false);
  assert.equal(formatted.markdownSummary.includes('蒸汽从车轮间涌出'), false);
});

test('multi-scene selection captures spannedSceneTitles and per-scene paragraph refs', () => {
  const project = createSampleProject(MULTI_SCENE_SCRIPT);
  const startPhrase = '沈月瞳孔微缩，手指收紧了车票边缘。';
  const endPhrase = '蒸汽从车轮间涌出，站台钟声敲响十二下。';
  const start = MULTI_SCENE_SCRIPT.indexOf(startPhrase);
  const end = MULTI_SCENE_SCRIPT.indexOf(endPhrase) + endPhrase.length;
  const selectedText = MULTI_SCENE_SCRIPT.slice(start, end);

  const snapshot = buildScriptSelectionSnapshot({ text: selectedText, start, end }, project);
  assert.ok(snapshot);
  assert.equal(snapshot.lineStart, 6);
  assert.equal(snapshot.lineEnd, 10);
  assert.deepEqual(snapshot.spannedSceneTitles, ['1-1 夜 内 卧铺车厢', '1-2 夜 外 站台']);
  assert.equal(snapshot.sceneParagraphRefs?.length, 2);
  assert.deepEqual(snapshot.sceneParagraphRefs?.[0].paragraphIndices, [3]);
  assert.deepEqual(snapshot.sceneParagraphRefs?.[1].paragraphIndices, [1]);

  const formatted = formatScriptSelectionCardContext(snapshot);
  assert.ok(formatted.chipLabel.includes('等2场'));
  assert.ok(formatted.chipLabel.includes('第6-10行'));
  assert.ok(formatted.markdownSummary.includes('跨越 2 个场次'));
  assert.ok(formatted.markdownSummary.includes('P3'));
  assert.ok(formatted.markdownSummary.includes('P1'));
  // Unselected trailing line must NOT leak
  assert.equal(formatted.markdownSummary.includes('列车长提着马灯快步走来'), false);
});

test('truncates ultra-long selection at SCRIPT_SELECTION_MAX_CHARS cleanly and remains JSON serializable', () => {
  const longText = '台词片段测试内容'.repeat(700); // 5600 chars
  const project = createSampleProject(`1-1 日 内 客厅\n${longText}`);
  const start = project.scriptText.indexOf(longText);
  const end = start + longText.length;

  const snapshot = buildScriptSelectionSnapshot({ text: longText, start, end }, project);
  assert.ok(snapshot);
  assert.equal(snapshot.truncated, true);
  assert.equal(snapshot.charCount, longText.length);
  assert.equal(snapshot.text.length, SCRIPT_SELECTION_MAX_CHARS);

  // 100% JSON serializable round-trip
  const roundTripped = JSON.parse(JSON.stringify(snapshot));
  assert.deepEqual(roundTripped, snapshot);

  const formatted = formatScriptSelectionCardContext(snapshot);
  assert.ok(formatted.markdownSummary.includes(`原选区共 ${longText.length} 字`));
});

test('computeLineRangeFromOffsets avoids spilling to next line when selection ends with newline', () => {
  const doc = 'line1\nline2\nline3';
  const range = computeLineRangeFromOffsets(doc, 0, 6); // 'line1\n'
  assert.deepEqual(range, { lineStart: 1, lineEnd: 1 });
});

test('refreshTaskCardContext preserves frozen scriptSelection snapshot without falling back to full script preview', () => {
  const project = createSampleProject(MULTI_SCENE_SCRIPT);
  const selectedText = '林深缓缓放下怀表，压低声音：“这封信不是昨天写的。”';
  const start = MULTI_SCENE_SCRIPT.indexOf(selectedText);
  const end = start + selectedText.length;

  const snapshot = buildScriptSelectionSnapshot({ text: selectedText, start, end }, project)!;
  const formatted = formatScriptSelectionCardContext(snapshot);

  const refreshed = refreshTaskCardContext(
    {
      targetId: 'script.text',
      title: formatted.title,
      markdownSummary: formatted.markdownSummary,
      scriptSelection: snapshot,
    },
    project,
    []
  );

  assert.ok(refreshed);
  assert.equal(refreshed.targetId, 'script.text');
  assert.deepEqual(refreshed.scriptSelection, snapshot);
  assert.ok(refreshed.markdownSummary.includes(selectedText));
  assert.equal(refreshed.markdownSummary.includes('剧本开头节选'), false);
  assert.equal(refreshed.markdownSummary.includes('车窗外暴雪呼啸'), false);
});
