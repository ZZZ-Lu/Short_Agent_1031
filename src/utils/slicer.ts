import { SceneChunk, ScriptParagraph } from '../types/script';

const DEFAULT_EPISODE_RX =
  /^(?:【\s*第?\s*([0-9一二三四五六七八九十百千]+)\s*[集话回][^】]*】|第\s*([0-9一二三四五六七八九十百千]+)\s*[集话回].*|(?:[一二三四五六七八九十百千]+|[0-9]+)\s*集\s*$|(?:#+\s*)?(?:EPISODE|EP)\s*#?\s*\d+.*)/i;

const DEFAULT_SCENE_RX =
  /^(?:【\s*(?:场|场景|场次)?\s*[0-9一二三四五六七八九十百千]+(?:\s*[-—–]\s*[0-9]+)?[^】]*】|\d+\s*[-—–]\s*\d+(?:\s*(?:[日夜晨昏早晚内外景INTEXT.\s].*)?)|第\s*[0-9一二三四五六七八九十百千]+\s*[场幕].*|(?:SCENE)\s*#?\s*\d+.*|[0-9]+[.\-、]\s*(?:内景|外景|内|外).*|(?:内景|外景|INT\.|EXT\.)\s+.*)/i;

const NEXT_LINE_META_RX =
  /^(?:([日夜晨昏早晚黄昏清晨白昼午夜]+)\s+([内外]+景?|内外|内\/外)\s*(.*)|([内外]+景?|内外|内\/外)\s+([日夜晨昏早晚黄昏清晨白昼午夜]+)\s*(.*))$/;

const ROSTER_LINE_RX =
  /^(?:【\s*(?:出场)?(?:人物|角色)\s*】|(?:出场)?(?:人物|角色)\s*(?:[:：]|[\s　]+))(.*)$/i;

export function parseSceneHeaderMetadata(
  headerLine: string,
  nextLine?: string
): {
  sceneNumber?: string;
  timeOfDay?: string;
  type?: 'INT' | 'EXT' | 'MIXED';
  locationName?: string;
  consumedNextLine: boolean;
} {
  const trimmed = headerLine.trim().replace(/^【|】$/g, '').trim();
  let sceneNumber: string | undefined;
  let rest = trimmed;

  const dashMatch = trimmed.match(/^(\d+)\s*[-—–]\s*(\d+)\s*(.*)$/);
  const cnSceneMatch = trimmed.match(/^(第\s*[0-9一二三四五六七八九十百千]+\s*[场幕])\s*(.*)$/);
  const bracketSceneMatch = trimmed.match(/^(?:场|场景|场次)\s*([0-9一二三四五六七八九十百千]+)\s*(.*)$/);

  if (dashMatch) {
    sceneNumber = `${dashMatch[1]}-${dashMatch[2]}`;
    rest = (dashMatch[3] || '').trim();
  } else if (cnSceneMatch) {
    sceneNumber = cnSceneMatch[1].replace(/\s+/g, '');
    rest = (cnSceneMatch[2] || '').trim();
  } else if (bracketSceneMatch) {
    sceneNumber = `第${bracketSceneMatch[1]}场`;
    rest = (bracketSceneMatch[2] || '').trim();
  }

  let consumedNextLine = false;
  if (!rest && nextLine) {
    const nextTrimmed = nextLine.trim();
    if (NEXT_LINE_META_RX.test(nextTrimmed)) {
      rest = nextTrimmed;
      consumedNextLine = true;
    }
  }

  let timeOfDay: string | undefined;
  let type: 'INT' | 'EXT' | 'MIXED' | undefined;
  let locationName: string | undefined;

  if (rest) {
    const tokens = rest
      .replace(/[·/，,。：:]/g, ' ')
      .split(/[\s　]+/)
      .map(t => t.trim())
      .filter(Boolean);

    const remainingTokens: string[] = [];
    for (const tok of tokens) {
      if (!timeOfDay && /^(?:日|夜|晨|昏|早|晚|清晨|黄昏|白昼|午夜|白天|夜晚|DAY|NIGHT|MORNING|EVENING)$/i.test(tok)) {
        timeOfDay = tok;
      } else if (!type && /^(?:内|内景|INT\.?|室内)$/i.test(tok)) {
        type = 'INT';
      } else if (!type && /^(?:外|外景|EXT\.?|室外)$/i.test(tok)) {
        type = 'EXT';
      } else if (!type && /^(?:内外|内\/外|内外景|INT\/EXT)$/i.test(tok)) {
        type = 'MIXED';
      } else {
        // Also handle combined token like "日内" or "夜外"
        const combinedMatch = tok.match(/^([日夜晨昏早晚])([内外])$/);
        if (combinedMatch && !timeOfDay && !type) {
          timeOfDay = combinedMatch[1];
          type = combinedMatch[2] === '内' ? 'INT' : 'EXT';
        } else {
          remainingTokens.push(tok);
        }
      }
    }
    if (remainingTokens.length > 0) {
      locationName = remainingTokens.join(' ');
    }
  }

  return {
    sceneNumber,
    timeOfDay,
    type,
    locationName,
    consumedNextLine,
  };
}

export function parseRosterCharacters(lines: string[]): string[] {
  for (let i = 0; i < Math.min(lines.length, 6); i++) {
    const trimmed = lines[i].trim();
    const m = trimmed.match(ROSTER_LINE_RX);
    if (m && m[1]) {
      return m[1]
        .replace(/[、，,；;：:]/g, ' ')
        .split(/[\s　]+/)
        .map(s => s.trim())
        .filter(Boolean);
    }
  }
  return [];
}

/**
 * 提取场次内的段落列表（标准：换行即为下一段落，没有换行就是一个段落）。
 * 自动跳过场首的集标题行、场次标题行（如 "1-2"、"日 内 医院办公室"）与场首人物名单行（"人物：..."），
 * 将场次内的每个非空自然行作为独立段落并赋予 1-based 连续序号 index 与原剧本 1-based 行号 lineNumber。
 */
export function extractSceneParagraphs(
  allLines: string[],
  startLine: number,
  endLine: number,
  options?: { consumedNextLine?: boolean; skipHeaderCheck?: boolean }
): ScriptParagraph[] {
  const safeStart = Math.max(1, Math.floor(startLine));
  const safeEnd = Math.min(allLines.length, Math.floor(endLine));
  if (safeStart > safeEnd) return [];

  const paragraphs: ScriptParagraph[] = [];
  let consumedHeaderLines = 0;
  let rosterSkipped = false;

  if (!options?.skipHeaderCheck) {
    const firstTrimmed = (allLines[safeStart - 1] || '').trim();
    const secondTrimmed = safeStart < safeEnd ? (allLines[safeStart] || '').trim() : '';
    if (DEFAULT_SCENE_RX.test(firstTrimmed)) {
      const meta = parseSceneHeaderMetadata(firstTrimmed, secondTrimmed);
      consumedHeaderLines = meta.consumedNextLine || options?.consumedNextLine ? 2 : 1;
    } else if (DEFAULT_EPISODE_RX.test(firstTrimmed) && !/^\d+\s*[-—–]\s*\d+/.test(firstTrimmed)) {
      consumedHeaderLines = 1;
    }
  }

  for (let lineNum = safeStart + consumedHeaderLines; lineNum <= safeEnd; lineNum++) {
    const rawLine = allLines[lineNum - 1] ?? '';
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    // 跳过场首前几行的人物名单行（已提取至 scene.characterNames）
    if (!rosterSkipped && lineNum - safeStart <= 5 && ROSTER_LINE_RX.test(trimmed)) {
      rosterSkipped = true;
      continue;
    }

    paragraphs.push({
      index: paragraphs.length + 1,
      lineNumber: lineNum,
      text: trimmed,
    });
  }

  return paragraphs;
}

export function sliceScriptIntoScenes(
  scriptText: string,
  scenePattern?: string,
  flags: string = 'gim'
): SceneChunk[] {
  if (!scriptText || !scriptText.trim()) return [];

  try {
    let customSceneRx: RegExp | null = null;
    if (scenePattern && scenePattern.trim()) {
      let validFlags = String(flags || '').replace(/[^gimsuy]/g, '').replace(/g/g, '');
      if (!validFlags) validFlags = 'im';
      try {
        customSceneRx = new RegExp(String(scenePattern), validFlags);
      } catch {
        customSceneRx = null;
      }
    }

    const lines = scriptText.split('\n');
    const lineOffsets: number[] = [];
    let charAcc = 0;
    for (const l of lines) {
      lineOffsets.push(charAcc);
      charAcc += l.length + 1;
    }

    const scenes: SceneChunk[] = [];
    let currentEpisodeId: string | undefined;
    let currentEpisodeTitle: string | undefined;

    interface RawSceneStart {
      lineIdx: number;
      charIndex: number;
      episodeId?: string;
      episodeTitle?: string;
      rawTitleLine: string;
      sceneNumber?: string;
      timeOfDay?: string;
      type?: 'INT' | 'EXT' | 'MIXED';
      locationName?: string;
      consumedNextLine?: boolean;
    }

    const sceneStarts: RawSceneStart[] = [];

    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      if (!trimmed) continue;

      if (DEFAULT_EPISODE_RX.test(trimmed) && !/^\d+\s*[-—–]\s*\d+/.test(trimmed)) {
        const bracket = trimmed.match(/^【(.+?)】/);
        currentEpisodeTitle = bracket ? bracket[1].trim() : trimmed;
        currentEpisodeId = `episode-${i + 1}`;
        continue;
      }

      const isSceneLine =
        (customSceneRx ? customSceneRx.test(trimmed) : false) || DEFAULT_SCENE_RX.test(trimmed);

      if (isSceneLine) {
        const nextLine = i + 1 < lines.length ? lines[i + 1] : undefined;
        const meta = parseSceneHeaderMetadata(trimmed, nextLine);
        sceneStarts.push({
          lineIdx: i,
          charIndex: lineOffsets[i],
          episodeId: currentEpisodeId,
          episodeTitle: currentEpisodeTitle,
          rawTitleLine: trimmed,
          sceneNumber: meta.sceneNumber,
          timeOfDay: meta.timeOfDay,
          type: meta.type,
          locationName: meta.locationName,
          consumedNextLine: meta.consumedNextLine,
        });
      }
    }

    for (let idx = 0; idx < sceneStarts.length; idx++) {
      const curr = sceneStarts[idx];
      const next = sceneStarts[idx + 1];
      let endLineIdx = next ? next.lineIdx - 1 : lines.length - 1;
      // 如果当前场与下一场之间夹着新的一集标题行（如“第二集”），将当前场的结束行收缩到新集标题行之前
      for (let checkIdx = curr.lineIdx + 1; checkIdx <= endLineIdx; checkIdx++) {
        const checkTrimmed = lines[checkIdx].trim();
        if (checkTrimmed && DEFAULT_EPISODE_RX.test(checkTrimmed) && !/^\d+\s*[-—–]\s*\d+/.test(checkTrimmed)) {
          endLineIdx = checkIdx - 1;
          break;
        }
      }
      const endCharIndex = endLineIdx + 1 < lines.length ? lineOffsets[endLineIdx + 1] : scriptText.length;
      const sceneLines = lines.slice(curr.lineIdx, endLineIdx + 1);
      const characterNames = parseRosterCharacters(sceneLines);
      const startLine = curr.lineIdx + 1;
      const endLine = endLineIdx + 1;
      const paragraphs = extractSceneParagraphs(lines, startLine, endLine, {
        consumedNextLine: curr.consumedNextLine,
      });

      const displayTitle = curr.sceneNumber
        ? [
            curr.sceneNumber,
            curr.timeOfDay,
            curr.type === 'INT' ? '内' : curr.type === 'EXT' ? '外' : curr.type === 'MIXED' ? '内外' : undefined,
            curr.locationName,
          ]
            .filter(Boolean)
            .join(' ')
        : curr.rawTitleLine;

      scenes.push({
        index: idx + 1,
        id: `scene-${curr.lineIdx + 1}-${curr.charIndex}`,
        episodeId: curr.episodeId,
        episodeTitle: curr.episodeTitle,
        sceneNumber: curr.sceneNumber,
        title: displayTitle || curr.rawTitleLine,
        type: curr.type,
        locationName: curr.locationName,
        timeOfDay: curr.timeOfDay,
        characterNames: characterNames.length > 0 ? characterNames : undefined,
        startLine,
        endLine,
        charIndex: curr.charIndex,
        endCharIndex,
        rawText: sceneLines.join('\n'),
        paragraphCount: paragraphs.length,
        paragraphs,
      });
    }

    return scenes;
  } catch (error) {
    console.error('Failed to slice script with pattern', scenePattern, error);
    return [];
  }
}
