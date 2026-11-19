import type { SceneChunk, ScriptParagraph, ScriptProject } from '../types/script';
import { extractSceneParagraphs, sliceScriptIntoScenes } from '../utils/slicer';

export const SCRIPT_SELECTION_MAX_CHARS = 4000;

export interface ScriptSelectionInput {
  text: string;
  start: number;
  end: number;
  lineStart?: number;
  lineEnd?: number;
}

export interface ScriptSelectionSceneParagraphRef {
  sceneId?: string;
  sceneTitle: string;
  paragraphIndices: number[];
}

export interface ScriptSelectionContextSnapshot {
  projectId: string;
  projectName?: string;
  text: string;
  start: number;
  end: number;
  lineStart: number;
  lineEnd: number;
  episodeTitle?: string;
  sceneId?: string;
  sceneTitle?: string;
  spannedSceneTitles?: string[];
  paragraphIndices?: number[];
  sceneParagraphRefs?: ScriptSelectionSceneParagraphRef[];
  charCount: number;
  truncated?: boolean;
  capturedAt: number;
}

export interface FormattedScriptSelectionContext {
  targetId: 'script.text';
  speak: string;
  title: string;
  chipLabel: string;
  chipPreview: string;
  markdownSummary: string;
  scriptSelection: ScriptSelectionContextSnapshot;
}

export function computeLineRangeFromOffsets(
  scriptText: string,
  start: number,
  end: number
): { lineStart: number; lineEnd: number } {
  const safeStart = Math.max(0, Math.min(Math.floor(start), scriptText.length));
  const safeEnd = Math.max(safeStart, Math.min(Math.floor(end), scriptText.length));

  let lineStart = 1;
  for (let i = 0; i < safeStart; i++) {
    if (scriptText.charCodeAt(i) === 10) {
      lineStart++;
    }
  }

  // Use end - 1 when end > start so a selection ending right on a trailing newline
  // does not spill into the following line.
  const inclusiveEnd = safeEnd > safeStart ? safeEnd - 1 : safeStart;
  let lineEnd = lineStart;
  for (let i = safeStart; i < inclusiveEnd; i++) {
    if (scriptText.charCodeAt(i) === 10) {
      lineEnd++;
    }
  }

  return { lineStart, lineEnd: Math.max(lineStart, lineEnd) };
}

function resolveScenesForSelection(project: ScriptProject | null | undefined): SceneChunk[] {
  if (!project) return [];
  const scriptText = typeof project.scriptText === 'string' ? project.scriptText : '';
  if (scriptText.trim()) {
    const sliced = sliceScriptIntoScenes(
      scriptText,
      project.tocConfig?.scenePattern,
      project.tocConfig?.flags,
      {
        tocPattern: project.tocConfig?.tocPattern,
        preferCustomOnly: project.tocConfig?.confidence === 'ai',
      }
    );
    if (sliced.length > 0) {
      return sliced;
    }
  }
  return Array.isArray(project.scenes) ? project.scenes.filter(Boolean) : [];
}

function resolveParagraphsForScene(scene: SceneChunk, allLines: string[]): ScriptParagraph[] {
  if (Array.isArray(scene.paragraphs) && scene.paragraphs.length > 0) {
    return scene.paragraphs;
  }
  if (typeof scene.startLine === 'number' && typeof scene.endLine === 'number') {
    return extractSceneParagraphs(allLines, scene.startLine, scene.endLine);
  }
  if (typeof scene.rawText === 'string' && scene.rawText.trim()) {
    const lines = scene.rawText.split('\n');
    const paragraphs: ScriptParagraph[] = [];
    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      if (!trimmed) continue;
      paragraphs.push({
        index: paragraphs.length + 1,
        lineNumber: (scene.startLine || 1) + i,
        text: trimmed,
      });
    }
    return paragraphs;
  }
  return [];
}

function formatParagraphIndices(indices: number[]): string {
  if (indices.length === 0) return '';
  if (indices.length === 1) return `P${indices[0]}`;
  // Compress contiguous runs (e.g. [1, 2, 3, 5] -> P1-P3, P5)
  const sorted = [...new Set(indices)].sort((a, b) => a - b);
  const parts: string[] = [];
  let runStart = sorted[0];
  let prev = sorted[0];
  for (let i = 1; i < sorted.length; i++) {
    const curr = sorted[i];
    if (curr === prev + 1) {
      prev = curr;
    } else {
      parts.push(runStart === prev ? `P${runStart}` : `P${runStart}-P${prev}`);
      runStart = curr;
      prev = curr;
    }
  }
  parts.push(runStart === prev ? `P${runStart}` : `P${runStart}-P${prev}`);
  return parts.join(', ');
}

function collapseWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Builds an immutable, 100% JSON-serializable snapshot for a user's selected script text.
 * Strictly stores ONLY the user's selected text plus deterministic structural anchors
 * (no surrounding un-selected lines).
 */
export function buildScriptSelectionSnapshot(
  selection: ScriptSelectionInput | null | undefined,
  project: ScriptProject | null | undefined,
  capturedAt: number = Date.now()
): ScriptSelectionContextSnapshot | null {
  if (!selection || typeof selection.text !== 'string') return null;
  if (!selection.text.trim()) return null;

  const scriptText = typeof project?.scriptText === 'string' ? project.scriptText : '';
  const rawStart = Number.isFinite(selection.start) ? Math.max(0, Math.floor(selection.start)) : 0;
  const rawEnd = Number.isFinite(selection.end)
    ? Math.max(rawStart, Math.floor(selection.end))
    : rawStart + selection.text.length;

  const start = scriptText.length > 0 ? Math.min(rawStart, scriptText.length) : rawStart;
  const end = scriptText.length > 0 ? Math.max(start, Math.min(rawEnd, scriptText.length)) : rawEnd;

  const computedLines = scriptText
    ? computeLineRangeFromOffsets(scriptText, start, end)
    : {
        lineStart: 1,
        lineEnd: Math.max(1, selection.text.split('\n').length),
      };

  const hasValidLineStart = typeof selection.lineStart === 'number' && Number.isFinite(selection.lineStart) && selection.lineStart >= 1;
  const hasValidLineEnd = typeof selection.lineEnd === 'number' && Number.isFinite(selection.lineEnd) && selection.lineEnd >= 1;

  const lineStart = hasValidLineStart ? Math.floor(selection.lineStart!) : computedLines.lineStart;
  const lineEnd = hasValidLineEnd
    ? Math.max(lineStart, Math.floor(selection.lineEnd!))
    : Math.max(lineStart, computedLines.lineEnd);

  const scenes = resolveScenesForSelection(project);
  const allLines = scriptText ? scriptText.split('\n') : [];

  const overlappingScenes = scenes.filter((scene) => {
    if (typeof scene.startLine === 'number' && typeof scene.endLine === 'number') {
      return scene.startLine <= lineEnd && scene.endLine >= lineStart;
    }
    if (typeof scene.charIndex === 'number' && typeof scene.endCharIndex === 'number') {
      return scene.charIndex < end && scene.endCharIndex > start;
    }
    return false;
  });

  // Fallback when scenes exist without line/char bounds (e.g. minimal seed project)
  const resolvedScenes =
    overlappingScenes.length > 0
      ? overlappingScenes
      : scenes.length === 1 && scenes[0].startLine === undefined
        ? [scenes[0]]
        : [];

  let episodeTitle: string | undefined;
  let sceneId: string | undefined;
  let sceneTitle: string | undefined;
  let spannedSceneTitles: string[] | undefined;
  let paragraphIndices: number[] | undefined;
  let sceneParagraphRefs: ScriptSelectionSceneParagraphRef[] | undefined;

  if (resolvedScenes.length === 1) {
    const scene = resolvedScenes[0];
    episodeTitle = scene.episodeTitle || undefined;
    sceneId = scene.id || undefined;
    sceneTitle = scene.title || undefined;

    const paragraphs = resolveParagraphsForScene(scene, allLines);
    const matched = paragraphs
      .filter((p) => p.lineNumber >= lineStart && p.lineNumber <= lineEnd)
      .map((p) => p.index);
    if (matched.length > 0) {
      paragraphIndices = matched;
    }
  } else if (resolvedScenes.length > 1) {
    const primary = resolvedScenes[0];
    episodeTitle = primary.episodeTitle || undefined;
    sceneId = primary.id || undefined;
    sceneTitle = primary.title || undefined;
    spannedSceneTitles = resolvedScenes.map((s) => s.title).filter(Boolean);

    const refs: ScriptSelectionSceneParagraphRef[] = [];
    for (const scene of resolvedScenes) {
      const paragraphs = resolveParagraphsForScene(scene, allLines);
      const matched = paragraphs
        .filter((p) => p.lineNumber >= lineStart && p.lineNumber <= lineEnd)
        .map((p) => p.index);
      if (matched.length > 0) {
        refs.push({
          ...(scene.id ? { sceneId: scene.id } : {}),
          sceneTitle: scene.title,
          paragraphIndices: matched,
        });
      }
    }
    if (refs.length > 0) {
      sceneParagraphRefs = refs;
      if (refs.length === 1) {
        paragraphIndices = refs[0].paragraphIndices;
      }
    }
  }

  const charCount = selection.text.length;
  const truncated = charCount > SCRIPT_SELECTION_MAX_CHARS;
  const text = truncated ? selection.text.slice(0, SCRIPT_SELECTION_MAX_CHARS) : selection.text;

  const snapshot: ScriptSelectionContextSnapshot = {
    projectId: project?.id || '',
    ...(project?.name ? { projectName: project.name } : {}),
    text,
    start,
    end,
    lineStart,
    lineEnd,
    ...(episodeTitle ? { episodeTitle } : {}),
    ...(sceneId ? { sceneId } : {}),
    ...(sceneTitle ? { sceneTitle } : {}),
    ...(spannedSceneTitles && spannedSceneTitles.length > 1 ? { spannedSceneTitles } : {}),
    ...(paragraphIndices && paragraphIndices.length > 0 ? { paragraphIndices } : {}),
    ...(sceneParagraphRefs && sceneParagraphRefs.length > 0 ? { sceneParagraphRefs } : {}),
    charCount,
    ...(truncated ? { truncated: true } : {}),
    capturedAt,
  };

  return snapshot;
}

