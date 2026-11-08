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
