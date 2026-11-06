import { sliceScriptIntoScenes } from '../utils/slicer';
import { SceneChunk } from '../types/script';

export type ScriptView = 'script' | 'directory' | 'assets' | 'universe' | 'cards';

export interface ScriptSceneSummary {
  id: string;
  sceneNumber?: string;
  title: string;
  type?: 'INT' | 'EXT' | 'MIXED';
  timeOfDay?: string;
  locationName?: string;
  characterNames?: string[];
  startLine: number;
  endLine: number;
}

export interface ScriptEpisode {
  id: string;
  number: string;
  title: string;
  startLine: number;
  endLine: number;
  startChar: number;
  endChar: number;
  sceneCount?: number;
  scenes?: ScriptSceneSummary[];
}

const episodeHeader = /^(?:【\s*)?(?:第\s*([0-9]+|[一二三四五六七八九十百千]+)\s*[集话回]|([一二三四五六七八九十百千]+|[0-9]+)\s*集\b|(?:EPISODE|EP)\s*#?\s*(\d+))(.*?)(?:】)?$/i;

export const parseScriptEpisodes = (
  scriptText: string,
  options?: { scenePattern?: string; flags?: string; precomputedScenes?: SceneChunk[] }
): ScriptEpisode[] => {
  if (!scriptText) return [];
  const lines = scriptText.split('\n');
  const starts = lines.flatMap((raw, index) => {
    const trimmed = raw.trim();
    if (!trimmed || /^\d+\s*[-—–]\s*\d+/.test(trimmed)) return [];
    const match = trimmed.match(episodeHeader);
    if (!match) return [];
    const epNum = match[1] || match[2] || match[3] || String(index + 1);
    const startChar = lines.slice(0, index).reduce((total, line) => total + line.length + 1, 0);
    return [{ index, startChar, number: epNum, title: trimmed }];
  });

  const allScenes =
    options?.precomputedScenes && options.precomputedScenes.length > 0
      ? options.precomputedScenes
      : sliceScriptIntoScenes(scriptText, options?.scenePattern, options?.flags);

  return starts.map((start, index) => {
    const next = starts[index + 1];
    const endLine = next ? next.index : lines.length;
    const endChar = next ? next.startChar - 1 : scriptText.length;
    const epStartLine = start.index + 1;

    const epScenes: ScriptSceneSummary[] = allScenes
      .filter(sc => {
        const scLine = sc.startLine ?? 0;
        return scLine >= epStartLine && scLine <= endLine;
      })
      .map(sc => ({
        id: sc.id || `scene-${sc.index}`,
        sceneNumber: sc.sceneNumber,
        title: sc.title,
        type: sc.type,
        timeOfDay: sc.timeOfDay,
        locationName: sc.locationName,
        characterNames: sc.characterNames,
        startLine: sc.startLine ?? epStartLine,
        endLine: sc.endLine ?? endLine,
      }));

    return {
      id: `episode-${epStartLine}`,
      number: start.number,
      title: start.title,
      startLine: epStartLine,
      endLine,
      startChar: start.startChar,
      endChar,
      sceneCount: epScenes.length,
      scenes: epScenes.length > 0 ? epScenes : undefined,
    };
  });
};

export const readScriptDirectory = (
  scriptText: string,
  options: {
    range?: [number, number];
    query?: string;
    tailOnly?: boolean;
    scenePattern?: string;
    flags?: string;
    precomputedScenes?: SceneChunk[];
  } = {}
) => {
  let entries = parseScriptEpisodes(scriptText, {
    scenePattern: options.scenePattern,
    flags: options.flags,
    precomputedScenes: options.precomputedScenes,
  });

  // Fallback: if script has no explicit episode headers but has scenes, expose scenes as directory entries
  if (entries.length === 0 && scriptText?.trim()) {
    const scenes =
      options.precomputedScenes && options.precomputedScenes.length > 0
        ? options.precomputedScenes
        : sliceScriptIntoScenes(scriptText, options.scenePattern, options.flags);
    entries = scenes.map(sc => ({
      id: sc.id || `scene-${sc.index}`,
      number: sc.sceneNumber || String(sc.index),
      title: sc.title,
      startLine: sc.startLine ?? 1,
      endLine: sc.endLine ?? 1,
      startChar: sc.charIndex ?? 0,
      endChar: sc.endCharIndex ?? scriptText.length,
      sceneCount: 1,
      scenes: [
        {
          id: sc.id || `scene-${sc.index}`,
          sceneNumber: sc.sceneNumber,
          title: sc.title,
          type: sc.type,
          timeOfDay: sc.timeOfDay,
          locationName: sc.locationName,
          characterNames: sc.characterNames,
          startLine: sc.startLine ?? 1,
          endLine: sc.endLine ?? 1,
        },
      ],
    }));
  }

  if (options.query?.trim()) {
    const query = options.query.trim().toLowerCase();
    entries = entries.filter(entry => {
      if (entry.title.toLowerCase().includes(query)) return true;
      if (Array.isArray(entry.scenes)) {
        return entry.scenes.some(
          sc =>
            sc.title.toLowerCase().includes(query) ||
            (sc.sceneNumber && sc.sceneNumber.toLowerCase().includes(query)) ||
            (sc.locationName && sc.locationName.toLowerCase().includes(query)) ||
            (Array.isArray(sc.characterNames) && sc.characterNames.some(c => c.toLowerCase().includes(query)))
        );
      }
      return false;
    });
  }
  if (options.tailOnly) entries = entries.slice(-1);
  if (options.range) entries = entries.slice(Math.max(0, options.range[0] - 1), Math.max(0, options.range[1]));
  return entries.map(({ id, number, title, startLine, endLine, sceneCount, scenes }) => ({
    id,
    number,
    title,
    startLine,
    endLine,
    ...(typeof sceneCount === 'number' ? { sceneCount } : {}),
    ...(scenes && scenes.length > 0 ? { scenes } : {}),
  }));
};

export const readScriptEpisode = (scriptText: string, episodeId: string, options: { mode?: 'full' | 'excerpt'; lineRange?: [number, number] } = {}) => {
  const episode = parseScriptEpisodes(scriptText).find(item => item.id === episodeId || item.number === episodeId.replace(/^第?|[集话回]$/g, ''));
  if (!episode) throw new Error(`未找到剧集：${episodeId}`);
  const lines = scriptText.split('\n');
  const start = options.lineRange ? Math.max(episode.startLine, options.lineRange[0]) : episode.startLine;
  const end = options.lineRange ? Math.min(episode.endLine, options.lineRange[1]) : episode.endLine;
  const content = lines.slice(start - 1, end).join('\n');
  const maxChars = options.mode === 'excerpt' ? 5000 : 20000;
  return {
    ...episode,
    lineRange: [start, end] as [number, number],
    content: content.slice(0, maxChars),
    truncated: content.length > maxChars,
  };
};

export const searchScript = (scriptText: string, query: string, episodeId?: string) => {
  const needle = query.trim();
  if (!needle) throw new Error('搜索关键词不能为空。');
  const source = episodeId ? readScriptEpisode(scriptText, episodeId, { mode: 'full' }) : { content: scriptText, startLine: 1 };
  return source.content.split('\n').flatMap((line, index) => {
    const position = line.toLowerCase().indexOf(needle.toLowerCase());
    return position < 0 ? [] : [{ lineNumber: source.startLine + index, column: position + 1, snippet: line.trim().slice(0, 300) }];
  }).slice(0, 50);
};

export const readScriptMetadata = (scriptText: string, title: string, updatedAt: number) => {
  const episodes = parseScriptEpisodes(scriptText);
  return {
    title,
    episodeCount: episodes.length,
    lineCount: scriptText ? scriptText.split('\n').length : 0,
    updatedAt,
    directoryComplete: episodes.length > 0,
    firstEpisode: episodes[0] ? { id: episodes[0].id, title: episodes[0].title } : null,
    lastEpisode: episodes.at(-1) ? { id: episodes.at(-1)!.id, title: episodes.at(-1)!.title } : null,
  };
};