export function formatScriptSelectionCardContext(
  snapshot: ScriptSelectionContextSnapshot
): FormattedScriptSelectionContext {
  const singleLine = collapseWhitespace(snapshot.text);
  const snippet = singleLine.length > 10 ? `${singleLine.slice(0, 10)}...` : singleLine;
  const chipPreview = singleLine.length > 48 ? `${singleLine.slice(0, 48)}...` : singleLine;

  const lineLabel =
    snapshot.lineStart === snapshot.lineEnd
      ? `第${snapshot.lineStart}行`
      : `第${snapshot.lineStart}-${snapshot.lineEnd}行`;

  let sceneShortLabel = '';
  if (snapshot.spannedSceneTitles && snapshot.spannedSceneTitles.length > 1) {
    const first = snapshot.spannedSceneTitles[0];
    const compactFirst = first.length > 10 ? `${first.slice(0, 10)}…` : first;
    sceneShortLabel = `${compactFirst}等${snapshot.spannedSceneTitles.length}场`;
  } else if (snapshot.sceneTitle) {
    sceneShortLabel =
      snapshot.sceneTitle.length > 14 ? `${snapshot.sceneTitle.slice(0, 14)}…` : snapshot.sceneTitle;
  }

  const chipLabel = `已引用 · ${sceneShortLabel ? `${sceneShortLabel} ` : ''}${lineLabel}（${snapshot.charCount}字）`;

  const locationParts: string[] = [];
  if (snapshot.episodeTitle) {
    locationParts.push(snapshot.episodeTitle);
  }
  if (snapshot.spannedSceneTitles && snapshot.spannedSceneTitles.length > 1) {
    locationParts.push(`跨越 ${snapshot.spannedSceneTitles.length} 个场次（${snapshot.spannedSceneTitles.join(' / ')}）`);
  } else if (snapshot.sceneTitle) {
    locationParts.push(snapshot.sceneId ? `${snapshot.sceneTitle} (${snapshot.sceneId})` : snapshot.sceneTitle);
  }
  locationParts.push(lineLabel);

  if (snapshot.sceneParagraphRefs && snapshot.sceneParagraphRefs.length > 1) {
    const refText = snapshot.sceneParagraphRefs
      .map((ref) => `${ref.sceneTitle} ${formatParagraphIndices(ref.paragraphIndices)}`)
      .join('；');
    locationParts.push(`场内段落 ${refText}`);
  } else if (snapshot.paragraphIndices && snapshot.paragraphIndices.length > 0) {
    locationParts.push(`场内段落 ${formatParagraphIndices(snapshot.paragraphIndices)}`);
  }

  const lines: string[] = [
    `【当前聚焦的剧本正文片段】`,
    snapshot.projectName ? `- 项目名称: ${snapshot.projectName}` : '',
    `- 所属位置: ${locationParts.join(' · ')}`,
    `- 选中字符范围: [${snapshot.start}, ${snapshot.end}]（共 ${snapshot.charCount} 字）`,
    `- 用户划选的剧本原文:`,
    '```text',
    snapshot.text,
    '```',
    snapshot.truncated
      ? `- 长度说明: 原选区共 ${snapshot.charCount} 字，此处展示前 ${snapshot.text.length} 字；如需查看其余部分可结合上述位置锚点调用剧本读取工具。`
      : '',
  ].filter(Boolean);

  return {
    targetId: 'script.text',
    speak: `选了剧本片段「${snippet}」，需要我做什么？`,
    title: snapshot.sceneTitle ? `剧本选中片段：${snapshot.sceneTitle}` : '剧本选中片段',
    chipLabel,
    chipPreview,
    markdownSummary: lines.join('\n'),
    scriptSelection: snapshot,
  };
}
