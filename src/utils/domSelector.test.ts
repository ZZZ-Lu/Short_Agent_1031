import test from 'node:test';
import assert from 'node:assert/strict';
import { escapeAttrSelectorValue, findAssetRowElement, safeQuerySelector } from './domSelector';

test('escapeAttrSelectorValue escapes backslashes and double quotes safely', () => {
  assert.equal(escapeAttrSelectorValue('abc_123'), 'abc_123');
  assert.equal(escapeAttrSelectorValue('char"1\\test'), 'char\\"1\\\\test');
  assert.equal(escapeAttrSelectorValue(undefined), '');
  assert.equal(escapeAttrSelectorValue(null), '');
});

test('safeQuerySelector catches invalid CSS selector errors and returns null', () => {
  const throwingRoot = {
    querySelector() {
      throw new Error('SyntaxError: invalid selector');
    },
  } as unknown as ParentNode;

  assert.equal(safeQuerySelector(throwingRoot, '[data-agent-target="bad["]'), null);
  assert.equal(safeQuerySelector(null, '[data-agent-target="ok"]'), null);
  assert.equal(safeQuerySelector(throwingRoot, ''), null);
});

test('findAssetRowElement prefers canonical parent version selector before fallback', () => {
  const seenSelectors: string[] = [];
  const fakeEl = { id: 'hit' } as unknown as HTMLElement;
  const mockRoot = {
    querySelector(sel: string) {
      seenSelectors.push(sel);
      if (sel === '[data-agent-target="assets.item.character.char_1.version.char_1"]') {
        return fakeEl;
      }
      return null;
    },
  } as unknown as ParentNode;

  const found = findAssetRowElement(mockRoot, {
    category: 'character',
    itemId: 'char_1',
    parentId: 'char_1',
    isVersion: true,
  });
  assert.equal(found, fakeEl);
  assert.deepEqual(seenSelectors, ['[data-agent-target="assets.item.character.char_1.version.char_1"]']);
});

test('findAssetRowElement returns null safely when itemId is missing', () => {
  const mockRoot = {
    querySelector() {
      throw new Error('should not query');
    },
  } as unknown as ParentNode;

  assert.equal(findAssetRowElement(mockRoot, { category: 'character', itemId: '' }), null);
  assert.equal(findAssetRowElement(mockRoot, { category: 'character' }), null);
});
