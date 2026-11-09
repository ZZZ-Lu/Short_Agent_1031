import { sliceScriptIntoScenes, extractSceneParagraphs } from '../utils/slicer';
import { SceneChunk, ScriptParagraph } from '../types/script';

export type { ScriptParagraph };
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
  paragraphCount?: number;
  paragraphs?: ScriptParagraph[];
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
  paragraphCount?: number;
  scenes?: ScriptSceneSummary[];
}

const episodeHeader = /^(?:【\s*)?(?:第\s*([0-9]+|[一二三四五六七八九十百千]+)\s*[集话回]|([一二三四五六七八九十百千]+|[0-9]+)\s*集\b|(?:EPISODE|EP)\s*#?\s*(\d+))(.*?)(?:】)?$/i;

function resolveScenesForScript(
  scriptText: string,
  options?: { scenePattern?: string; flags?: string; precomputedScenes?: SceneChunk[] }
): SceneChunk[] {
  const freshScenes = sliceScriptIntoScenes(scriptText, options?.scenePattern, options?.flags);
  const pre = options?.precomputedScenes;
  if (!Array.isArray(pre) || pre.length === 0) {
    return freshScenes;
  }
  const allHaveValidLinesAndParagraphs = pre.every(
    sc =>
      typeof sc.startLine === 'number' &&
      sc.startLine >= 1 &&
      typeof sc.endLine === 'number' &&
      sc.endLine >= sc.startLine &&
      Array.isArray(sc.paragraphs)
  );
  if (!allHaveValidLinesAndParagraphs) {
    return freshScenes;
  }
  if (freshScenes.length > pre.length) {
    return freshScenes;
  }
  return pre;
}

export const parseScriptEpisodes = (
  scriptText: string,
  options?: { scenePattern?: string; flags?: string; precomputedScenes?: SceneChunk[]; includeParagraphs?: boolean }
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

  const allScenes = resolveScenesForScript(scriptText, options);

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
      .map(sc => {
        const sStart = sc.startLine ?? epStartLine;
        const sEnd = Math.min(sc.endLine ?? endLine, endLine);
        const paragraphs = Array.isArray(sc.paragraphs)
          ? sc.paragraphs.filter(p => p.lineNumber >= sStart && p.lineNumber <= sEnd)
          : extractSceneParagraphs(lines, sStart, sEnd);
        return {
          id: sc.id || `scene-${sc.index}`,
          sceneNumber: sc.sceneNumber,
          title: sc.title,
          type: sc.type,
          timeOfDay: sc.timeOfDay,
          locationName: sc.locationName,
          characterNames: sc.characterNames,
          startLine: sStart,
          endLine: sEnd,
          paragraphCount: paragraphs.length,
          ...(options?.includeParagraphs ? { paragraphs } : {}),
        };
      });

    const totalParagraphs = epScenes.reduce((acc, s) => acc + (s.paragraphCount ?? 0), 0);

    return {
      id: `episode-${epStartLine}`,
      number: start.number,
      title: start.title,
      startLine: epStartLine,
      endLine,
      startChar: start.startChar,
      endChar: endChar,
      sceneCount: epScenes.length,
      ...(epScenes.length > 0 ? { paragraphCount: totalParagraphs } : {}),
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
  const lines = scriptText ? scriptText.split('\n') : [];
  let entries = parseScriptEpisodes(scriptText, {
    scenePattern: options.scenePattern,
    flags: options.flags,
    precomputedScenes: options.precomputedScenes,
    includeParagraphs: false,
  });

  // Fallback: if script has no explicit episode headers but has scenes, expose scenes as directory entries
  if (entries.length === 0 && scriptText?.trim()) {
    const scenes = resolveScenesForScript(scriptText, options);
    entries = scenes.map(sc => {
      const sStart = sc.startLine ?? 1;
      const sEnd = sc.endLine ?? 1;
      const pCount = Array.isArray(sc.paragraphs)
        ? sc.paragraphs.length
        : extractSceneParagraphs(lines, sStart, sEnd).length;
      return {
        id: sc.id || `scene-${sc.index}`,
        number: sc.sceneNumber || String(sc.index),
        title: sc.title,
        startLine: sStart,
        endLine: sEnd,
        startChar: sc.charIndex ?? 0,
        endChar: sc.endCharIndex ?? scriptText.length,
        sceneCount: 1,
        paragraphCount: pCount,
        scenes: [
          {
            id: sc.id || `scene-${sc.index}`,
            sceneNumber: sc.sceneNumber,
            title: sc.title,
            type: sc.type,
            timeOfDay: sc.timeOfDay,
            locationName: sc.locationName,
            characterNames: sc.characterNames,
            startLine: sStart,
            endLine: sEnd,
            paragraphCount: pCount,
          },
        ],
      };
    });
  }

  if (options.query?.trim()) {
    const query = options.query.trim().toLowerCase();
    entries = entries.filter(entry => {
      if (entry.title.toLowerCase().includes(query)) return true;
      if (Array.isArray(entry.scenes)) {
        const matchedInSceneMeta = entry.scenes.some(
          sc =>
            sc.title.toLowerCase().includes(query) ||
            (sc.sceneNumber && sc.sceneNumber.toLowerCase().includes(query)) ||
            (sc.locationName && sc.locationName.toLowerCase().includes(query)) ||
            (Array.isArray(sc.characterNames) && sc.characterNames.some(c => c.toLowerCase().includes(query)))
        );
        if (matchedInSceneMeta) return true;
      }
      const epSlice = lines.slice(Math.max(0, entry.startLine - 1), Math.min(lines.length, entry.endLine));
      return epSlice.some(line => line.toLowerCase().includes(query));
    });
  }
  if (options.tailOnly) entries = entries.slice(-1);
  if (options.range) entries = entries.slice(Math.max(0, options.range[0] - 1), Math.max(0, options.range[1]));
  return entries.map(({ id, number, title, sceneCount, paragraphCount, scenes }) => ({
    id,
    number,
    title,
    ...(typeof sceneCount === 'number' ? { sceneCount } : {}),
    ...(typeof paragraphCount === 'number' ? { paragraphCount } : {}),
    ...(scenes && scenes.length > 0
      ? {
          scenes: scenes.map(s => ({
            id: s.id,
            sceneNumber: s.sceneNumber,
            title: s.title,
            type: s.type,
            timeOfDay: s.timeOfDay,
            locationName: s.locationName,
            characterNames: s.characterNames,
            paragraphCount: s.paragraphCount,
          })),
        }
      : {}),
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

export function matchesSceneIdentifier(scene: ScriptSceneSummary, sceneIndex: number, rawTarget: string | number): boolean {
  const targetStr = String(rawTarget).trim();
  if (!targetStr) return false;
  const targetLower = targetStr.toLowerCase().replace(/\s+/g, ' ');
  const normalizedDash = targetLower
    .replace(/[—–]/g, '-')
    .replace(/^(?:【?\s*第?\s*[0-9一二三四五六七八九十百千]+\s*[集话回]\s*】?\s*)/i, '')
    .trim();

  if (scene.id.toLowerCase() === targetLower) return true;
  if (scene.sceneNumber && scene.sceneNumber.toLowerCase().replace(/[—–]/g, '-') === normalizedDash) return true;
  const normTitle = scene.title.toLowerCase().replace(/[—–]/g, '-').replace(/\s+/g, ' ');
  if (normTitle.includes(normalizedDash)) return true;
  if (scene.locationName && scene.locationName.toLowerCase().includes(normalizedDash)) return true;

  // Support concatenated or partially specified scene number + location (e.g. "1-5布莱克伍德庄园" or "1-3 贫民窟门口 日 外")
  const dashMatch = normalizedDash.match(/^(\d+\s*-\s*\d+)(.+)$/);
  if (dashMatch) {
    const targetNum = dashMatch[1].replace(/\s+/g, '');
    const targetRest = dashMatch[2].trim();
    const sceneNum = (scene.sceneNumber || '').toLowerCase().replace(/[—–\s]/g, '-');
    if (sceneNum === targetNum && targetRest) {
      const genericTokens = new Set(['日', '夜', '内', '外', '晨', '昏', '早', '晚', 'int', 'ext']);
      const specificTokens = targetRest
        .split(/\s+/)
        .map(t => t.replace(/^(?:日|夜|内|外|晨|昏)+/, '').trim())
        .filter(t => t.length > 0 && !genericTokens.has(t));
      if (specificTokens.length > 0 && specificTokens.every(t => normTitle.includes(t) || (scene.locationName && scene.locationName.toLowerCase().includes(t)))) {
        return true;
      }
    }
  }

  const num = parseChineseOrArabicNumber(targetStr);
  if (num !== null && sceneIndex === num) return true;

  return false;
}

export interface ScriptReadStructuredOptions {
  episode?: string | number | Array<string | number>;
  scene?: string | number | Array<string | number>;
  paragraph?: number | [number, number] | number[];
  startParagraph?: number;
  endParagraph?: number;
  startLine?: number;
  endLine?: number;
  offset?: number;
  limit?: number;
  scenePattern?: string;
  flags?: string;
  precomputedScenes?: SceneChunk[];
}

/**
 * 按“集数 (episodes) -> 场次 (scenes) -> 段落 (paragraphs)”三层结构化输出剧本内容。
 * 段落判定标准：换行即为下一段落，没有换行就是一个段落。
 */
export function readScriptStructured(
  scriptText: string,
  options: ScriptReadStructuredOptions = {}
) {
  const lines = scriptText ? scriptText.split('\n') : [];
  if (lines.length === 0 || !scriptText.trim()) {
    return {
      total: lines.length,
      offset: 1,
      startLine: 1,
      endLine: 1,
      nextOffset: null,
      episodeCount: 0,
      sceneCount: 0,
      paragraphCount: 0,
      hasVolumeWarning: false,
      episodes: [],
      content: '',
    };
  }

  let allEpisodes = parseScriptEpisodes(scriptText, {
    scenePattern: options.scenePattern,
    flags: options.flags,
    precomputedScenes: options.precomputedScenes,
    includeParagraphs: true,
  });

  // 若整个剧本没有显式的“第X集”标题，将剧本整体视为默认第 1 集並挂载场次与段落
  if (allEpisodes.length === 0) {
    const fallbackScenes = resolveScenesForScript(scriptText, options);

    if (fallbackScenes.length > 0) {
      const mappedScenes: ScriptSceneSummary[] = fallbackScenes.map(sc => {
        const sStart = sc.startLine ?? 1;
        const sEnd = sc.endLine ?? lines.length;
        const paragraphs = Array.isArray(sc.paragraphs)
          ? sc.paragraphs
          : extractSceneParagraphs(lines, sStart, sEnd);
        return {
          id: sc.id || `scene-${sc.index}`,
          sceneNumber: sc.sceneNumber,
          title: sc.title,
          type: sc.type,
          timeOfDay: sc.timeOfDay,
          locationName: sc.locationName,
          characterNames: sc.characterNames,
          startLine: sStart,
          endLine: sEnd,
          paragraphCount: paragraphs.length,
          paragraphs,
        };
      });
      allEpisodes = [
        {
          id: 'episode-1',
          number: '1',
          title: '第1集',
          startLine: 1,
          endLine: lines.length,
          startChar: 0,
          endChar: scriptText.length,
          sceneCount: mappedScenes.length,
          paragraphCount: mappedScenes.reduce((acc, s) => acc + (s.paragraphCount ?? 0), 0),
          scenes: mappedScenes,
        },
      ];
    } else {
      const paragraphs = extractSceneParagraphs(lines, 1, lines.length, { skipHeaderCheck: true });
      allEpisodes = [
        {
          id: 'episode-1',
          number: '1',
          title: '正文',
          startLine: 1,
          endLine: lines.length,
          startChar: 0,
          endChar: scriptText.length,
          sceneCount: 1,
          paragraphCount: paragraphs.length,
          scenes: [
            {
              id: 'scene-1',
              sceneNumber: '1-1',
              title: '正文',
              startLine: 1,
              endLine: lines.length,
              paragraphCount: paragraphs.length,
              paragraphs,
            },
          ],
        },
      ];
    }
  } else {
    // 确保每个分集下都有三层结构（若某集内未写显式场次标题，则将该集正文作为默认场次 1）
    allEpisodes = allEpisodes.map(ep => {
      if (Array.isArray(ep.scenes) && ep.scenes.length > 0) {
        return ep;
      }
      const paragraphs = extractSceneParagraphs(lines, ep.startLine, ep.endLine);
      const defaultScene: ScriptSceneSummary = {
        id: `${ep.id}-scene-1`,
        sceneNumber: `${ep.number}-1`,
        title: ep.title,
        startLine: ep.startLine,
        endLine: ep.endLine,
        paragraphCount: paragraphs.length,
        paragraphs,
      };
      return {
        ...ep,
        sceneCount: 1,
        paragraphCount: paragraphs.length,
        scenes: [defaultScene],
      };
    });
  }

  const episodeFilters =
    options.episode !== undefined && options.episode !== null && String(options.episode).trim() !== ''
      ? (Array.isArray(options.episode) ? options.episode : [options.episode])
      : [];
  const sceneFilters =
    options.scene !== undefined && options.scene !== null && String(options.scene).trim() !== ''
      ? (Array.isArray(options.scene) ? options.scene : [options.scene])
      : [];

  let paraStart: number | undefined =
    typeof options.startParagraph === 'number' && Number.isFinite(options.startParagraph)
      ? Math.max(1, Math.floor(options.startParagraph))
      : undefined;
  let paraEnd: number | undefined =
    typeof options.endParagraph === 'number' && Number.isFinite(options.endParagraph)
      ? Math.max(1, Math.floor(options.endParagraph))
      : undefined;

  if (typeof options.paragraph === 'number' && Number.isFinite(options.paragraph)) {
    const p = Math.max(1, Math.floor(options.paragraph));
    paraStart = p;
    paraEnd = p;
  } else if (Array.isArray(options.paragraph) && options.paragraph.length > 0) {
    if (options.paragraph.length === 2) {
      paraStart = Math.max(1, Math.floor(Number(options.paragraph[0]) || 1));
      paraEnd = Math.max(paraStart, Math.floor(Number(options.paragraph[1]) || paraStart));
    } else {
      const p = Math.max(1, Math.floor(Number(options.paragraph[0]) || 1));
      paraStart = p;
      paraEnd = p;
    }
  }

  const hasStructuredFilter =
    episodeFilters.length > 0 ||
    sceneFilters.length > 0 ||
    paraStart !== undefined ||
    paraEnd !== undefined ||
    (typeof options.startLine === 'number' && Number.isFinite(options.startLine)) ||
    (typeof options.endLine === 'number' && Number.isFinite(options.endLine));

  let effectiveStartLine = 1;
  let effectiveEndLine = lines.length;
  let nextOffset: number | null = null;

  if (!hasStructuredFilter) {
    // 兼容按 offset / limit 行号分页读取
    const rawOffset = typeof options.offset === 'number' && Number.isFinite(options.offset) ? Math.floor(options.offset) : 1;
    effectiveStartLine = Math.max(1, rawOffset);
    const limit =
      typeof options.limit === 'number' && Number.isFinite(options.limit)
        ? Math.min(200, Math.max(1, Math.floor(options.limit)))
        : 100;
    const startIdx = effectiveStartLine - 1;
    const sliceLen = Math.min(limit, Math.max(0, lines.length - startIdx));
    effectiveEndLine = sliceLen > 0 ? startIdx + sliceLen : effectiveStartLine;
    nextOffset = startIdx + limit < lines.length ? startIdx + limit + 1 : null;
  } else {
    if (typeof options.startLine === 'number' && Number.isFinite(options.startLine)) {
      effectiveStartLine = Math.max(1, Math.floor(options.startLine));
    }
    if (typeof options.endLine === 'number' && Number.isFinite(options.endLine)) {
      effectiveEndLine = Math.min(lines.length, Math.floor(options.endLine));
    }
  }

  // 如果用户在 episode 参数中传了类似 "1-5" 的场次号，自动识别并并入 sceneFilters
  const resolvedEpisodeIds = new Set<string>();
  const implicitSceneFilters: Array<string | number> = [...sceneFilters];

  for (const epFilter of episodeFilters) {
    const matchedEp = findEpisodeByIdentifier(allEpisodes, epFilter);
    if (matchedEp) {
      resolvedEpisodeIds.add(matchedEp.id);
    } else {
      implicitSceneFilters.push(epFilter);
    }
  }

  const filteredEpisodes = allEpisodes
    .filter(ep => {
      if (resolvedEpisodeIds.size > 0 && !resolvedEpisodeIds.has(ep.id)) {
        return false;
      }
      if (ep.endLine < effectiveStartLine || ep.startLine > effectiveEndLine) {
        return false;
      }
      return true;
    })
    .map((ep, epIdx) => {
      const rawScenes = ep.scenes || [];
      const filteredScenes = rawScenes
        .filter((sc, scIdx) => {
          if (sc.endLine < effectiveStartLine || sc.startLine > effectiveEndLine) {
            return false;
          }
          if (implicitSceneFilters.length > 0) {
            return implicitSceneFilters.some(sf => matchesSceneIdentifier(sc, scIdx + 1, sf));
          }
          return true;
        })
        .map((sc, scIdx) => {
          const rawParas = sc.paragraphs || [];
          const filteredParas = rawParas
            .filter(p => {
              if (p.lineNumber < effectiveStartLine || p.lineNumber > effectiveEndLine) {
                return false;
              }
              if (paraStart !== undefined && p.index < paraStart) return false;
              if (paraEnd !== undefined && p.index > paraEnd) return false;
              return true;
            })
            .map(p => ({
              index: p.index,
              text: p.text,
            }));

          return {
            index: scIdx + 1,
            id: sc.id,
            ...(sc.sceneNumber ? { sceneNumber: sc.sceneNumber } : {}),
            title: sc.title,
            ...(sc.type ? { type: sc.type } : {}),
            ...(sc.timeOfDay ? { timeOfDay: sc.timeOfDay } : {}),
            ...(sc.locationName ? { locationName: sc.locationName } : {}),
            ...(sc.characterNames && sc.characterNames.length > 0 ? { characterNames: sc.characterNames } : {}),
            paragraphCount: filteredParas.length,
            paragraphs: filteredParas,
          };
        })
        .filter(sc => implicitSceneFilters.length === 0 || sc.paragraphCount >= 0);

      const epParaCount = filteredScenes.reduce((acc, s) => acc + s.paragraphCount, 0);
      return {
        index: epIdx + 1,
        id: ep.id,
        number: ep.number,
        title: ep.title,
        sceneCount: filteredScenes.length,
        paragraphCount: epParaCount,
        scenes: filteredScenes,
      };
    })
    .filter(ep => ep.sceneCount > 0);

  if (hasStructuredFilter && filteredEpisodes.length > 0) {
    const matchedRanges = filteredEpisodes.flatMap(ep => {
      const origEp = allEpisodes.find(e => e.id === ep.id);
      return (ep.scenes || []).map(sc => {
        const origSc = origEp?.scenes?.find(s => s.id === sc.id);
        return origSc ? { startLine: origSc.startLine, endLine: origSc.endLine } : null;
      });
    }).filter((r): r is { startLine: number; endLine: number } => r !== null);
    if (matchedRanges.length > 0) {
      effectiveStartLine = Math.min(...matchedRanges.map(r => r.startLine));
      effectiveEndLine = Math.max(...matchedRanges.map(r => r.endLine));
    }
  } else if (hasStructuredFilter && filteredEpisodes.length === 0) {
    effectiveStartLine = 1;
    effectiveEndLine = 0;
  }

  const totalScenes = filteredEpisodes.reduce((acc, ep) => acc + ep.sceneCount, 0);
  const totalParagraphs = filteredEpisodes.reduce((acc, ep) => acc + ep.paragraphCount, 0);
  const contentSlice = effectiveEndLine >= effectiveStartLine
    ? lines.slice(Math.max(0, effectiveStartLine - 1), effectiveEndLine).join('\n')
    : '';

  const scenesSummary = filteredEpisodes.flatMap(ep =>
    (ep.scenes || []).map(sc => ({
      sceneNumber: sc.sceneNumber || String(sc.index),
      title: sc.title,
      paragraphCount: sc.paragraphCount,
    }))
  );

  const isExplicitSceneBatch = Array.isArray(options.scene) && options.scene.length > 1;
  const isMultiSceneMatch = totalScenes > 1;
  const hasVolumeWarning = isExplicitSceneBatch
    ? totalParagraphs > 30
    : isMultiSceneMatch
      ? (totalParagraphs >= 15 || totalScenes >= 2)
      : (totalParagraphs > 30 && !options.paragraph);
  const notice = hasVolumeWarning
    ? (isMultiSceneMatch && options.scene && !isExplicitSceneBatch
        ? `我发现当前条件 "${options.scene}" 共匹配到 ${totalScenes} 个场次（${scenesSummary.map(s => `"${s.title}" ${s.paragraphCount}段`).join('、')}，共 ${totalParagraphs} 个段落），内容较多。本次已将全部原文返回在下方，当前处于 Stage 0 阶段，建议拆分为多轮计划处理。`
        : `我发现当前读取范围包含 ${totalScenes} 个场次共 ${totalParagraphs} 个段落，内容较多。本次已将全部原文返回在下方，当前处于 Stage 0 阶段，建议拆分为多轮计划处理。`)
    : undefined;

  return {
    total: lines.length,
    offset: effectiveStartLine,
    startLine: effectiveStartLine,
    endLine: effectiveEndLine,
    nextOffset,
    episodeCount: filteredEpisodes.length,
    sceneCount: totalScenes,
    paragraphCount: totalParagraphs,
    hasVolumeWarning,
    ...(notice ? { notice, warning: notice } : {}),
    ...(hasVolumeWarning ? { scenesSummary } : {}),
    episodes: filteredEpisodes,
    content: contentSlice,
  };
}

export const readScriptEpisode = (scriptText: string, episodeId: string, options: { mode?: 'full' | 'excerpt'; lineRange?: [number, number] } = {}) => {
  const episodes = parseScriptEpisodes(scriptText, { includeParagraphs: true });
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
}

export interface ScriptSearchSceneSummary {
  sceneId?: string;
  sceneNumber: string;
  sceneTitle: string;
  matchCount: number;
  matchIndices: number[];
}

export interface ScriptSearchResult {
  matches: Array<{ index: number; paragraphIndex?: number; sceneTitle?: string; snippet: string }>;
  totalMatches: number;
  scope?: ScriptSearchScope;
  hasVolumeWarning?: boolean;
  warning?: string;
  scenesSummary?: ScriptSearchSceneSummary[];
}

export const searchScriptWithScope = (
  scriptText: string,
  query: string,
  options: ScriptSearchOptions = {}
): ScriptSearchResult => {
  const needle = query.trim();
  if (!needle) throw new Error('搜索关键词不能为空。');
  if (!scriptText) return { matches: [], totalMatches: 0, hasVolumeWarning: false };

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
      hasVolumeWarning: false,
      ...(hasExplicitScope
        ? {
            scope: {
              ...(matchedEpisodeTitle ? { episode: matchedEpisodeTitle } : {}),
              ...(matchedSceneTitle ? { scene: matchedSceneTitle } : {}),
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
  const rawMatches: Array<{ index: number; lineNumber: number; snippet: string }> = [];

  for (let lineNum = rangeStart; lineNum <= rangeEnd; lineNum++) {
    const line = allLines[lineNum - 1] ?? '';
    const position = line.toLowerCase().indexOf(needleLower);
    if (position >= 0) {
      rawMatches.push({
        index: rawMatches.length + 1,
        lineNumber: lineNum,
        snippet: line.trim().slice(0, 300),
      });
    }
  }

  // 聚合各场次命中分布与段落序号
  const sceneSummaryMap = new Map<string, ScriptSearchSceneSummary>();
  const flatScenes: Array<{ epTitle: string; scene: ScriptSceneSummary }> = [];
  for (const ep of episodes) {
    for (const sc of ep.scenes || []) {
      flatScenes.push({ epTitle: ep.title, scene: sc });
    }
  }

  const preliminaryMatches = rawMatches.map(m => {
    const matchedScene = flatScenes.find(
      item => m.lineNumber >= item.scene.startLine && m.lineNumber <= item.scene.endLine
    );
    const sceneKey = matchedScene
      ? matchedScene.scene.id || `${matchedScene.epTitle}-${matchedScene.scene.sceneNumber || matchedScene.scene.title}`
      : 'other';
    const sceneNum = matchedScene?.scene.sceneNumber || '未知场次';
    const sceneTitle = matchedScene?.scene.title || matchedScene?.epTitle || '未归类场次';

    let paragraphIndex: number | undefined;
    if (matchedScene) {
      const sceneParas = Array.isArray(matchedScene.scene.paragraphs)
        ? matchedScene.scene.paragraphs
        : extractSceneParagraphs(allLines, matchedScene.scene.startLine, matchedScene.scene.endLine);
      const foundP = sceneParas.find(p => p.lineNumber === m.lineNumber);
      if (foundP) {
        paragraphIndex = foundP.index;
      }
    }

    return {
      lineNumber: m.lineNumber,
      snippet: m.snippet,
      sceneKey,
      sceneId: matchedScene?.scene.id,
      sceneNum,
      sceneTitle,
      hasMatchedScene: Boolean(matchedScene),
      paragraphIndex,
    };
  });

  // 若某场次已存在实质正文段落命中（paragraphIndex !== undefined），自动剔除该场次内无段落序号的场次头/人物名单行命中
  const scenesWithParagraphHits = new Set(
    preliminaryMatches
      .filter(m => m.hasMatchedScene && m.paragraphIndex !== undefined)
      .map(m => m.sceneKey)
  );
  const effectiveMatches = preliminaryMatches.filter(
    m => !(m.hasMatchedScene && m.paragraphIndex === undefined && scenesWithParagraphHits.has(m.sceneKey))
  );

  const allMatches: Array<{ index: number; paragraphIndex?: number; sceneTitle?: string; snippet: string }> = [];

  for (let idx = 0; idx < effectiveMatches.length; idx++) {
    const m = effectiveMatches[idx];
    const matchIndex = idx + 1;
    allMatches.push({
      index: matchIndex,
      snippet: m.snippet,
      ...(m.paragraphIndex !== undefined ? { paragraphIndex: m.paragraphIndex } : {}),
      ...(m.hasMatchedScene ? { sceneTitle: m.sceneTitle } : {}),
    });

    const existing = sceneSummaryMap.get(m.sceneKey);
    if (!existing) {
      sceneSummaryMap.set(m.sceneKey, {
        sceneId: m.sceneId,
        sceneNumber: m.sceneNum,
        sceneTitle: m.sceneTitle,
        matchCount: 1,
        matchIndices: [matchIndex],
      });
    } else {
      existing.matchCount += 1;
      existing.matchIndices.push(matchIndex);
    }
  }

  const scenesSummary = Array.from(sceneSummaryMap.values());
  const hasVolumeWarning = allMatches.length > 15 || (scenesSummary.length >= 2 && allMatches.length >= 12);
  const notice = hasVolumeWarning
    ? `我发现检索到 ${allMatches.length} 条匹配，跨越 ${scenesSummary.length} 个场次，内容较多。本次已将全部匹配结果返回在下方，当前处于 Stage 0 阶段，建议拆分为多轮计划处理。`
    : undefined;

  return {
    matches: allMatches.slice(0, maxLimit),
    totalMatches: allMatches.length,
    hasVolumeWarning,
    ...(notice ? { notice, warning: notice } : {}),
    ...(scenesSummary.length > 0 ? { scenesSummary } : {}),
    ...(hasExplicitScope
      ? {
          scope: {
            ...(matchedEpisodeTitle ? { episode: matchedEpisodeTitle } : {}),
            ...(matchedSceneTitle ? { scene: matchedSceneTitle } : {}),
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
