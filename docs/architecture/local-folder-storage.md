# Local Folder Direct Storage & Universal Backup Archive

## Design Principles (Maximizing Existing Storage Pipeline)

1. **Zero Duplicate Serialization**: Reuse `CardCodec` (`EncodedCard` + `Resource` markers) already persisted in `InfiniteCanvasIncrementalDB`. Both local folder sync and universal `.mira-backup` archives read `{ head, cards }` via existing Worker `load` and fetch binary media in small batches via `getAssets`.
2. **Sidecar Async Mirror (Hot Path Untouched)**: The existing `App.tsx -> db.ts -> CardRepository -> storage.worker.ts -> IndexedDB` incremental commit path remains untouched. Local folder sync subscribes to local post-commit events (`subscribeLocalCardCommit`) and `projects` metadata updates using a per-project coalescing queue. Disk failures or revoked permissions never block or corrupt IndexedDB commits.
3. **Reuse `InfiniteCanvasProjectMetaDB`**: Store the user's `FileSystemDirectoryHandle` (`local_folder_handle`) and sync metadata (`local_folder_sync_meta`) inside the existing `meta` object store without creating a new database or bumping schema versions.
4. **Transactional Restore via Staged Generations**: Restoring from a local folder or `.mira-backup` uploads media in batches via `assets`, stages cards in bounded chunks via `stage`, and atomically commits a new generation + `history` record via `importStagedProject`. IndexedDB is never deleted or recreated.
5. **Cross-Platform Progressive Enhancement**:
   - **All browsers (Windows / macOS)**: Existing IndexedDB incremental storage + `navigator.storage.persist()` + universal zero-dependency `.mira-backup` binary archive export/import.
   - **Chromium desktop standalone HTTPS/localhost (Chrome / Edge / Arc / Brave on Windows & macOS)**: Direct local folder sync via File System Access API (`showDirectoryPicker({ id: 'mira-workspace', startIn: 'documents', mode: 'readwrite' })`).
   - **Safari / Firefox / cross-origin iframe**: Gracefully detects unsupported context and routes users to `.mira-backup` export/import (or opening in a standalone tab when inside an iframe).

## On-Disk Folder Layout (NTFS / APFS Friendly)

```text
<User Selected Folder>/
├── manifest.json                 # Format version, updatedAt, synced project revisions
├── projects.json                 # Serialized ScriptProject[] (scripts, Bible assets, TOC)
├── projects/
│   └── <projectId>.json          # Single project head + EncodedCard[] + assetMeta map
└── assets/
    ├── <resourceId>.<ext>        # Raw Blob/File bytes (.png/.jpg/.webp/.mp4/.bin), viewable in Explorer/Finder
    └── <resourceId>.data.txt     # Lossless data: URLs (thumbnails, videoPosterUrl) with zero re-encoding
```

- **Why per-project JSON instead of per-card JSON**: Chromium's `createWritable()` uses `.crswap` temp files + atomic rename per file. Writing one `projects/<projectId>.json` takes ~15ms even for 2,600+ cards, whereas creating 2,600 tiny files stalls NTFS.
- **Write-once deduplicated media**: On folder bind, existing filenames under `assets/` are cached in a `Set<string>`. Each `resourceId` is written to disk once and skipped on all subsequent card moves/edits.

## Universal `.mira-backup` Binary Archive Format

Zero-dependency streaming binary archive for Safari, Firefox, and embedded iframes:

- Header: 8-byte magic (`MIRABKP1`) + uint32LE metadata JSON byte length + UTF-8 metadata JSON (`{ version, createdAt, projects, cardProjects, assetEntries }`)
- Payload: Sequential raw binary chunks matching `assetEntries` (`{ id, kind: 'blob' | 'file' | 'data', byteLength, mimeType?, fileName? }`) — zero base64 bloat, supports Blob streaming via `Blob.slice()`.

## Architecture & Decoupling

- Pure data/logic (zero React/DOM): `src/storage/localFolderMirror.ts`, `src/storage/backupArchive.ts`, `src/storage/projectMeta.ts`, `src/storage/backend.ts`, `src/storage/repository.ts`.
- UI layer only: `src/components/LocalStoragePanel.tsx` mounted in `src/components/SettingsPage.tsx`, plus a conditional reconnect button in `src/App.tsx` only when a bound folder awaits one-click permission renewal.
