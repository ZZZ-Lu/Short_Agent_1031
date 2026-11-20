import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Core Foundational Code Integrity Lock (SHA-256)
 *
 * Prevents accidental edits to performance-critical canvas rendering/LOD,
 * incremental storage/backup, media pipeline, and geometry foundation code.
 *
 * Usage:
 *   node scripts/core-lock.mjs check
 *   node scripts/core-lock.mjs update --confirm-unlock
 */

export const LOCK_MANIFEST_REL_PATH = 'locks/core-locks.json';

export const CORE_LOCK_CONFIG = {
  files: [
    // Lock verifier itself (prevents silent weakening of the guard)
    { group: 'lock-guard', path: 'scripts/core-lock.mjs' },

    // Group 1: Canvas zoom, LOD & 60fps rendering kernel
    { group: 'canvas-core', path: 'src/utils/lodHandoff.ts' },
    { group: 'canvas-core', path: 'src/utils/canvasPerformance.ts' },
    { group: 'canvas-core', path: 'src/utils/canvasRecoveryPolicy.ts' },
    { group: 'canvas-core', path: 'src/utils/viewportCulling.ts' },
    { group: 'canvas-core', path: 'src/utils/quadTree.ts' },
    { group: 'canvas-core', path: 'src/utils/devicePixelBudget.ts' },
    { group: 'canvas-core', path: 'src/utils/cardLodAppearance.ts' },
    { group: 'canvas-core', path: 'src/utils/promptSurfaceCache.ts' },
    { group: 'canvas-core', path: 'src/components/CardImageCanvas.tsx' },
    { group: 'canvas-core', path: 'src/components/NanoLodCanvas.tsx' },
    { group: 'canvas-core', path: 'src/components/CanvasGridBackground.tsx' },
    { group: 'canvas-core', path: 'src/components/ProgressiveGenerationCard.tsx' },

    // Group 2: Incremental storage, local folder mirror & lossless backup archive
    { group: 'storage-core', path: 'src/db.ts' },
    { group: 'storage-core', path: 'src/utils/draftDb.ts' },
    { group: 'storage-core', path: 'src/storage/storage.worker.ts' },
    { group: 'storage-core', path: 'src/storage/backend.ts' },
    { group: 'storage-core', path: 'src/storage/repository.ts' },
    { group: 'storage-core', path: 'src/storage/client.ts' },
    { group: 'storage-core', path: 'src/storage/codec.ts' },
    { group: 'storage-core', path: 'src/storage/merge.ts' },
    { group: 'storage-core', path: 'src/storage/projectMeta.ts' },
    { group: 'storage-core', path: 'src/storage/localFolderMirror.ts' },
    { group: 'storage-core', path: 'src/storage/backupArchive.ts' },

    // Group 3: Image/video texture cache, off-thread resizing & video lazy-mount pipeline
    { group: 'media-pipeline', path: 'src/utils/imageTextureCache.ts' },
    { group: 'media-pipeline', path: 'src/utils/thumbnail.ts' },
    { group: 'media-pipeline', path: 'src/utils/imageHeader.ts' },
    { group: 'media-pipeline', path: 'src/utils/imageResize.ts' },
    { group: 'media-pipeline', path: 'src/utils/imageResize.worker.ts' },
    { group: 'media-pipeline', path: 'src/workers/imageProcessor.worker.ts' },
    { group: 'media-pipeline', path: 'src/utils/gpuImageProcessor.ts' },
    { group: 'media-pipeline', path: 'src/utils/yieldToMain.ts' },
    { group: 'media-pipeline', path: 'src/utils/videoAssetPipeline.ts' },
    { group: 'media-pipeline', path: 'src/utils/videoFrameBus.ts' },
    { group: 'media-pipeline', path: 'src/utils/videoPauseTransition.ts' },
    { group: 'media-pipeline', path: 'src/utils/videoProgress.ts' },

    // Group 4: Pure geometry & low-level canvas interaction math
    { group: 'geometry-interaction', path: 'src/utils/canvasCameraFocus.ts' },
    { group: 'geometry-interaction', path: 'src/utils/canvasPointerPassThrough.ts' },
    { group: 'geometry-interaction', path: 'src/utils/lineageGeometry.ts' },
    { group: 'geometry-interaction', path: 'src/utils/rightClickGesture.ts' },
    { group: 'geometry-interaction', path: 'src/utils/imageLightboxTransform.ts' },
    { group: 'geometry-interaction', path: 'src/utils/dockDomChoreography.ts' },
    { group: 'geometry-interaction', path: 'src/utils/scriptBibleDockLayout.ts' },
  ],
  regions: [
    // Locked sections inside actively developed host files
    { group: 'canvas-core', path: 'src/components/GenerationCard.tsx', region: 'generation-card-scale-and-outline' },
    { group: 'canvas-core', path: 'src/components/GenerationCard.tsx', region: 'generation-card-original-4k' },
    { group: 'canvas-core', path: 'src/components/TextCard.tsx', region: 'text-card-outline-sync' },
    { group: 'canvas-core', path: 'src/App.tsx', region: 'app-zoom-hud' },
    { group: 'canvas-core', path: 'src/App.tsx', region: 'app-lod-handoff' },
    { group: 'canvas-core', path: 'src/App.tsx', region: 'app-restore-canvas-styles' },
    { group: 'canvas-core', path: 'src/App.tsx', region: 'app-wheel-zoom' },
    { group: 'canvas-core', path: 'src/index.css', region: 'css-canvas-gesture-degradation' },
    { group: 'canvas-core', path: 'src/index.css', region: 'css-canvas-gpu-layers' },
  ],
};

