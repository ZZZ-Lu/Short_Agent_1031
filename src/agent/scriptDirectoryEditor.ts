import {
  sliceScriptIntoScenes,
  parseSceneHeaderMetadata,
  extractSceneParagraphs,
} from '../utils/slicer';
import {
  parseScriptEpisodes,
  readScriptDirectory,
  findEpisodeByIdentifier,
  matchesSceneIdentifier,
  type ScriptEpisode,
  type ScriptSceneSummary,
} from './scriptTools';
import type { SceneChunk } from '../types/script';

export type ScriptDirectoryEntryType = 'episode' | 'scene';

export type ScriptDirectoryEditAction =
  | 'rename'
  | 'add'
  | 'delete'
  | 'split'
  | 'merge'
  | 'move';

export type ScriptDirectoryDeleteMode = 'header_only' | 'with_content';

export type ScriptDirectoryInsertPosition = 'before' | 'after' | 'start' | 'end';

export interface ScriptDirectoryEditOperation {
  action: ScriptDirectoryEditAction;
  targetId?: string;
  target?: string | number;
  targetType?: ScriptDirectoryEntryType;
  entryType?: ScriptDirectoryEntryType;
  newTitle?: string;
  title?: string;
  content?: string;
  position?: ScriptDirectoryInsertPosition;
  anchorId?: string;
  anchor?: string | number;
  anchorType?: ScriptDirectoryEntryType;
  deleteMode?: ScriptDirectoryDeleteMode;
  beforeParagraph?: number;
  beforeLine?: number;
  mergeIntoId?: string;
  mergeInto?: string | number;
  sourceId?: string;
  intoId?: string;
}

export interface ScriptDirectoryEditOptions {
  scenePattern?: string;
  flags?: string;
  precomputedScenes?: SceneChunk[];
}

export interface ScriptDirectoryChangeRecord {
  action: ScriptDirectoryEditAction;
  entryType: ScriptDirectoryEntryType;
  previousId?: string;
  previousTitle?: string;
  newId?: string;
  newTitle?: string;
  lineNumber?: number;
  deleteMode?: ScriptDirectoryDeleteMode;
  detail: string;
}

export interface ScriptDirectoryEditResult {
  scriptText: string;
  scenes: SceneChunk[];
  appliedCount: number;
  changes: ScriptDirectoryChangeRecord[];
  totalEpisodes: number;
  totalScenes: number;
  totalParagraphs: number;
  totalChars: number;
  affectedEpisodes: ReturnType<typeof readScriptDirectory>;
  message: string;
}

