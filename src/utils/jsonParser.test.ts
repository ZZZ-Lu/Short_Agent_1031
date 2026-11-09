import test from 'node:test';
import assert from 'node:assert/strict';
import { autoCloseJsonString, robustParseJson } from './jsonParser.js';

test('autoCloseJsonString - correctly closes unclosed quotes, brackets, and braces', () => {
  // Simple unclosed object
  assert.equal(autoCloseJsonString('{"name": "Natalia"'), '{"name": "Natalia"}');

  // Unclosed string value
  assert.equal(autoCloseJsonString('{"name": "Natalia'), '{"name": "Natalia"}');

  // Deeply nested unclosed structures
  assert.equal(
    autoCloseJsonString('{"id": "char_1", "updates": {"description": "心理医生"'),
    '{"id": "char_1", "updates": {"description": "心理医生"}}'
  );

  // Unclosed array of objects
  assert.equal(
    autoCloseJsonString('{"items": [{"id": 1, "label": "test"'),
    '{"items": [{"id": 1, "label": "test"}]}'
  );

  // Trailing comma cleanup before closing
  assert.equal(
    autoCloseJsonString('{"a": 1, "b": 2,'),
    '{"a": 1, "b": 2}'
  );

  // Escaped quotes inside strings
  assert.equal(
    autoCloseJsonString('{"quote": "She said \\"hello\\" to him'),
    '{"quote": "She said \\"hello\\" to him"}'
  );
});

test('robustParseJson - parses valid JSON and markdown wrapped JSON', () => {
  assert.deepEqual(robustParseJson('{"success": true}'), { success: true });
  assert.deepEqual(
    robustParseJson('```json\n{"action": "read", "target": "script"}\n```'),
    { action: 'read', target: 'script' }
  );
});

test('robustParseJson - heals Turn 22 missing closing brace defect', () => {
  // Model generated 3 braces instead of 4:
  // {"id": "char_1", "updates": {"description": "心理医生", "provenances": [{"line": 12}]}}
  const payloadMissingBrace = '{"id": "char_1", "updates": {"description": "心理医生", "provenances": [{"line": 12}]';
  const result = robustParseJson(payloadMissingBrace);
  assert.ok(result);
  assert.equal(result.id, 'char_1');
  assert.equal(result.updates?.description, '心理医生');
  assert.equal(result.updates?.provenances?.[0]?.line, 12);
});

test('robustParseJson - repairs common LLM syntax deviations', () => {
  // Trailing commas in object & array
  const trailingComma = '{"list": [1, 2, ], "active": true, }';
  assert.deepEqual(robustParseJson(trailingComma), { list: [1, 2], active: true });

  // Missing commas across newlines
  const missingComma = '{\n  "name": "Natalia"\n  "age": 22\n}';
  assert.deepEqual(robustParseJson(missingComma), { name: 'Natalia', age: 22 });

  // Unquoted keys
  const unquotedKeys = '{name: "Natalia", age: 22}';
  assert.deepEqual(robustParseJson(unquotedKeys), { name: 'Natalia', age: 22 });

  // Single-quoted strings
  const singleQuotes = "{'title': '布莱克伍德家族'}";
  assert.deepEqual(robustParseJson(singleQuotes), { title: '布莱克伍德家族' });

  // Leading explanation text before JSON
  const withLeadingText = 'Here is the result:\n{"status": "ok", "count": 5}';
  assert.deepEqual(robustParseJson(withLeadingText), { status: 'ok', count: 5 });
});

test('robustParseJson - heals truncated state node JSON with multiline notes and unclosed strings', () => {
  // Error 0 style: truncated mid-word in notes
  const truncated0 = '{"stateCheck":"本轮成功","taskTitle":"提取角色娜塔莉亚","goal":"从剧本提取","subGoal":"创建资产","progress":"进行中","plan":[{"id":"1","title":"探查","status":"completed"}],"notes":"- 用户指令：提取角色娜塔莉亚...- 本轮已装载 script.read、asset.create、ass';
  const res0 = robustParseJson(truncated0);
  assert.ok(res0);
  assert.equal(res0.taskTitle, '提取角色娜塔莉亚');
  assert.equal(res0.subGoal, '创建资产');
  assert.equal(res0.plan.length, 1);
  assert.ok(res0.notes.endsWith('ass'));

  // Error 1 style: truncated with raw newline inside string
  const truncated1 = '{"stateCheck":"本轮成功","taskTitle":"提取角色娜塔莉亚","goal":"从剧本提取","subGoal":"创建资产","progress":"进行中","plan":[{"id":"1","title":"探查","status":"completed"}],"notes":"- 用户指令...段6为“【闪回】”，均非其出场。\n';
  const res1 = robustParseJson(truncated1);
  assert.ok(res1);
  assert.equal(res1.taskTitle, '提取角色娜塔莉亚');
  assert.equal(res1.subGoal, '创建资产');
  assert.ok(res1.notes.includes('【闪回】'));

  // Raw literal newlines inside complete JSON string
  const multilineNotes = '{"stateCheck": "ok", "notes": "line1\nline2\nline3"}';
  const res2 = robustParseJson(multilineNotes);
  assert.ok(res2);
  assert.equal(res2.notes, 'line1\nline2\nline3');
});

