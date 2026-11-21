import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TEXT_CARD_DEFAULT_RATIO,
  TEXT_CARD_PLACEHOLDER_TITLE,
  buildManualTextCardData,
  buildTextCardData,
  computeTextCardNanoTitleLayout,
  computeTextCardPlacement,
  deriveTextCardTitle,
  shouldCreateTextCardForAnswer,
} from './textCard';

test('shouldCreateTextCardForAnswer only returns true for explicit non-empty full answers', () => {
  assert.equal(
    shouldCreateTextCardForAnswer({
      text: '**一、剧情主线**\n这是完整分析内容',
      speak: '已梳理完剧情',
      hasFullAnswer: true,
    }),
    true
  );

  assert.equal(
    shouldCreateTextCardForAnswer({
      text: '正在读取第1集剧本...',
      speak: '正在读取第1集剧本...',
      hasFullAnswer: false,
    }),
    false
  );

  assert.equal(
    shouldCreateTextCardForAnswer({
      text: '已完成处理',
      speak: '已完成处理',
    }),
    false
  );

  assert.equal(
    shouldCreateTextCardForAnswer({
      text: '（无需输出）',
      speak: '好的',
      hasFullAnswer: true,
    }),
    false
  );
});

test('deriveTextCardTitle prefers meaningful task title and otherwise extracts clean heading', () => {
  assert.equal(deriveTextCardTitle('**一、讲了什么**\n内容', '剧本人物梳理'), '剧本人物梳理');
  assert.equal(deriveTextCardTitle('**一、讲了什么（剧情主线）**\n内容', '尚未命名'), '讲了什么（剧情主线）');
  assert.equal(deriveTextCardTitle('## 主角列表\n内容', ''), '主角列表');
});

test('computeTextCardPlacement forks to the right of sourceCard with collision avoidance', () => {
  const source = { id: 'txt_1', x: 200, y: 100, ratio: TEXT_CARD_DEFAULT_RATIO };
  const occupiedRight = { id: 'txt_2', x: 652, y: 100, ratio: TEXT_CARD_DEFAULT_RATIO };

  const firstFork = computeTextCardPlacement({
    existingCards: [source],
    sourceCard: source,
  });
  assert.deepEqual(firstFork, { x: 652, y: 100 });

  const secondFork = computeTextCardPlacement({
    existingCards: [source, occupiedRight],
    sourceCard: source,
  });
  assert.deepEqual(secondFork, { x: 1104, y: 100 });
});

test('computeTextCardPlacement avoids overlapping existing cards on free canvas', () => {
  const existing = [{ id: 'c1', x: 432, y: 96, ratio: '3:4' }];
  const placed = computeTextCardPlacement({
    existingCards: existing,
    anchorCanvasPoint: { x: 400, y: 150 },
  });
  // Must not collide with c1 at (432, 96, 420x560)
  const overlaps =
    placed.x < existing[0].x + 420 &&
    placed.x + 420 > existing[0].x &&
    placed.y < existing[0].y + 560 &&
    placed.y + 560 > existing[0].y;
  assert.equal(overlaps, false);
});

test('buildTextCardData and buildManualTextCardData produce fixed 3:4 JSON-serializable CardData', () => {
  const agentCard = buildTextCardData({
    id: 'txt_a',
    x: 100,
    y: 200,
    title: '剧本分析',
    content: '**一、主线**\n内容',
    derivedFromId: 'txt_parent',
    sourceAgentEventId: 'evt_1',
  });

  assert.equal(agentCard.isText, true);
  assert.equal(agentCard.ratio, '3:4');
  assert.equal(agentCard.derivedFromId, 'txt_parent');
  assert.equal(agentCard.sourceAgentEventId, 'evt_1');
  assert.deepEqual(JSON.parse(JSON.stringify(agentCard)), agentCard);

  const manualCard = buildManualTextCardData('txt_m', 300, 400);
  assert.equal(manualCard.isText, true);
  assert.equal(manualCard.ratio, '3:4');
  assert.equal(manualCard.textContent, '');
  assert.deepEqual(JSON.parse(JSON.stringify(manualCard)), manualCard);
});