const EPISODE_HEADER_RX =
  /^(?:【\s*)?(?:第\s*([0-9]+|[一二三四五六七八九十百千]+)\s*[集话回]|([一二三四五六七八九十百千]+|[0-9]+)\s*集\b|(?:EPISODE|EP)\s*#?\s*(\d+))(.*?)(?:】)?$/i;

const DEFAULT_SCENE_HEADER_RX =
  /^(?:【\s*(?:场|场景|场次)?\s*[0-9一二三四五六七八九十百千]+(?:\s*[-—–]\s*[0-9]+)?[^】]*】|\d+\s*[-—–]\s*\d+(?=(?:\s|[日夜晨昏早晚黄昏清晨白昼午夜内外景]|$))[^▲：:]*|第\s*[0-9一二三四五六七八九十百千]+\s*[场幕].*|(?:SCENE)\s*#?\s*\d+.*|[0-9]+[.\-、]\s*(?:内景|外景|内|外).*|(?:内景|外景|INT\.|EXT\.)\s+.*)/i;

const DASH_SCENE_PREFIX_RX = /^\d+\s*[-—–]\s*\d+/;

function buildCustomSceneRegex(scenePattern?: string, flags?: string): RegExp | null {
  if (!scenePattern || !scenePattern.trim()) return null;
  let validFlags = String(flags || '').replace(/[^gimsuy]/g, '').replace(/g/g, '');
  if (!validFlags) validFlags = 'im';
  try {
    return new RegExp(scenePattern, validFlags);
  } catch {
    return null;
  }
}

export function isValidEpisodeHeading(title: string): boolean {
  const trimmed = title.trim();
  if (!trimmed || /[\r\n]/.test(trimmed)) return false;
  if (DASH_SCENE_PREFIX_RX.test(trimmed)) return false;
  return EPISODE_HEADER_RX.test(trimmed);
}

export function isValidSceneHeading(
  title: string,
  scenePattern?: string,
  flags?: string
): boolean {
  const trimmed = title.trim();
  if (!trimmed || /[\r\n]/.test(trimmed)) return false;
  if (isValidEpisodeHeading(trimmed)) return false;
  const customRx = buildCustomSceneRegex(scenePattern, flags);
  return (customRx ? customRx.test(trimmed) : false) || DEFAULT_SCENE_HEADER_RX.test(trimmed);
}

export function validateDirectoryHeading(
  entryType: ScriptDirectoryEntryType,
  rawTitle: string,
  scenePattern?: string,
  flags?: string
): string {
  const title = rawTitle.trim();
  if (!title) {
    throw new Error('目录标题不能为空。');
  }
  if (/[\r\n]/.test(title)) {
    throw new Error('目录标题必须为单行文本（不能包含换行符）；如需附带正文内容请通过 content 参数传入。');
  }
  if (entryType === 'episode') {
    if (!isValidEpisodeHeading(title)) {
      throw new Error(
        `分集标题 "${title}" 不符合目录分集识别格式，将无法在目录中显示。请使用如 "第一集"、"第2集 标题"、"【第3集】" 或 "EP 1" 等格式。`
      );
    }
    return title;
  }
  if (!isValidSceneHeading(title, scenePattern, flags)) {
    throw new Error(
      `场次标题 "${title}" 不符合目录场次识别格式，将无法在目录中显示。请使用如 "1-1 日 内 客厅"、"第1场 客厅"、"【场次1】" 或 "INT. 客厅" 等格式。`
    );
  }
  return title;
}

interface ResolvedEntry {
  entryType: ScriptDirectoryEntryType;
  id: string;
  title: string;
  sceneNumber?: string;
  startLine: number; // 1-based inclusive
  endLine: number;   // 1-based inclusive
  headerLineCount: number;
  episodeId?: string;
  episodeIndex: number;
  sceneIndex?: number;
}

interface ParsedDirectorySnapshot {
  episodes: ScriptEpisode[];
  episodeEntries: ResolvedEntry[];
  sceneEntries: ResolvedEntry[];
}

function getHeaderLineCount(
  lines: string[],
  entryType: ScriptDirectoryEntryType,
  startLine: number
): number {
  if (entryType !== 'scene') return 1;
  const startIdx = startLine - 1;
  if (startIdx < 0 || startIdx >= lines.length) return 1;
  const meta = parseSceneHeaderMetadata(lines[startIdx] || '', lines[startIdx + 1]);
  return meta.consumedNextLine ? 2 : 1;
}

function buildDirectorySnapshot(
  lines: string[],
  options?: { scenePattern?: string; flags?: string }
): ParsedDirectorySnapshot {
  const text = lines.join('\n');
  const freshScenes = sliceScriptIntoScenes(text, options?.scenePattern, options?.flags);
  const episodes = parseScriptEpisodes(text, {
    scenePattern: options?.scenePattern,
    flags: options?.flags,
    precomputedScenes: freshScenes,
    includeParagraphs: false,
  });

  const episodeEntries: ResolvedEntry[] = [];
  const sceneEntries: ResolvedEntry[] = [];

  if (episodes.length > 0) {
    episodes.forEach((ep, epIdx) => {
      episodeEntries.push({
        entryType: 'episode',
        id: ep.id,
        title: ep.title,
        startLine: ep.startLine,
        endLine: ep.endLine,
        headerLineCount: 1,
        episodeId: ep.id,
        episodeIndex: epIdx,
      });
      (ep.scenes || []).forEach((sc, scIdx) => {
        sceneEntries.push({
          entryType: 'scene',
          id: sc.id,
          title: sc.title,
          sceneNumber: sc.sceneNumber,
          startLine: sc.startLine,
          endLine: sc.endLine,
          headerLineCount: getHeaderLineCount(lines, 'scene', sc.startLine),
          episodeId: ep.id,
          episodeIndex: epIdx,
          sceneIndex: scIdx,
        });
      });
    });
  } else if (freshScenes.length > 0) {
    freshScenes.forEach((sc, scIdx) => {
      const startLine = sc.startLine ?? 1;
      const endLine = sc.endLine ?? lines.length;
      sceneEntries.push({
        entryType: 'scene',
        id: sc.id || `scene-${sc.index}`,
        title: sc.title,
        sceneNumber: sc.sceneNumber,
        startLine,
        endLine,
        headerLineCount: getHeaderLineCount(lines, 'scene', startLine),
        episodeIndex: 0,
        sceneIndex: scIdx,
      });
    });
  }

  return { episodes, episodeEntries, sceneEntries };
}

function resolveTargetEntry(
  snapshot: ParsedDirectorySnapshot,
  rawIdentifier: string | number | undefined,
  preferredType: ScriptDirectoryEntryType | undefined,
  lineOriginIds: Array<number | null>,
  initialIdToOriginLine: Map<string, { entryType: ScriptDirectoryEntryType; originLine: number }>
): ResolvedEntry {
  const idStr = rawIdentifier !== undefined && rawIdentifier !== null ? String(rawIdentifier).trim() : '';
  if (!idStr) {
    throw new Error('缺少目标目录条目 ID（targetId）或标识（target）。');
  }

  const lower = idStr.toLowerCase();

  // 1. Exact current ID match
  if (!preferredType || preferredType === 'episode') {
    const exactEp = snapshot.episodeEntries.find(e => e.id.toLowerCase() === lower);
    if (exactEp) return exactEp;
  }
  if (!preferredType || preferredType === 'scene') {
    const exactSc = snapshot.sceneEntries.find(s => s.id.toLowerCase() === lower);
    if (exactSc) return exactSc;
  }

  // 2. Tracked initial ID -> current line lookup (for batch operations after earlier line shifts)
  const tracked = initialIdToOriginLine.get(lower);
  if (tracked && (!preferredType || preferredType === tracked.entryType)) {
    const currentIdx = lineOriginIds.indexOf(tracked.originLine);
    if (currentIdx >= 0) {
      const currentLine = currentIdx + 1;
      const pool = tracked.entryType === 'episode' ? snapshot.episodeEntries : snapshot.sceneEntries;
      const relocated = pool.find(e => e.startLine === currentLine);
      if (relocated) return relocated;
    }
  }

  // 3. Episode identifier match
  if (!preferredType || preferredType === 'episode') {
    const matchedEp = findEpisodeByIdentifier(snapshot.episodes, idStr);
    if (matchedEp) {
      const resolved = snapshot.episodeEntries.find(e => e.id === matchedEp.id);
      if (resolved) return resolved;
    }
  }

  // 4. Scene identifier match (with explicit ambiguity guard)
  if (!preferredType || preferredType === 'scene') {
    const matchedScenes: ResolvedEntry[] = [];
    const exactTitleScenes = snapshot.sceneEntries.filter(
      s => s.title.trim().toLowerCase() === lower
    );
    if (exactTitleScenes.length === 1) {
      return exactTitleScenes[0];
    }
    if (exactTitleScenes.length > 1) {
      const choices = exactTitleScenes.map(s => `"${s.id}"（${s.title}）`).join('、');
      throw new Error(`目标 "${idStr}" 同时命中了多个重名场次：${choices}。请改传唯一 targetId。`);
    }

    snapshot.episodes.forEach((ep, epIdx) => {
      (ep.scenes || []).forEach((sc, scIdx) => {
        if (matchesSceneIdentifier(sc, scIdx + 1, idStr)) {
          const resolved = snapshot.sceneEntries.find(
            item => item.episodeIndex === epIdx && item.sceneIndex === scIdx
          );
          if (resolved) matchedScenes.push(resolved);
        }
      });
    });

    if (snapshot.episodes.length === 0) {
      snapshot.sceneEntries.forEach((entry, idx) => {
        const fakeSummary: ScriptSceneSummary = {
          id: entry.id,
          sceneNumber: entry.sceneNumber,
          title: entry.title,
          startLine: entry.startLine,
          endLine: entry.endLine,
        };
        if (matchesSceneIdentifier(fakeSummary, idx + 1, idStr)) {
          matchedScenes.push(entry);
        }
      });
    }

    if (matchedScenes.length === 1) {
      return matchedScenes[0];
    }
    if (matchedScenes.length > 1) {
      const choices = matchedScenes
        .slice(0, 8)
        .map(s => `"${s.id}"（${s.title}）`)
        .join('、');
      throw new Error(
        `目标 "${idStr}" 同时命中了 ${matchedScenes.length} 个场次（${choices}），无法确定编辑哪一个。请改传 script.directory 返回的唯一 targetId。`
      );
    }
  }

  const sampleIds = [
    ...snapshot.episodeEntries.slice(0, 5).map(e => `${e.id} "${e.title}"`),
    ...snapshot.sceneEntries.slice(0, 8).map(s => `${s.id} "${s.title}"`),
  ].join('、');
  throw new Error(
    `未找到匹配的目录条目 "${idStr}"。${sampleIds ? `当前可选条目示例：${sampleIds}` : '当前剧本暂无目录条目。'}`
  );
}

function isBareSceneNumberTitle(title: string): boolean {
  const meta = parseSceneHeaderMetadata(title);
  return Boolean(meta.sceneNumber && !meta.timeOfDay && !meta.type && !meta.locationName);
}

function replaceHeaderInLines(
  lines: string[],
  lineOriginIds: Array<number | null>,
  entry: ResolvedEntry,
  validatedTitle: string
) {
  const startIdx = entry.startLine - 1;
  if (entry.entryType === 'scene' && entry.headerLineCount === 2) {
    if (isBareSceneNumberTitle(validatedTitle)) {
      lines[startIdx] = validatedTitle;
    } else {
      lines.splice(startIdx, 2, validatedTitle);
      lineOriginIds.splice(startIdx, 2, lineOriginIds[startIdx]);
    }
  } else {
    lines[startIdx] = validatedTitle;
  }
}

function findEntryAtLine(
  snapshot: ParsedDirectorySnapshot,
  entryType: ScriptDirectoryEntryType,
  lineNumber: number
): ResolvedEntry | undefined {
  const pool = entryType === 'episode' ? snapshot.episodeEntries : snapshot.sceneEntries;
  return pool.find(e => e.startLine === lineNumber);
}

function normalizeOperations(args: Record<string, unknown>): ScriptDirectoryEditOperation[] {
  if (Array.isArray(args.operations)) {
    if (args.operations.length === 0) {
      throw new Error('批量编辑参数 operations 数组不能为空。');
    }
    return args.operations.map((item, idx) => {
      if (!item || typeof item !== 'object') {
        throw new Error(`operations[${idx}] 必须是合法的操作对象。`);
      }
      return item as ScriptDirectoryEditOperation;
    });
  }
  const action = typeof args.action === 'string' ? args.action.trim() : '';
  if (!action) {
    throw new Error(
      '缺少必填参数 action（可选值："rename" | "add" | "delete" | "split" | "merge" | "move"）或批量参数 operations。'
    );
  }
  return [args as unknown as ScriptDirectoryEditOperation];
}

export function applyScriptDirectoryEdit(
  scriptText: string,
  args: Record<string, unknown>,
  options: ScriptDirectoryEditOptions = {}
): ScriptDirectoryEditResult {
  const operations = normalizeOperations(args);
  const baseText = typeof scriptText === 'string' ? scriptText : '';
  const hasBaseContent = baseText.length > 0;
  const lines = hasBaseContent ? baseText.split('\n') : [];
  const lineOriginIds: Array<number | null> = lines.map((_, idx) => idx + 1);

  const initialSnapshot = buildDirectorySnapshot(lines, options);
  const initialIdToOriginLine = new Map<
    string,
    { entryType: ScriptDirectoryEntryType; originLine: number }
  >();
  for (const ep of initialSnapshot.episodeEntries) {
    initialIdToOriginLine.set(ep.id.toLowerCase(), {
      entryType: 'episode',
      originLine: ep.startLine,
    });
  }
  for (const sc of initialSnapshot.sceneEntries) {
    initialIdToOriginLine.set(sc.id.toLowerCase(), {
      entryType: 'scene',
      originLine: sc.startLine,
    });
  }

  const changes: ScriptDirectoryChangeRecord[] = [];
  const touchedLines = new Set<number>();

  for (const rawOp of operations) {
    const action = typeof rawOp.action === 'string' ? rawOp.action.trim() as ScriptDirectoryEditAction : '' as ScriptDirectoryEditAction;
    if (!['rename', 'add', 'delete', 'split', 'merge', 'move'].includes(action)) {
      throw new Error(
        `不支持的目录编辑动作 "${String(rawOp.action)}"，可选值为："rename" | "add" | "delete" | "split" | "merge" | "move"。`
      );
    }

    const snapshot = buildDirectorySnapshot(lines, options);

    if (action === 'rename') {
      const target = resolveTargetEntry(
        snapshot,
        rawOp.targetId ?? rawOp.target,
        rawOp.targetType,
        lineOriginIds,
        initialIdToOriginLine
      );
      const rawNewTitle = typeof rawOp.newTitle === 'string' ? rawOp.newTitle : typeof rawOp.title === 'string' ? rawOp.title : '';
      const validatedTitle = validateDirectoryHeading(
        target.entryType,
        rawNewTitle,
        options.scenePattern,
        options.flags
      );

      replaceHeaderInLines(lines, lineOriginIds, target, validatedTitle);
      const afterSnap = buildDirectorySnapshot(lines, options);
      const updatedEntry = findEntryAtLine(afterSnap, target.entryType, target.startLine);
      touchedLines.add(target.startLine);

      changes.push({
        action: 'rename',
        entryType: target.entryType,
        previousId: target.id,
        previousTitle: target.title,
        newId: updatedEntry?.id,
        newTitle: updatedEntry?.title || validatedTitle,
        lineNumber: target.startLine,
        detail: `已将${target.entryType === 'episode' ? '分集' : '场次'} "${target.title}" 重命名为 "${updatedEntry?.title || validatedTitle}"`,
      });
      continue;
    }

    if (action === 'add') {
      const rawTitle = typeof rawOp.title === 'string' ? rawOp.title : typeof rawOp.newTitle === 'string' ? rawOp.newTitle : '';
      if (!rawTitle.trim()) {
        throw new Error('新增目录条目（add）缺少必填参数 title。');
      }
      let entryType: ScriptDirectoryEntryType | undefined = rawOp.entryType ?? rawOp.targetType;
      if (!entryType) {
        if (isValidEpisodeHeading(rawTitle)) {
          entryType = 'episode';
        } else if (isValidSceneHeading(rawTitle, options.scenePattern, options.flags)) {
          entryType = 'scene';
        } else {
          throw new Error(
            `无法自动判定标题 "${rawTitle.trim()}" 的类型，请显式传入 entryType ("episode" | "scene") 并确保符合目录标题格式。`
          );
        }
      }
      const validatedTitle = validateDirectoryHeading(
        entryType,
        rawTitle,
        options.scenePattern,
        options.flags
      );

      const contentLines =
        typeof rawOp.content === 'string' && rawOp.content.length > 0
          ? rawOp.content.replace(/\r\n/g, '\n').split('\n')
          : [];
      const blockToInsert = [validatedTitle, ...contentLines];
      const originPlaceholders = blockToInsert.map(() => null);

      const anchorRaw = rawOp.anchorId ?? rawOp.anchor ?? rawOp.targetId ?? rawOp.target;
      const position: ScriptDirectoryInsertPosition =
        rawOp.position || (anchorRaw !== undefined ? 'after' : 'end');

      let insertIdx: number;
      if (position === 'start') {
        insertIdx = 0;
      } else if (position === 'end') {
        insertIdx = lines.length;
      } else {
        if (anchorRaw === undefined) {
          throw new Error(`position="${position}" 时必须提供 anchorId（定位参考条目 ID）。`);
        }
        const anchor = resolveTargetEntry(
          snapshot,
          anchorRaw,
          rawOp.anchorType,
          lineOriginIds,
          initialIdToOriginLine
        );
        insertIdx = position === 'before' ? anchor.startLine - 1 : anchor.endLine;
      }

      lines.splice(insertIdx, 0, ...blockToInsert);
      lineOriginIds.splice(insertIdx, 0, ...originPlaceholders);

      const insertedLineNumber = insertIdx + 1;
      const afterSnap = buildDirectorySnapshot(lines, options);
      const createdEntry = findEntryAtLine(afterSnap, entryType, insertedLineNumber);
      touchedLines.add(insertedLineNumber);

      changes.push({
        action: 'add',
        entryType,
        newId: createdEntry?.id,
        newTitle: createdEntry?.title || validatedTitle,
        lineNumber: insertedLineNumber,
        detail: `已在第 ${insertedLineNumber} 行新增${entryType === 'episode' ? '分集' : '场次'} "${createdEntry?.title || validatedTitle}"`,
      });
      continue;
    }

    if (action === 'delete') {
      const target = resolveTargetEntry(
        snapshot,
        rawOp.targetId ?? rawOp.target,
        rawOp.targetType,
        lineOriginIds,
        initialIdToOriginLine
      );
      const deleteMode: ScriptDirectoryDeleteMode =
        rawOp.deleteMode === 'with_content' ? 'with_content' : 'header_only';

      const startIdx = target.startLine - 1;
      const deleteCount =
        deleteMode === 'with_content'
          ? target.endLine - target.startLine + 1
          : target.headerLineCount;

      lines.splice(startIdx, deleteCount);
      lineOriginIds.splice(startIdx, deleteCount);
      touchedLines.add(Math.max(1, Math.min(target.startLine, lines.length)));

      changes.push({
        action: 'delete',
        entryType: target.entryType,
        previousId: target.id,
        previousTitle: target.title,
        lineNumber: target.startLine,
        deleteMode,
        detail:
          deleteMode === 'with_content'
            ? `已删除${target.entryType === 'episode' ? '分集' : '场次'} "${target.title}" 及其完整正文（共 ${deleteCount} 行）`
            : `已移除${target.entryType === 'episode' ? '分集' : '场次'} "${target.title}" 的标题行（正文已保留并入上一条目）`,
      });
      continue;
    }

    if (action === 'split') {
      const target = resolveTargetEntry(
        snapshot,
        rawOp.targetId ?? rawOp.target,
        rawOp.targetType,
        lineOriginIds,
        initialIdToOriginLine
      );
      const rawNewTitle = typeof rawOp.newTitle === 'string' ? rawOp.newTitle : typeof rawOp.title === 'string' ? rawOp.title : '';
      if (!rawNewTitle.trim()) {
        throw new Error('拆分目录条目（split）缺少必填参数 newTitle（新拆分出的目录标题）。');
      }
      const newEntryType: ScriptDirectoryEntryType =
        rawOp.entryType ||
        (isValidEpisodeHeading(rawNewTitle)
          ? 'episode'
          : isValidSceneHeading(rawNewTitle, options.scenePattern, options.flags)
            ? 'scene'
            : target.entryType);
      const validatedTitle = validateDirectoryHeading(
        newEntryType,
        rawNewTitle,
        options.scenePattern,
        options.flags
      );

      let splitLine: number | undefined;
      if (typeof rawOp.beforeParagraph === 'number' && Number.isFinite(rawOp.beforeParagraph)) {
        const paraIdx = Math.floor(rawOp.beforeParagraph);
        const paras = extractSceneParagraphs(lines, target.startLine, target.endLine, {
          consumedNextLine: target.headerLineCount === 2,
        });
        const matchedPara = paras.find(p => p.index === paraIdx);
        if (!matchedPara) {
          throw new Error(
            `拆分点 beforeParagraph=${paraIdx} 超出范围，条目 "${target.title}" 当前共有 ${paras.length} 个正文段落（可选 1..${paras.length}）。`
          );
        }
        splitLine = matchedPara.lineNumber;
      } else if (typeof rawOp.beforeLine === 'number' && Number.isFinite(rawOp.beforeLine)) {
        const lineNum = Math.floor(rawOp.beforeLine);
        const minSplitLine = target.startLine + target.headerLineCount;
        if (lineNum < minSplitLine || lineNum > target.endLine) {
          throw new Error(
            `拆分点 beforeLine=${lineNum} 必须位于条目 "${target.title}" 的正文范围内（第 ${minSplitLine}～${target.endLine} 行）。`
          );
        }
        splitLine = lineNum;
      } else {
        throw new Error('拆分目录条目（split）必须提供 beforeParagraph（场内 1-based 段落序号）或 beforeLine（1-based 行号）。');
      }

      const insertIdx = splitLine - 1;
      lines.splice(insertIdx, 0, validatedTitle);
      lineOriginIds.splice(insertIdx, 0, null);

      const afterSnap = buildDirectorySnapshot(lines, options);
      const createdEntry = findEntryAtLine(afterSnap, newEntryType, splitLine);
      touchedLines.add(target.startLine);
      touchedLines.add(splitLine);

      changes.push({
        action: 'split',
        entryType: newEntryType,
        previousId: target.id,
        previousTitle: target.title,
        newId: createdEntry?.id,
        newTitle: createdEntry?.title || validatedTitle,
        lineNumber: splitLine,
        detail: `已将 "${target.title}" 从第 ${splitLine} 行起拆分为新${newEntryType === 'episode' ? '分集' : '场次'} "${createdEntry?.title || validatedTitle}"`,
      });
      continue;
    }

    if (action === 'merge') {
      const source = resolveTargetEntry(
        snapshot,
        rawOp.sourceId ?? rawOp.targetId ?? rawOp.target,
        rawOp.targetType,
        lineOriginIds,
        initialIdToOriginLine
      );

      let dest: ResolvedEntry | undefined;
      const explicitDestRaw = rawOp.mergeIntoId ?? rawOp.intoId ?? rawOp.mergeInto;
      if (explicitDestRaw !== undefined) {
        dest = resolveTargetEntry(
          snapshot,
          explicitDestRaw,
          source.entryType,
          lineOriginIds,
          initialIdToOriginLine
        );
      } else {
        const sameLevelPool =
          source.entryType === 'episode' ? snapshot.episodeEntries : snapshot.sceneEntries;
        const pos = sameLevelPool.findIndex(e => e.id === source.id);
        if (pos <= 0) {
          throw new Error(
            `条目 "${source.title}" 是首个${source.entryType === 'episode' ? '分集' : '场次'}，前方没有可合并的相邻条目；如需合并到其他条目，请显式传入 mergeIntoId。`
          );
        }
        dest = sameLevelPool[pos - 1];
      }

      if (dest.id === source.id) {
        throw new Error(`不能将条目 "${source.title}" 合并到自身。`);
      }
      if (dest.entryType !== source.entryType) {
        throw new Error('只能合并同级目录条目（分集合并分集，场次合并场次）。');
      }

      const rawNewTitle = typeof rawOp.newTitle === 'string' && rawOp.newTitle.trim() ? rawOp.newTitle.trim() : undefined;
      const validatedNewTitle = rawNewTitle
        ? validateDirectoryHeading(dest.entryType, rawNewTitle, options.scenePattern, options.flags)
        : undefined;

      // Track dest header's original line via a temporary unique marker in lineOriginIds if needed
      let destStartLine = dest.startLine;

      const isImmediatelyAfter =
        source.startLine > dest.endLine &&
        lines.slice(dest.endLine, source.startLine - 1).every(l => !l.trim());

      if (isImmediatelyAfter) {
        const removeStartIdx = source.startLine - 1;
        lines.splice(removeStartIdx, source.headerLineCount);
        lineOriginIds.splice(removeStartIdx, source.headerLineCount);
      } else {
        // Non-adjacent or source comes before dest: extract source body, delete source block, append body to dest end
        const srcStartIdx = source.startLine - 1;
        const srcLen = source.endLine - source.startLine + 1;
        const srcBodyLines = lines.slice(srcStartIdx + source.headerLineCount, source.endLine);
        const srcBodyOrigins = lineOriginIds.slice(srcStartIdx + source.headerLineCount, source.endLine);

        lines.splice(srcStartIdx, srcLen);
        lineOriginIds.splice(srcStartIdx, srcLen);

        let adjustedDestEnd = dest.endLine;
        if (source.startLine < dest.startLine) {
          destStartLine -= srcLen;
          adjustedDestEnd -= srcLen;
        }
        if (srcBodyLines.length > 0) {
          lines.splice(adjustedDestEnd, 0, ...srcBodyLines);
          lineOriginIds.splice(adjustedDestEnd, 0, ...srcBodyOrigins);
        }
      }

      if (validatedNewTitle) {
        const midSnap = buildDirectorySnapshot(lines, options);
        const refreshedDest = findEntryAtLine(midSnap, dest.entryType, destStartLine);
        if (refreshedDest) {
          replaceHeaderInLines(lines, lineOriginIds, refreshedDest, validatedNewTitle);
        }
      }

      const afterSnap = buildDirectorySnapshot(lines, options);
      const finalDest = findEntryAtLine(afterSnap, dest.entryType, destStartLine);
      touchedLines.add(destStartLine);

      changes.push({
        action: 'merge',
        entryType: source.entryType,
        previousId: source.id,
        previousTitle: source.title,
        newId: finalDest?.id || dest.id,
        newTitle: finalDest?.title || validatedNewTitle || dest.title,
        lineNumber: destStartLine,
        detail: `已将 "${source.title}" 合并入 "${finalDest?.title || dest.title}"`,
      });
      continue;
    }

    if (action === 'move') {
      const source = resolveTargetEntry(
        snapshot,
        rawOp.targetId ?? rawOp.target,
        rawOp.targetType,
        lineOriginIds,
        initialIdToOriginLine
      );
      const anchorRaw = rawOp.anchorId ?? rawOp.anchor;
      const position: ScriptDirectoryInsertPosition =
        rawOp.position || (anchorRaw !== undefined ? 'after' : 'end');

      let rawInsertIdx: number;
      if (position === 'start') {
        rawInsertIdx = 0;
      } else if (position === 'end') {
        rawInsertIdx = lines.length;
      } else {
        if (anchorRaw === undefined) {
          throw new Error(`移动目录条目（move）当 position="${position}" 时必须提供 anchorId。`);
        }
        const anchor = resolveTargetEntry(
          snapshot,
          anchorRaw,
          rawOp.anchorType,
          lineOriginIds,
          initialIdToOriginLine
        );
        if (anchor.id === source.id) {
          throw new Error(`不能将条目 "${source.title}" 移动到自身位置。`);
        }
        if (anchor.startLine >= source.startLine && anchor.endLine <= source.endLine) {
          throw new Error(`不能将 "${source.title}" 移动到其内部子条目 "${anchor.title}" 中。`);
        }
        rawInsertIdx = position === 'before' ? anchor.startLine - 1 : anchor.endLine;
      }

      const srcStartIdx = source.startLine - 1;
      const srcLen = source.endLine - source.startLine + 1;
      const movedLines = lines.splice(srcStartIdx, srcLen);
      const movedOrigins = lineOriginIds.splice(srcStartIdx, srcLen);

      const adjustedInsertIdx =
        rawInsertIdx > srcStartIdx ? Math.max(0, rawInsertIdx - srcLen) : rawInsertIdx;

      lines.splice(adjustedInsertIdx, 0, ...movedLines);
      lineOriginIds.splice(adjustedInsertIdx, 0, ...movedOrigins);

      const newStartLine = adjustedInsertIdx + 1;
      const afterSnap = buildDirectorySnapshot(lines, options);
      const movedEntry = findEntryAtLine(afterSnap, source.entryType, newStartLine);
      touchedLines.add(newStartLine);

      changes.push({
        action: 'move',
        entryType: source.entryType,
        previousId: source.id,
        previousTitle: source.title,
        newId: movedEntry?.id,
        newTitle: movedEntry?.title || source.title,
        lineNumber: newStartLine,
        detail: `已将${source.entryType === 'episode' ? '分集' : '场次'} "${source.title}" 移动至第 ${newStartLine} 行`,
      });
    }
  }

  const nextScriptText = lines.join('\n');
  const nextScenes = sliceScriptIntoScenes(nextScriptText, options.scenePattern, options.flags);
  const fullDirectory = readScriptDirectory(nextScriptText, {
    scenePattern: options.scenePattern,
    flags: options.flags,
    precomputedScenes: nextScenes,
  });

  const finalParsedEpisodes = parseScriptEpisodes(nextScriptText, {
    scenePattern: options.scenePattern,
    flags: options.flags,
    precomputedScenes: nextScenes,
  });

  let affectedEpisodes = fullDirectory;
  if (fullDirectory.length > 8 && finalParsedEpisodes.length > 0 && touchedLines.size > 0) {
    const affectedEpIds = new Set<string>();
    for (const lineNum of touchedLines) {
      const hitEp = finalParsedEpisodes.find(ep => lineNum >= ep.startLine && lineNum <= ep.endLine);
      if (hitEp) affectedEpIds.add(hitEp.id);
    }
    if (affectedEpIds.size > 0) {
      affectedEpisodes = fullDirectory.filter(ep => affectedEpIds.has(ep.id));
    } else {
      affectedEpisodes = fullDirectory.slice(0, 8);
    }
  }

  const totalScenes = fullDirectory.reduce(
    (acc, ep) => acc + (ep.sceneCount ?? (ep.scenes ? ep.scenes.length : 0)),
    0
  );
  const totalParagraphs = fullDirectory.reduce(
    (acc, ep) =>
      acc +
      (ep.paragraphCount ??
        (ep.scenes ? ep.scenes.reduce((pAcc, sc) => pAcc + (sc.paragraphCount ?? 0), 0) : 0)),
    0
  );
  const totalChars = fullDirectory.reduce(
    (acc, ep) =>
      acc +
      (ep.charCount ??
        (ep.scenes ? ep.scenes.reduce((cAcc, sc) => cAcc + (sc.charCount ?? 0), 0) : 0)),
    0
  );

  const message =
    changes.length === 1
      ? `${changes[0].detail}，剧本正文与目录已同步持久化。`
      : `已完成 ${changes.length} 项剧本目录编辑操作，剧本正文与目录已同步持久化（当前共 ${fullDirectory.length} 集 / ${totalScenes} 场）。`;

  return {
    scriptText: nextScriptText,
    scenes: nextScenes,
    appliedCount: changes.length,
    changes,
    totalEpisodes: fullDirectory.length,
    totalScenes,
    totalParagraphs,
    totalChars,
    affectedEpisodes,
    message,
  };
}
