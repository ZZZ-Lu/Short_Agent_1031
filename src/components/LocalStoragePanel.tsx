import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FolderCheck,
  FolderOpen,
  FolderSync,
  HardDrive,
  LoaderCircle,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Unlink,
  Upload,
} from 'lucide-react';
import type { ScriptProject } from '../types/script';
import {
  localFolderMirror,
  type DirectoryHandleLike,
  type RestoreFolderResult,
} from '../storage/localFolderMirror';
import {
  exportBackupArchive,
  importBackupArchive,
  type ImportArchiveResult,
} from '../storage/backupArchive';
import { requestPersistence } from '../db';

interface LocalStoragePanelProps {
  projects: ScriptProject[];
  onApplyRestoredProjects: (result: RestoreFolderResult | ImportArchiveResult) => void;
  onNotify?: (message: string, tone?: 'success' | 'error' | 'info') => void;
}

function formatDateTime(ts: number | null): string {
  if (!ts) return '尚未同步';
  const dt = new Date(ts);
  if (Number.isNaN(dt.getTime())) return '尚未同步';
  return dt.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export const LocalStoragePanel: React.FC<LocalStoragePanelProps> = ({
  projects,
  onApplyRestoredProjects,
  onNotify,
}) => {
  const mirror = useSyncExternalStore(
    localFolderMirror.subscribe,
    localFolderMirror.getSnapshot
  );

  const [isPersisted, setIsPersisted] = useState<boolean | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{
    tone: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);
  const [confirmUnbind, setConfirmUnbind] = useState(false);
  const [confirmRestoreFromBound, setConfirmRestoreFromBound] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    void localFolderMirror.initialize();
    if (typeof navigator !== 'undefined' && navigator.storage?.persisted) {
      navigator.storage
        .persisted()
        .then((val) => setIsPersisted(val))
        .catch(() => setIsPersisted(null));
    }
  }, []);

  const report = (tone: 'success' | 'error' | 'info', text: string) => {
    setActionFeedback({ tone, text });
    onNotify?.(text, tone);
  };

  const handleBindFolder = async () => {
    setBusyAction('bind');
    setActionFeedback(null);
    setConfirmUnbind(false);
    try {
      const { preview } = await localFolderMirror.bindFolder(projects);
      if (preview.hasExistingData) {
        report(
          'info',
          `已选择文件夹「${preview.folderName}」，检测到已有 ${preview.projectCount} 个项目备份，请选择恢复或覆盖同步`
        );
      } else {
        report('success', `已绑定本地文件夹「${preview.folderName}」并完成首次同步`);
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      report('error', err instanceof Error ? err.message : '绑定本地文件夹失败');
    } finally {
      setBusyAction(null);
    }
  };

  const handleResumePermission = async () => {
    setBusyAction('resume');
    setActionFeedback(null);
    try {
      const ok = await localFolderMirror.requestPermissionAndResume(projects);
      if (ok) {
        report('success', `已恢复文件夹「${mirror.folderName || ''}」读写授权并完成同步`);
      } else {
        report('error', '未授予读写权限，当前仍仅保存至浏览器 IndexedDB');
      }
    } catch (err) {
      report('error', err instanceof Error ? err.message : '恢复授权失败');
    } finally {
      setBusyAction(null);
    }
  };

  const handleSyncNow = async () => {
    setBusyAction('sync');
    setActionFeedback(null);
    try {
      await localFolderMirror.syncAll(projects);
      report('success', `已全量同步 ${projects.length} 个项目至「${mirror.folderName || ''}」`);
    } catch (err) {
      report('error', err instanceof Error ? err.message : '同步失败');
    } finally {
      setBusyAction(null);
    }
  };

  const handleConfirmOverwrite = async () => {
    setBusyAction('overwrite');
    setActionFeedback(null);
    try {
      await localFolderMirror.confirmOverwriteAndSync(projects);
      report('success', `已使用当前应用数据同步覆盖至「${mirror.folderName || ''}」`);
    } catch (err) {
      report('error', err instanceof Error ? err.message : '覆盖同步失败');
    } finally {
      setBusyAction(null);
    }
  };

  const handleRestoreFromBound = async () => {
    setBusyAction('restore-bound');
    setActionFeedback(null);
    setConfirmRestoreFromBound(false);
    try {
      const result = await localFolderMirror.restoreFromFolder();
      onApplyRestoredProjects(result);
      report(
        'success',
        `已从「${mirror.folderName || ''}」恢复 ${result.restoredProjectCount} 个项目、${result.restoredCardCount} 张卡片与 ${result.restoredAssetCount} 份媒体`
      );
    } catch (err) {
      report('error', err instanceof Error ? err.message : '从文件夹恢复失败');
    } finally {
      setBusyAction(null);
    }
  };

  const handlePickFolderAndRestore = async () => {
    setBusyAction('restore-pick');
    setActionFeedback(null);
    try {
      const win = window as unknown as {
        showDirectoryPicker?: (options?: {
          id?: string;
          mode?: 'read' | 'readwrite';
          startIn?: string;
        }) => Promise<DirectoryHandleLike>;
      };
      if (typeof win.showDirectoryPicker !== 'function') {
        throw new Error('当前浏览器不支持目录选择，请使用下方「导入备份包」恢复');
      }
      const handle = await win.showDirectoryPicker({
        id: 'mira-workspace',
        mode: 'readwrite',
        startIn: 'documents',
      });
      const result = await localFolderMirror.restoreFromFolder(handle);
      onApplyRestoredProjects(result);
      report(
        'success',
        `已从「${handle.name}」恢复 ${result.restoredProjectCount} 个项目、${result.restoredCardCount} 张卡片与 ${result.restoredAssetCount} 份媒体`
      );
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      report('error', err instanceof Error ? err.message : '从文件夹恢复失败');
    } finally {
      setBusyAction(null);
    }
  };

  const handleUnbind = async () => {
    setBusyAction('unbind');
    setConfirmUnbind(false);
    try {
      await localFolderMirror.unbindFolder();
      report('info', '已解除本地文件夹绑定（磁盘上已同步的文件不会被删除）');
    } catch (err) {
      report('error', err instanceof Error ? err.message : '解除绑定失败');
    } finally {
      setBusyAction(null);
    }
  };

  const handleExportArchive = async () => {
    setBusyAction('export-archive');
    setActionFeedback(null);
    try {
      const exported = await exportBackupArchive(projects);
      const url = URL.createObjectURL(exported.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = exported.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      report(
        'success',
        `已导出备份包 ${exported.filename}（${exported.projectCount} 个项目、${exported.cardCount} 张卡片、${exported.assetCount} 份媒体）`
      );
    } catch (err) {
      report('error', err instanceof Error ? err.message : '导出备份包失败');
    } finally {
      setBusyAction(null);
    }
  };

  const handleImportArchiveFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setBusyAction('import-archive');
    setActionFeedback(null);
    try {
      const result = await importBackupArchive(file);
      onApplyRestoredProjects(result);
      report(
        'success',
        `已从备份包恢复 ${result.restoredProjectCount} 个项目、${result.restoredCardCount} 张卡片与 ${result.restoredAssetCount} 份媒体`
      );
    } catch (err) {
      report('error', err instanceof Error ? err.message : '导入备份包失败');
    } finally {
      setBusyAction(null);
    }
  };

  const handleRequestPersistence = async () => {
    setBusyAction('persist');
    try {
      const granted = await requestPersistence();
      setIsPersisted(granted);
      report(
        granted ? 'success' : 'info',
        granted
          ? '浏览器已启用持久化存储保护'
          : '浏览器暂未授予持久化标记（建议绑定本地文件夹或定期导出备份包）'
      );
    } finally {
      setBusyAction(null);
    }
  };

  const isBusy = busyAction !== null || mirror.status === 'syncing' || mirror.status === 'restoring';

  return (
    <div className="flex-1 overflow-y-auto bg-[#fbfbfc] p-6 dark:bg-[#121214]">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
              <HardDrive size={18} className="text-violet-500" />
              本地磁盘直存与备份恢复
            </h2>
            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
              画布默认保存在浏览器增量数据库（IndexedDB）。绑定本地文件夹后，每次改动会自动增量镜像到硬盘，原图与视频按文件去重保存，彻底规避浏览器清缓存导致的数据丢失。
            </p>
          </div>
        </div>

        {/* Feedback Alert */}
        {actionFeedback && (
          <div
            className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-xs ${
              actionFeedback.tone === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-950/30 dark:text-emerald-200'
                : actionFeedback.tone === 'error'
                  ? 'border-red-200 bg-red-50 text-red-800 dark:border-red-500/30 dark:bg-red-950/30 dark:text-red-200'
                  : 'border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-500/30 dark:bg-violet-950/30 dark:text-violet-200'
            }`}
          >
            {actionFeedback.tone === 'success' ? (
              <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
            ) : (
              <AlertTriangle size={15} className="mt-0.5 shrink-0" />
            )}
            <span className="leading-5">{actionFeedback.text}</span>
          </div>
        )}

        {/* Section 1: Local Folder Direct Mirror */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#19191c]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
                <FolderSync size={18} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  本地文件夹增量直存
                </h3>
                <p className="text-[11px] text-slate-400">
                  支持 Windows / macOS 的 Chrome、Edge、Arc、Brave 独立窗口
                </p>
              </div>
            </div>

            {mirror.folderName && (
              <span
                className={`rounded-lg px-2.5 py-1 text-[11px] font-medium ${
                  mirror.status === 'ready'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                    : mirror.status === 'syncing' || mirror.status === 'restoring'
                      ? 'bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300'
                      : mirror.status === 'needs-permission' || mirror.status === 'conflict-check'
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'
                        : 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300'
                }`}
              >
                {mirror.status === 'ready'
                  ? '自动同步中'
                  : mirror.status === 'syncing'
                    ? '正在写入磁盘...'
                    : mirror.status === 'restoring'
                      ? '正在恢复数据...'
                      : mirror.status === 'needs-permission'
                        ? '待重新授权'
                        : mirror.status === 'conflict-check'
                          ? '待确认同步方向'
                          : '同步暂停'}
              </span>
            )}
          </div>

          {/* Environment incompatibility notice */}
          {!mirror.support.supported && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs leading-5 text-amber-900 dark:border-amber-500/25 dark:bg-amber-950/25 dark:text-amber-200">
              {mirror.support.reason === 'iframe' ? (
                <>
                  <p className="font-medium">当前处于内嵌预览框架，浏览器安全策略限制调用目录选择器</p>
                  <p className="mt-1 text-amber-800/80 dark:text-amber-200/80">
                    请在新标签页直接打开应用网址后再绑定本地文件夹；若需在当前页面立即落盘备份，请使用下方「跨浏览器完整备份包」。
                  </p>
                </>
              ) : (
                <>
                  <p className="font-medium">当前浏览器不支持本地目录直存接口</p>
                  <p className="mt-1 text-amber-800/80 dark:text-amber-200/80">
                    Safari 与 Firefox 未开放用户可见文件夹读写能力。如需自动同步到本地硬盘，建议使用 Chrome 或 Edge；当前浏览器可随时使用下方「跨浏览器完整备份包」导出与恢复。
                  </p>
                </>
              )}
            </div>
          )}

          {/* Conflict check banner when user selected a folder that already contains a backup */}
          {mirror.status === 'conflict-check' && mirror.existingBackupPreview && (
            <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-500/40 dark:bg-amber-950/30">
              <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                检测到文件夹「{mirror.existingBackupPreview.folderName}」中已有 Mira 备份数据
              </p>
              <p className="mt-1 text-xs text-amber-800/90 dark:text-amber-200/80">
                包含 {mirror.existingBackupPreview.projectCount} 个项目（最近同步：
                {formatDateTime(mirror.existingBackupPreview.updatedAt)}）。为防止误覆盖，请先选择操作方向：
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => void handleRestoreFromBound()}
                  className="flex h-8 items-center gap-1.5 rounded-lg bg-violet-600 px-3 text-xs font-medium text-white hover:bg-violet-500 disabled:opacity-50"
                >
                  {busyAction === 'restore-bound' ? (
                    <LoaderCircle size={13} className="animate-spin" />
                  ) : (
                    <RotateCcw size={13} />
                  )}
                  从该文件夹恢复到当前应用（推荐）
                </button>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => void handleConfirmOverwrite()}
                  className="flex h-8 items-center gap-1.5 rounded-lg border border-amber-400/70 bg-white px-3 text-xs font-medium text-amber-900 hover:bg-amber-100/60 disabled:opacity-50 dark:border-amber-500/40 dark:bg-white/5 dark:text-amber-200 dark:hover:bg-white/10"
                >
                  {busyAction === 'overwrite' ? (
                    <LoaderCircle size={13} className="animate-spin" />
                  ) : (
                    <RefreshCw size={13} />
                  )}
                  用当前应用数据覆盖该文件夹
                </button>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => void handleUnbind()}
                  className="h-8 rounded-lg px-2.5 text-xs text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10"
                >
                  取消绑定
                </button>
              </div>
            </div>
          )}

          {/* Bound folder summary */}
          {mirror.folderName && mirror.status !== 'conflict-check' && (
            <div className="mt-4 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 dark:border-white/10 dark:bg-white/[.03]">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-100">
                  <FolderCheck size={15} className="text-violet-500" />
                  <span>当前绑定目录：{mirror.folderName}</span>
                </div>
                <span className="text-[11px] text-slate-400">
                  最近同步：{formatDateTime(mirror.lastSyncedAt)}
                </span>
              </div>
              {mirror.errorMessage && (
                <p className="mt-2 text-xs text-red-600 dark:text-red-400">{mirror.errorMessage}</p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {mirror.status === 'needs-permission' ? (
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => void handleResumePermission()}
                    className="flex h-8 items-center gap-1.5 rounded-lg bg-violet-600 px-3 text-xs font-medium text-white hover:bg-violet-500 disabled:opacity-50"
                  >
                    {busyAction === 'resume' ? (
                      <LoaderCircle size={13} className="animate-spin" />
                    ) : (
                      <ShieldCheck size={13} />
                    )}
                    恢复读写授权并同步
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => void handleSyncNow()}
                    className="flex h-8 items-center gap-1.5 rounded-lg bg-violet-600 px-3 text-xs font-medium text-white hover:bg-violet-500 disabled:opacity-50"
                  >
                    {busyAction === 'sync' || mirror.status === 'syncing' ? (
                      <LoaderCircle size={13} className="animate-spin" />
                    ) : (
                      <RefreshCw size={13} />
                    )}
                    立即全量同步
                  </button>
                )}

                {!confirmRestoreFromBound ? (
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => setConfirmRestoreFromBound(true)}
                    className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                  >
                    <RotateCcw size={13} />
                    从此文件夹恢复
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs dark:border-amber-500/40 dark:bg-amber-950/30">
                    <span className="text-amber-900 dark:text-amber-200">确认覆盖当前项目数据？</span>
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => void handleRestoreFromBound()}
                      className="rounded bg-amber-600 px-2 py-0.5 text-[11px] font-medium text-white hover:bg-amber-500"
                    >
                      确认恢复
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmRestoreFromBound(false)}
                      className="rounded px-1.5 py-0.5 text-[11px] text-slate-500 hover:bg-black/5 dark:text-slate-300"
                    >
                      取消
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  disabled={isBusy || !mirror.support.supported}
                  onClick={() => void handleBindFolder()}
                  className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                >
                  <FolderOpen size={13} />
                  更换文件夹
                </button>

                {!confirmUnbind ? (
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => setConfirmUnbind(true)}
                    className="ml-auto flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                  >
                    <Unlink size={13} />
                    解除绑定
                  </button>
                ) : (
                  <div className="ml-auto flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => void handleUnbind()}
                      className="h-7 rounded-lg bg-red-600 px-2.5 text-[11px] font-medium text-white hover:bg-red-500"
                    >
                      确认解绑
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmUnbind(false)}
                      className="h-7 rounded-lg px-2 text-[11px] text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10"
                    >
                      取消
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Unbound actions */}
          {!mirror.folderName && (
            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                disabled={isBusy || !mirror.support.supported}
                onClick={() => void handleBindFolder()}
                className="flex h-9 items-center gap-2 rounded-xl bg-violet-600 px-4 text-xs font-medium text-white hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {busyAction === 'bind' ? (
                  <LoaderCircle size={14} className="animate-spin" />
                ) : (
                  <FolderOpen size={14} />
                )}
                选择本地保存文件夹（默认打开「文档」）
              </button>
              <button
                type="button"
                disabled={isBusy || !mirror.support.supported}
                onClick={() => void handlePickFolderAndRestore()}
                className="flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
              >
                {busyAction === 'restore-pick' ? (
                  <LoaderCircle size={14} className="animate-spin" />
                ) : (
                  <RotateCcw size={14} />
                )}
                从已有本地文件夹恢复
              </button>
            </div>
          )}

          <p className="mt-3 text-[11px] leading-5 text-slate-400">
            目录结构自动维护：<code className="rounded bg-slate-100 px-1 py-0.5 dark:bg-white/10">projects.json</code>（剧本与资产设定）、
            <code className="rounded bg-slate-100 px-1 py-0.5 dark:bg-white/10">projects/*.json</code>（画布卡片）、
            <code className="rounded bg-slate-100 px-1 py-0.5 dark:bg-white/10">assets/*</code>（原图与视频，按 ID 仅写盘一次，可在资源管理器 / Finder 直接打开）。
          </p>
        </section>

        {/* Section 2: Universal Cross-Browser Backup Archive */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#19191c]">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
              <Download size={18} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                跨浏览器完整备份包（.mira-backup）
              </h3>
              <p className="text-[11px] text-slate-400">
                Windows / macOS 全浏览器通用（含 Chrome、Edge、Safari、Firefox 与内嵌预览），无损打包全部项目、剧本与原图视频
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              disabled={isBusy}
              onClick={() => void handleExportArchive()}
              className="flex h-9 items-center gap-2 rounded-xl bg-slate-900 px-4 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              {busyAction === 'export-archive' ? (
                <LoaderCircle size={14} className="animate-spin" />
              ) : (
                <Download size={14} />
              )}
              导出完整备份包（{projects.length} 个项目）
            </button>

            <button
              type="button"
              disabled={isBusy}
              onClick={() => fileInputRef.current?.click()}
              className="flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
            >
              {busyAction === 'import-archive' ? (
                <LoaderCircle size={14} className="animate-spin" />
              ) : (
                <Upload size={14} />
              )}
              导入备份包恢复
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".mira-backup,application/octet-stream"
              onChange={(e) => void handleImportArchiveFile(e)}
              className="hidden"
            />
          </div>
        </section>

        {/* Section 3: Browser Persistence Protection */}
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#19191c]">
          <div className="flex items-center gap-2.5">
            <ShieldCheck
              size={18}
              className={
                isPersisted
                  ? 'text-emerald-500'
                  : 'text-slate-400'
              }
            />
            <div>
              <p className="text-xs font-medium text-slate-800 dark:text-slate-100">
                浏览器持久化存储保护：{isPersisted === null ? '检测中' : isPersisted ? '已开启' : '未开启'}
              </p>
              <p className="text-[11px] text-slate-400">
                开启后可降低浏览器磁盘紧张时自动清理 IndexedDB 的概率（正式独立域名下效果最佳）
              </p>
            </div>
          </div>
          {isPersisted === false && (
            <button
              type="button"
              disabled={isBusy}
              onClick={() => void handleRequestPersistence()}
              className="h-8 rounded-lg border border-slate-200 px-3 text-xs text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
            >
              重新申请保护
            </button>
          )}
        </section>
      </div>
    </div>
  );
};