test('shouldTextCardCaptureWheel only captures wheel when card is selected or editing (without zoom modifiers)', async () => {
  const { shouldTextCardCaptureWheel } = await import('./textCard');
  // Merely hovered (unselected, not editing) -> false (must zoom canvas)
  assert.equal(shouldTextCardCaptureWheel({ isSelected: false, isEditing: false }), false);
  // Selected -> true (scroll text)
  assert.equal(shouldTextCardCaptureWheel({ isSelected: true, isEditing: false }), true);
  // Editing -> true (scroll text)
  assert.equal(shouldTextCardCaptureWheel({ isSelected: false, isEditing: true }), true);
  // Pinch/Ctrl zoom modifier while selected -> false (zoom canvas)
  assert.equal(
    shouldTextCardCaptureWheel({ isSelected: true, isEditing: false, ctrlKey: true }),
    false
  );
});

test('computeTextCardNanoTitleLayout renders short CJK titles as large bold 1-2 line cover typography', () => {
  const shortLayout = computeTextCardNanoTitleLayout({
    textTitle: '分镜表',
    width: 420,
    height: 550,
  });
  assert.equal(shortLayout.isPlaceholder, false);
  assert.deepEqual(shortLayout.lines, ['分镜表']);
  assert.ok(shortLayout.fontSize >= 84, `expected huge font size >= 84, got ${shortLayout.fontSize}`);

  // 4-char CJK title wraps evenly 2+2 rather than leaving a 1-char orphan
  const fourCharLayout = computeTextCardNanoTitleLayout({
    textTitle: '角色小传',
    width: 420,
    height: 550,
  });
  assert.equal(fourCharLayout.lines.length, 2);
  assert.deepEqual(fourCharLayout.lines, ['角色', '小传']);
});

test('computeTextCardNanoTitleLayout wraps medium CJK and English titles cleanly without overflow', () => {
  const mediumCjk = computeTextCardNanoTitleLayout({
    textTitle: '角色人物小传与核心冲突分析',
    width: 420,
    height: 550,
  });
  assert.equal(mediumCjk.isPlaceholder, false);
  assert.ok(mediumCjk.lines.length >= 2 && mediumCjk.lines.length <= 3);
  assert.equal(mediumCjk.lines.join(''), '角色人物小传与核心冲突分析');
  assert.ok(mediumCjk.fontSize >= 50 && mediumCjk.fontSize < 90);

  const englishTitle = computeTextCardNanoTitleLayout({
    textTitle: 'Episode 1 Beat Sheet',
    width: 420,
    height: 550,
  });
  assert.equal(englishTitle.isPlaceholder, false);
  assert.ok(englishTitle.lines.length >= 2 && englishTitle.lines.length <= 3);
  // Word boundaries preserved
  assert.equal(englishTitle.lines.join(' '), 'Episode 1 Beat Sheet');
});

test('computeTextCardNanoTitleLayout truncates excessively long titles with ellipsis within 4 lines', () => {
  const megaTitle =
    '超长标题压力测试第一幕雨夜追逐戏全部镜头分镜拆解与运镜节奏灯光参考美术风格汇总说明文档终稿版';
  const layout = computeTextCardNanoTitleLayout({
    textTitle: megaTitle,
    width: 420,
    height: 550,
  });
  assert.equal(layout.isPlaceholder, false);
  assert.ok(layout.lines.length <= 4);
  assert.ok(layout.lines[layout.lines.length - 1].endsWith('…'));
  assert.ok(layout.lines.length * layout.lineHeight <= Math.round(550 * 0.76));
});

test('computeTextCardNanoTitleLayout falls back to content heading, then placeholder, and caches by key', () => {
  const fromContent = computeTextCardNanoTitleLayout({
    textTitle: '',
    textContent: '## 第一集剧情主线\n故事发生在雨夜...',
    width: 420,
    height: 550,
  });
  assert.equal(fromContent.title, '第一集剧情主线');
  assert.equal(fromContent.isPlaceholder, false);

  const placeholder = computeTextCardNanoTitleLayout({
    textTitle: TEXT_CARD_PLACEHOLDER_TITLE,
    textContent: '',
    width: 420,
    height: 550,
  });
  assert.equal(placeholder.title, TEXT_CARD_PLACEHOLDER_TITLE);
  assert.equal(placeholder.isPlaceholder, true);

  // Cache hit returns identical object reference
  const cachedAgain = computeTextCardNanoTitleLayout({
    textTitle: TEXT_CARD_PLACEHOLDER_TITLE,
    textContent: '',
    width: 420,
    height: 550,
  });
  assert.equal(cachedAgain, placeholder);

  // Compact landscape card fits strictly inside vertical budget
  const compact = computeTextCardNanoTitleLayout({
    textTitle: '横向自定义小卡片标题测试内容较长情况',
    width: 240,
    height: 120,
  });
  assert.ok(compact.lines.length * compact.lineHeight <= 120);
});

