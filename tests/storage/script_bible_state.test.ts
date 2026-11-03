import test from 'node:test';
import assert from 'node:assert/strict';

// Test state restoration helper functions used for localStorage persistence
function parseSidePanelState(saved: string | null): 'assets' | 'universe' | 'cards' | null {
  if (saved === 'null' || saved === 'closed') return null;
  if (saved === 'assets' || saved === 'universe' || saved === 'cards') return saved;
  return 'assets';
}

function parseAssetFilterState(saved: string | null): 'all' | 'characters' | 'locations' | 'props' {
  if (saved === 'all' || saved === 'characters' || saved === 'locations' || saved === 'props') {
    return saved;
  }
  return 'all';
}

function parseDrawerOpenState(saved: string | null): boolean {
  if (saved !== null) return saved === 'true';
  return false;
}

test('parseSidePanelState preserves null (collapsed mini-card)', () => {
  assert.equal(parseSidePanelState('null'), null);
  assert.equal(parseSidePanelState('closed'), null);
});

test('parseSidePanelState preserves expanded tabs (assets, universe, cards)', () => {
  assert.equal(parseSidePanelState('assets'), 'assets');
  assert.equal(parseSidePanelState('universe'), 'universe');
  assert.equal(parseSidePanelState('cards'), 'cards');
});

test('parseSidePanelState falls back to assets on undefined or unknown values', () => {
  assert.equal(parseSidePanelState(null), 'assets');
  assert.equal(parseSidePanelState('invalid-value'), 'assets');
});

test('parseAssetFilterState preserves filter types and defaults to all', () => {
  assert.equal(parseAssetFilterState('characters'), 'characters');
  assert.equal(parseAssetFilterState('locations'), 'locations');
  assert.equal(parseAssetFilterState('props'), 'props');
  assert.equal(parseAssetFilterState('all'), 'all');
  assert.equal(parseAssetFilterState(null), 'all');
  assert.equal(parseAssetFilterState('unknown'), 'all');
});

test('parseDrawerOpenState preserves open/closed across reload', () => {
  assert.equal(parseDrawerOpenState('true'), true);
  assert.equal(parseDrawerOpenState('false'), false);
  assert.equal(parseDrawerOpenState(null), false);
});