export function normalizeLineEndings(text) {
  return text.replace(/\r\n/g, '\n');
}

export function sha256(text) {
  return crypto.createHash('sha256').update(normalizeLineEndings(text), 'utf8').digest('hex');
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Extracts the exact code block between `@LOCK-START:<id>` and `@LOCK-END:<id>`.
 * Supports both `// @LOCK-START:<id>` (TS/JS) and `/* @LOCK-START:<id> *\/` (CSS).
 */
export function extractLockedRegion(fileContent, regionId) {
  const normalized = normalizeLineEndings(fileContent);
  const escaped = escapeRegExp(regionId);
  const startRe = new RegExp(`(?:\\/\\/|\\/\\*)\\s*@LOCK-START:${escaped}(?:\\s*\\*\\/)?`, 'g');
  const endRe = new RegExp(`(?:\\/\\/|\\/\\*)\\s*@LOCK-END:${escaped}(?:\\s*\\*\\/)?`, 'g');

  const startMatches = [...normalized.matchAll(startRe)];
  const endMatches = [...normalized.matchAll(endRe)];

  if (startMatches.length === 0) {
    throw new Error(`Missing @LOCK-START:${regionId} marker`);
  }
  if (startMatches.length > 1) {
    throw new Error(`Duplicate @LOCK-START:${regionId} marker`);
  }
  if (endMatches.length === 0) {
    throw new Error(`Missing @LOCK-END:${regionId} marker`);
  }
  if (endMatches.length > 1) {
    throw new Error(`Duplicate @LOCK-END:${regionId} marker`);
  }

  const startIdx = startMatches[0].index + startMatches[0][0].length;
  const endIdx = endMatches[0].index;
  if (endIdx <= startIdx) {
    throw new Error(`Invalid marker order for @LOCK-START:${regionId} / @LOCK-END:${regionId}`);
  }

  return normalized.slice(startIdx, endIdx).trim();
}

export function computeLockManifest(rootDir, config = CORE_LOCK_CONFIG) {
  const files = {};
  for (const entry of config.files) {
    const absPath = path.join(rootDir, entry.path);
    if (!fs.existsSync(absPath)) {
      throw new Error(`Locked file missing: ${entry.path}`);
    }
    const content = fs.readFileSync(absPath, 'utf8');
    files[entry.path] = {
      group: entry.group,
      sha256: sha256(content),
    };
  }

  const regions = {};
  for (const entry of config.regions) {
    const absPath = path.join(rootDir, entry.path);
    if (!fs.existsSync(absPath)) {
      throw new Error(`Locked region host file missing: ${entry.path}`);
    }
    const content = fs.readFileSync(absPath, 'utf8');
    const slice = extractLockedRegion(content, entry.region);
    const key = `${entry.path}#${entry.region}`;
    regions[key] = {
      group: entry.group,
      path: entry.path,
      region: entry.region,
      sha256: sha256(slice),
    };
  }

  return {
    version: 1,
    algorithm: 'sha256',
    files,
    regions,
  };
}

export function verifyLockManifest(rootDir, manifest) {
  const violations = [];

  for (const [relPath, expected] of Object.entries(manifest.files || {})) {
    const absPath = path.join(rootDir, relPath);
    if (!fs.existsSync(absPath)) {
      violations.push({
        kind: 'file',
        group: expected.group,
        target: relPath,
        reason: 'missing',
      });
      continue;
    }
    const actualHash = sha256(fs.readFileSync(absPath, 'utf8'));
    if (actualHash !== expected.sha256) {
      violations.push({
        kind: 'file',
        group: expected.group,
        target: relPath,
        reason: 'modified',
        expected: expected.sha256,
        actual: actualHash,
      });
    }
  }

  for (const [key, expected] of Object.entries(manifest.regions || {})) {
    const absPath = path.join(rootDir, expected.path);
    if (!fs.existsSync(absPath)) {
      violations.push({
        kind: 'region',
        group: expected.group,
        target: key,
        reason: 'missing-host-file',
      });
      continue;
    }
    try {
      const slice = extractLockedRegion(fs.readFileSync(absPath, 'utf8'), expected.region);
      const actualHash = sha256(slice);
      if (actualHash !== expected.sha256) {
        violations.push({
          kind: 'region',
          group: expected.group,
          target: key,
          reason: 'modified',
          expected: expected.sha256,
          actual: actualHash,
        });
      }
    } catch (err) {
      violations.push({
        kind: 'region',
        group: expected.group,
        target: key,
        reason: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return {
    ok: violations.length === 0,
    checkedFiles: Object.keys(manifest.files || {}).length,
    checkedRegions: Object.keys(manifest.regions || {}).length,
    violations,
  };
}

function runCli() {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const rootDir = path.resolve(scriptDir, '..');
  const manifestPath = path.join(rootDir, LOCK_MANIFEST_REL_PATH);
  const args = process.argv.slice(2);
  const command = args[0] || 'check';

  if (command === 'update') {
    const confirmed = args.includes('--confirm-unlock') || process.env.ALLOW_CORE_LOCK_UPDATE === '1';
    if (!confirmed) {
      console.error(
        '[core-lock] Refused to overwrite locks/core-locks.json without explicit unlock confirmation.\n' +
          '            Only update locks after explicit user approval:\n' +
          '            node scripts/core-lock.mjs update --confirm-unlock'
      );
      process.exit(1);
    }
    const manifest = computeLockManifest(rootDir, CORE_LOCK_CONFIG);
    fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
    fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
    console.log(
      `[core-lock] Updated ${LOCK_MANIFEST_REL_PATH}: ${Object.keys(manifest.files).length} locked files, ${Object.keys(manifest.regions).length} locked regions.`
    );
    return;
  }

  if (command === 'check') {
    if (!fs.existsSync(manifestPath)) {
      console.error(`[core-lock] Lock manifest missing: ${LOCK_MANIFEST_REL_PATH}`);
      process.exit(1);
    }
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const result = verifyLockManifest(rootDir, manifest);
    if (!result.ok) {
      console.error(
        `[core-lock] LOCK VIOLATION: ${result.violations.length} protected foundational target(s) changed!\n` +
          'These files/regions are locked per AGENTS.md and must NOT be modified without explicit user approval:'
      );
      for (const v of result.violations) {
        console.error(`  - [${v.group}] (${v.kind}) ${v.target}: ${v.reason}`);
      }
      console.error(
        '\nRevert unintended changes, or if the user explicitly approved unlocking these targets, run:\n' +
          '  node scripts/core-lock.mjs update --confirm-unlock'
      );
      process.exit(1);
    }
    console.log(
      `[core-lock] OK (${result.checkedFiles} locked files, ${result.checkedRegions} locked regions verified).`
    );
    return;
  }

  console.error(`[core-lock] Unknown command: ${command}. Expected "check" or "update".`);
  process.exit(1);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isMain) {
  runCli();
}
