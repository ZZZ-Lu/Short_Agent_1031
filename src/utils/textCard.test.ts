import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TEXT_CARD_DEFAULT_RATIO,
  buildManualTextCardData,
  buildTextCardData,
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
