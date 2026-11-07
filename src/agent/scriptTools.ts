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
        endLine: Math.min(sc.endLine ?? endLine, endLine),
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

const CN_DIGITS: Record<string, number> = {
  零: 0, 〇: 0, 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9,
};

export function parseChineseOrArabicNumber(raw: string | number | undefined): number | null {
  if (typeof raw === 'number' && Number.isFinite(raw)) return Math.floor(raw);
  if (typeof raw !== 'string') return null;
  const cleaned = raw.trim().replace(/^(?:第|episode[-_\s]*|ep[-_\s]*#?)/i, '').replace(/[集话回幕场]$/g, '').trim();
  if (!cleaned) return null;
  if (/^\d+$/.test(cleaned)) return parseInt(cleaned, 10);

  // Simple Chinese numeral parser up to 999
  let total = 0;
  let current = 0;
  for (const ch of cleaned) {
    if (ch in CN_DIGITS) {
      current = CN_DIGITS[ch];
    } else if (ch === '十') {
      total += (current === 0 ? 1 : current) * 10;
      current = 0;
    } else if (ch === '百') {
      total += (current === 0 ? 1 : current) * 100;
      current = 0;
    } else {
      return null;
    }
  }
  total += current;
  return total > 0 || cleaned === '零' || cleaned === '〇' ? total : null;
}

export function findEpisodeByIdentifier(episodes: ScriptEpisode[], episodeId: string | number): ScriptEpisode | undefined {
  const rawStr = String(episodeId).trim();
  if (!rawStr) return undefined;
  const targetNum = parseChineseOrArabicNumber(rawStr);
  const stripped = rawStr.replace(/^第?|[集话回]$/g, '').trim();

  return episodes.find(item => {
    if (item.id.toLowerCase() === rawStr.toLowerCase()) return true;
    if (item.title.toLowerCase() === rawStr.toLowerCase()) return true;
    if (item.number === stripped) return true;
    if (targetNum !== null) {
      const itemNum = parseChineseOrArabicNumber(item.number) ?? parseChineseOrArabicNumber(item.title);
      if (itemNum !== null && itemNum === targetNum) return true;
    }
    return false;
  });
}

export const readScriptEpisode = (scriptText: string, episodeId: string, options: { mode?: 'full' | 'excerpt'; lineRange?: [number, number] } = {}) => {
  const episodes = parseScriptEpisodes(scriptText);
  const episode = findEpisodeByIdentifier(episodes, episodeId);
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

export interface ScriptSearchOptions {
  episode?: string | number;
  scene?: string;
  startLine?: number;
  endLine?: number;
  limit?: number;
  scenePattern?: string;
  flags?: string;
  precomputedScenes?: SceneChunk[];
}

export interface ScriptSearchScope {
  episode?: string;
  scene?: string;
  startLine: number;
  endLine: number;
}

export const searchScriptWithScope = (
  scriptText: string,
  query: string,
  options: ScriptSearchOptions = {}
): { matches: Array<{ index: number; lineNumber: number; column: number; snippet: string }>; totalMatches: number; scope?: ScriptSearchScope } => {
  const needle = query.trim();
  if (!needle) throw new Error('搜索关键词不能为空。');
  if (!scriptText) return { matches: [], totalMatches: 0 };

  const allLines = scriptText.split('\n');
  let rangeStart = 1;
  let rangeEnd = allLines.length;
  let matchedEpisodeTitle: string | undefined;
  let matchedSceneTitle: string | undefined;
  let hasExplicitScope = false;

  const episodes = parseScriptEpisodes(scriptText, {
    scenePattern: options.scenePattern,
    flags: options.flags,
    precomputedScenes: options.precomputedScenes,
  });

  if (options.episode !== undefined && options.episode !== null && String(options.episode).trim() !== '') {
    hasExplicitScope = true;
    const epRaw = String(options.episode).trim();
    const ep = findEpisodeByIdentifier(episodes, epRaw);
    if (ep) {
      rangeStart = Math.max(rangeStart, ep.startLine);
      rangeEnd = Math.min(rangeEnd, ep.endLine);
      matchedEpisodeTitle = ep.title;
    } else {
      // Also check if the user/Agent passed a scene identifier like "1-5" in episode
      for (const candidateEp of episodes) {
        const sc = candidateEp.scenes?.find(
          s =>
            s.sceneNumber === epRaw ||
            s.id.toLowerCase() === epRaw.toLowerCase() ||
            s.title.toLowerCase().includes(epRaw.toLowerCase())
        );
        if (sc) {
          rangeStart = Math.max(rangeStart, sc.startLine);
          rangeEnd = Math.min(rangeEnd, sc.endLine);
          matchedEpisodeTitle = candidateEp.title;
          matchedSceneTitle = sc.title;
          break;
        }
      }
    }
  }

  if (typeof options.scene === 'string' && options.scene.trim()) {
    hasExplicitScope = true;
    const scRaw = options.scene.trim();
    for (const candidateEp of episodes) {
      const sc = candidateEp.scenes?.find(
        s =>
          s.sceneNumber === scRaw ||
          s.id.toLowerCase() === scRaw.toLowerCase() ||
          s.title.toLowerCase().includes(scRaw.toLowerCase())
      );
      if (sc) {
        rangeStart = Math.max(rangeStart, sc.startLine);
        rangeEnd = Math.min(rangeEnd, sc.endLine);
        matchedEpisodeTitle = matchedEpisodeTitle || candidateEp.title;
        matchedSceneTitle = sc.title;
        break;
      }
    }
  }

  if (typeof options.startLine === 'number' && Number.isFinite(options.startLine) && options.startLine >= 1) {
    hasExplicitScope = true;
    rangeStart = Math.max(rangeStart, Math.floor(options.startLine));
  }
  if (typeof options.endLine === 'number' && Number.isFinite(options.endLine) && options.endLine >= 1) {
    hasExplicitScope = true;
    rangeEnd = Math.min(rangeEnd, Math.floor(options.endLine));
  }

  if (rangeStart > rangeEnd) {
    return {
      matches: [],
      totalMatches: 0,
      ...(hasExplicitScope
        ? {
            scope: {
              ...(matchedEpisodeTitle ? { episode: matchedEpisodeTitle } : {}),
              ...(matchedSceneTitle ? { scene: matchedSceneTitle } : {}),
              startLine: rangeStart,
              endLine: rangeEnd,
            },
          }
        : {}),
    };
  }

  const maxLimit =
    typeof options.limit === 'number' && Number.isFinite(options.limit)
      ? Math.min(200, Math.max(1, Math.floor(options.limit)))
      : 50;

  const needleLower = needle.toLowerCase();
  const allMatches: Array<{ index: number; lineNumber: number; column: number; snippet: string }> = [];

  for (let lineNum = rangeStart; lineNum <= rangeEnd; lineNum++) {
    const line = allLines[lineNum - 1] ?? '';
    const position = line.toLowerCase().indexOf(needleLower);
    if (position >= 0) {
      allMatches.push({
        index: allMatches.length + 1,
        lineNumber: lineNum,
        column: position + 1,
        snippet: line.trim().slice(0, 300),
      });
    }
  }

  return {
    matches: allMatches.slice(0, maxLimit),
    totalMatches: allMatches.length,
    ...(hasExplicitScope
      ? {
          scope: {
            ...(matchedEpisodeTitle ? { episode: matchedEpisodeTitle } : {}),
            ...(matchedSceneTitle ? { scene: matchedSceneTitle } : {}),
            startLine: rangeStart,
            endLine: rangeEnd,
          },
        }
      : {}),
  };
};

export const searchScript = (
  scriptText: string,
  query: string,
  episodeOrOptions?: string | ScriptSearchOptions
) => {
  if (typeof episodeOrOptions === 'string') {
    return searchScriptWithScope(scriptText, query, { episode: episodeOrOptions }).matches;
  }
  return searchScriptWithScope(scriptText, query, episodeOrOptions).matches;
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
