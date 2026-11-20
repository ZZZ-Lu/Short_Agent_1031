import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  LOCK_MANIFEST_REL_PATH,
  normalizeLineEndings,
  sha256,
  extractLockedRegion,
  computeLockManifest,
  verifyLockManifest,
} from '../scripts/core-lock.mjs';

test('sha256 normalizes CRLF and LF identically for cross-platform Windows/macOS compatibility', () => {
  assert.equal(normalizeLineEndings('a\r\nb\r\n'), 'a\nb\n');
  assert.equal(sha256('line1\r\nline2\r\n'), sha256('line1\nline2\n'));
});

test('extractLockedRegion extracts both TS // and CSS /* */ locked blocks and rejects broken markers', () => {
  const tsDoc = [
    'const before = 1;',
    '// @LOCK-START:demo-block',
    'const locked = 42;',
    '// @LOCK-END:demo-block',
    'const after = 2;',
  ].join('\n');
  assert.equal(extractLockedRegion(tsDoc, 'demo-block'), 'const locked = 42;');

  const cssDoc = [
    '.a { color: red; }',
    '/* @LOCK-START:css-block */',
    '.b { corner-shape: round !important; }',
    '/* @LOCK-END:css-block */',
  ].join('\n');
  assert.equal(extractLockedRegion(cssDoc, 'css-block'), '.b { corner-shape: round !important; }');

  assert.throws(() => extractLockedRegion('no markers here', 'demo-block'), /Missing @LOCK-START/);
  assert.throws(
    () => extractLockedRegion('// @LOCK-START:dup\n// @LOCK-START:dup\n// @LOCK-END:dup', 'dup'),
    /Duplicate @LOCK-START/
  );
  assert.throws(
    () => extractLockedRegion('// @LOCK-END:bad\n// @LOCK-START:bad', 'bad'),
    /Invalid marker order/
  );
});

test('verifyLockManifest detects whole-file tampering, region tampering, and ignores edits outside locked regions', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'core-lock-test-'));
  try {
    fs.mkdirSync(path.join(tmpDir, 'src'), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, 'src/core.ts'), 'export const CORE = 1;\n', 'utf8');
    fs.writeFileSync(
      path.join(tmpDir, 'src/host.ts'),
      [
        'export const freeTop = 1;',
        '// @LOCK-START:sec-a',
        'export const protectedVal = 100;',
        '// @LOCK-END:sec-a',
        'export const freeBottom = 2;',
      ].join('\n'),
      'utf8'
    );

    const config = {
      files: [{ group: 'canvas-core', path: 'src/core.ts' }],
      regions: [{ group: 'canvas-core', path: 'src/host.ts', region: 'sec-a' }],
    };

    const manifest = computeLockManifest(tmpDir, config);
    assert.equal(verifyLockManifest(tmpDir, manifest).ok, true);

    // Editing OUTSIDE the locked region in host.ts MUST still pass!
    fs.writeFileSync(
      path.join(tmpDir, 'src/host.ts'),
      [
        'export const freeTop = 999; // business feature update',
        '// @LOCK-START:sec-a',
        'export const protectedVal = 100;',
        '// @LOCK-END:sec-a',
        'export const freeBottom = 888;',
      ].join('\n'),
      'utf8'
    );
    assert.equal(verifyLockManifest(tmpDir, manifest).ok, true);

    // Editing INSIDE the locked region in host.ts MUST fail!
    fs.writeFileSync(
      path.join(tmpDir, 'src/host.ts'),
      [
        'export const freeTop = 999;',
        '// @LOCK-START:sec-a',
        'export const protectedVal = 200;',
        '// @LOCK-END:sec-a',
        'export const freeBottom = 888;',
      ].join('\n'),
      'utf8'
    );
    const regionFail = verifyLockManifest(tmpDir, manifest);
    assert.equal(regionFail.ok, false);
    assert.equal(regionFail.violations.length, 1);
    assert.equal(regionFail.violations[0].target, 'src/host.ts#sec-a');
    assert.equal(regionFail.violations[0].reason, 'modified');

    // Editing a locked whole file MUST fail!
    fs.writeFileSync(path.join(tmpDir, 'src/core.ts'), 'export const CORE = 2;\n', 'utf8');
    const bothFail = verifyLockManifest(tmpDir, manifest);
    assert.equal(bothFail.ok, false);
    assert.equal(bothFail.violations.length, 2);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('workspace locks/core-locks.json matches all locked foundational files and regions', () => {
  const rootDir = process.cwd();
  const manifestPath = path.join(rootDir, LOCK_MANIFEST_REL_PATH);
  assert.ok(fs.existsSync(manifestPath), `Expected ${LOCK_MANIFEST_REL_PATH} to exist`);
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const result = verifyLockManifest(rootDir, manifest);
  assert.equal(result.ok, true, `Unexpected lock violations: ${JSON.stringify(result.violations)}`);
  assert.ok(result.checkedFiles >= 40);
  assert.equal(result.checkedRegions, 9);
});
