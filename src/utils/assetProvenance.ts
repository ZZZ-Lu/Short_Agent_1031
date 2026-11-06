/**
 * Asset Provenance Aggregation Utility
 * 
 * Aggregates asset occurrences from fine-grained text matches into meaningful script units:
 * 1. De-duplicates multiple matches within the same scene.
 * 2. Lists specific scenes where the asset appears.
 * 3. Provides firstMatchCharIndex for accurate jump/caret positioning.
 */

export interface ProvenanceSection {
  id: string;
  type: 'episode' | 'scene' | 'chapter' | 'heading' | 'segment';
  title: string;
  subTitle?: string;
  lineNumber: number;
  charIndex: number;
  endCharIndex: number;
}

export interface ProvenanceEpisodeGroup {
  episode: ProvenanceSection | null;
  scenes: ProvenanceSection[];
}

export interface AssetProvenanceHighlightSpan {
  charIndex: number;
  endCharIndex: number;
  text: string;
  lineNumber: number;
  sceneTitle?: string;
}

export interface AssetProvenanceItem {
  id: string;
  type: 'episode' | 'scene';
  title: string;
  displayLabel: string;
  isFullEpisode?: boolean;
  charIndex: number;
  firstMatchCharIndex: number;
  matchedTerm?: string;
  highlightCharIndex?: number;
  highlightText?: string;
  highlights?: AssetProvenanceHighlightSpan[];
  lineNumber: number;
  sceneCount?: number;
  matchedSceneCount?: number;
}

export interface ProvenanceCandidateItem {
  candidateId: string;
  sceneId: string;
  sceneTitle: string;
  lineNumber: number;
  charIndex: number;
  matchedTerm: string;
  evidenceText?: string;
  isRosterLine?: boolean;
  contextSnippet: string;
  anchorText: string;
  offsetInAnchor: number;
}

export interface VerifiedAnchorRecord {
  id: string;
  sceneId?: string;
  sceneTitle: string;
  matchedTerm: string;
  evidenceText?: string;
  anchorText: string;
  offsetInAnchor: number;
  fallbackCharIndex?: number;
  lineNumber?: number;
}

export type ProvenanceEvidenceInput =
  | string
  | {
      sceneTitle?: string;
      lineNumber?: number;
      evidenceText?: string;
      text?: string;
      snippet?: string;
      quote?: string;
      candidateId?: string;
    };

export interface RawTocInput {
  id: string;
  title: string;
  subTitle?: string;
  lineNumber: number;
  charIndex: number;
  type: string;
}

/**
 * Lightweight deterministic hash for script text to detect modifications
 */
export function computeScriptSignature(scriptText: string): string {
  if (!scriptText) return '0:0';
  let hash = 5381;
  for (let i = 0; i < scriptText.length; i++) {
    hash = ((hash << 5) + hash) ^ scriptText.charCodeAt(i);
  }
  return `${scriptText.length}:${(hash >>> 0).toString(36)}`;
}

const NEXT_LINE_SCENE_META_RX =
  /^(?:[日夜晨昏早晚黄昏清晨白昼午夜]+[\s/·]+[内外]+景?|[内外]+景?[\s/·]+[日夜晨昏早晚黄昏清晨白昼午夜]+)(?:\s+.*)?$/;

/**
 * Parses script lines into episodes and scenes if structured TOC is not provided
 */
export function extractSectionsFromScript(scriptText: string): ProvenanceSection[] {
  if (!scriptText || !scriptText.trim()) return [];
  const lines = scriptText.split('\n');
  const sections: Array<Omit<ProvenanceSection, 'endCharIndex'>> = [];
  let charAcc = 0;

  const episodeRx =
    /^(?:【\s*第?\s*[0-9一二三四五六七八九十百千]+\s*[集话回][^】]*】|第\s*[0-9一二三四五六七八九十百千]+\s*[集话回]|(?:[一二三四五六七八九十百千]+|[0-9]+)\s*集\s*$|(?:#+\s*)?(?:EPISODE|EP)\s*#?\s*\d+)/i;
  const sceneRx =
    /^(?:【\s*(?:场|场景|场次)?\s*[0-9一二三四五六七八九十百千]+(?:\s*[-—–]\s*[0-9]+)?[^】]*】|\d+\s*[-—–]\s*\d+(?:\s*(?:[日夜晨昏早晚内外景INTEXT.\s].*)?|$)|第\s*[0-9一二三四五六七八九十百千]+\s*[场幕]|(?:SCENE)\s*#?\s*\d+|[0-9]+[.\-、]\s*(?:内景|外景|内|外)|(?:内景|外景|INT\.|EXT\.)\s+)/i;

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed) {
      const isDashScene = /^\d+\s*[-—–]\s*\d+/.test(trimmed);
      if (!isDashScene && episodeRx.test(trimmed)) {
        let title = trimmed;
        const bracket = trimmed.match(/^【(.+?)】/);
        if (bracket) title = bracket[1];
        sections.push({
          id: `ep-${index}-${charAcc}`,
          type: 'episode',
          title,
          lineNumber: index + 1,
          charIndex: charAcc,
        });
      } else if (sceneRx.test(trimmed)) {
        let title = trimmed;
        let subTitle: string | undefined;
        const bracket = trimmed.match(/^【(.+?)】/);
        if (bracket) title = bracket[1];
        if (/^\d+\s*[-—–]\s*\d+$/.test(title) && index + 1 < lines.length) {
          const nextTrimmed = lines[index + 1].trim();
          if (NEXT_LINE_SCENE_META_RX.test(nextTrimmed)) {
            subTitle = nextTrimmed;
          }
        }
        sections.push({
          id: `sc-${index}-${charAcc}`,
          type: 'scene',
          title,
          subTitle,
          lineNumber: index + 1,
          charIndex: charAcc,
        });
      }
    }
    charAcc += line.length + 1;
  });

  const completeSections: ProvenanceSection[] = sections.map((sec, idx) => ({
    ...sec,
    endCharIndex: idx + 1 < sections.length ? sections[idx + 1].charIndex : scriptText.length,
  }));

  return completeSections;
}

/**
 * Aggregates script sections into Episode groups with their child scenes.
 * Automatically supplements child scenes from scriptText if tocItems only provided episode headings.
 */
export function groupSectionsByEpisode(
  scriptText: string,
  tocItems?: RawTocInput[]
): ProvenanceEpisodeGroup[] {
  let sections: ProvenanceSection[] = [];

  if (tocItems && tocItems.length > 0) {
    const sorted = [...tocItems].sort((a, b) => a.charIndex - b.charIndex);
    sections = sorted.map((item, idx) => ({
      id: item.id,
      type: (item.type as any) || 'scene',
      title: item.title,
      subTitle: item.subTitle,
      lineNumber: item.lineNumber,
      charIndex: item.charIndex,
      endCharIndex: idx + 1 < sorted.length ? sorted[idx + 1].charIndex : scriptText.length,
    }));
  }

  // Always check extractSectionsFromScript so that if tocItems missed sub-scenes (e.g. 22—1, 22-2),
  // those sub-scenes are merged into sections.
  const hasEpisodesOrScenes = sections.some(s => s.type === 'episode' || s.type === 'scene');
  if (!hasEpisodesOrScenes) {
    sections = extractSectionsFromScript(scriptText);
  } else if (scriptText && scriptText.trim()) {
    const autoSections = extractSectionsFromScript(scriptText);
    const existingLines = new Set(sections.map(s => s.lineNumber));
    let addedAny = false;
    for (const autoSec of autoSections) {
      if (!existingLines.has(autoSec.lineNumber)) {
        sections.push(autoSec);
        existingLines.add(autoSec.lineNumber);
        addedAny = true;
      }
    }
    if (addedAny) {
      sections.sort((a, b) => a.charIndex - b.charIndex);
      sections = sections.map((sec, idx) => ({
        ...sec,
        endCharIndex: idx + 1 < sections.length ? sections[idx + 1].charIndex : scriptText.length,
      }));
    }
  }

  if (sections.length === 0) {
    return [];
  }

  const groups: ProvenanceEpisodeGroup[] = [];
  let currentGroup: ProvenanceEpisodeGroup | null = null;

  for (const sec of sections) {
    const isEpisode =
      sec.type === 'episode' ||
      (/集|EPISODE|EP\b/i.test(sec.title) && !/^\d+\s*[-—–]\s*\d+/.test(sec.title));
    if (isEpisode) {
      currentGroup = {
        episode: sec,
        scenes: [],
      };
      groups.push(currentGroup);
    } else {
      // Scene or section
      if (!currentGroup) {
        currentGroup = {
          episode: null,
          scenes: [],
        };
        groups.push(currentGroup);
      }
      currentGroup.scenes.push(sec);
    }
  }

  // Update each episode's endCharIndex to cover all its child scenes
  for (let i = 0; i < groups.length; i++) {
    const g = groups[i];
    if (g.episode && g.scenes.length > 0) {
      const lastScene = g.scenes[g.scenes.length - 1];
      g.episode = {
        ...g.episode,
        endCharIndex: Math.max(g.episode.endCharIndex, lastScene.endCharIndex),
      };
    }
  }

  return groups;
}

/**
 * Flattens episode/scene groups into linear searchable sections
 */
function getFlatSearchSections(
  scriptText: string,
  tocItems?: RawTocInput[]
): ProvenanceSection[] {
  const groups = groupSectionsByEpisode(scriptText, tocItems);
  const flat: ProvenanceSection[] = [];
  for (const g of groups) {
    if (g.scenes.length > 0) {
      for (const sc of g.scenes) {
        flat.push({
          ...sc,
          title: g.episode && !sc.title.includes(g.episode.title) ? `${g.episode.title} ${sc.title}`.trim() : sc.title,
        });
      }
    } else if (g.episode) {
      flat.push(g.episode);
    }
  }
  if (flat.length === 0 && scriptText.trim()) {
    flat.push({
      id: 'sec-full',
      type: 'scene',
      title: '正文',
      lineNumber: 1,
      charIndex: 0,
      endCharIndex: scriptText.length,
    });
  }
  return flat;
}

/**
 * Detects whether a script line is a static character roster header (e.g. "人物 娜塔莉亚 布拉姆 安保若干" or "人物：...").
 * Roster lines list names at the top of a scene and should not be used as the primary visual highlight when narrative lines exist.
 */
export function isCharacterRosterLine(lineText: string): boolean {
  const trimmed = (lineText || '').trim();
  if (!trimmed) return false;
  return /^(?:【\s*(?:出场)?(?:人物|角色)\s*】|(?:出场)?(?:人物|角色)\s*(?:[:：]|[\s　]+))/i.test(trimmed);
}

/**
 * Parses character names from a static character roster line (e.g. "人物 娜塔莉亚 布拉姆 安保若干")
 */
export function parseSceneRosterCharacters(lineText: string): string[] {
  const trimmed = (lineText || '').trim();
  const m = trimmed.match(/^(?:【\s*(?:出场)?(?:人物|角色)\s*】|(?:出场)?(?:人物|角色)\s*(?:[:：]|[\s　]+))(.*)$/i);
  if (!m || !m[1]) return [];
  return m[1]
    .replace(/[、，,；;：:／/|]/g, ' ')
    .split(/[\s　]+/)
    .map(s => s.trim())
    .filter(Boolean);
}

/**
 * Extracts the speaker name from a script dialogue line (e.g. "焦恩（摁住娜塔莉亚的肩膀）：..." -> "焦恩")
 */
export function extractSpeakerFromDialogueLine(lineText: string): string | null {
  const trimmed = (lineText || '').trim();
  if (!trimmed || trimmed.startsWith('▲') || isCharacterRosterLine(trimmed)) return null;
  const m = trimmed.match(/^([^：:（(【\s]+)(?:（[^）]*）|\([^)]*\)|OS|os|O\.S\.|o\.s\.)*\s*[:：]/);
  if (m && m[1]) {
    const rawSpeaker = m[1].replace(/^▲\s*/, '').trim();
    if (rawSpeaker && rawSpeaker.length <= 15) {
      return rawSpeaker;
    }
  }
  return null;
}

/**
 * Checks whether a character actually physically appears in a scene based on standard drama conventions:
 * 1. Listed in the scene cast roster (人物 ...)
 * 2. Or is the subject of an action line (▲...)
 * 3. Or is the speaker of a dialogue line (角色名：...)
 * If a character is absent from the roster, has no action lines, and speaks no lines, but is merely mentioned
 * inside someone else's dialogue (e.g. 焦恩: "布拉姆是一个狠辣的人"), that is strictly a dialogue mention (not in-scene appearance).
 */
export function isCharacterPresentInScene(
  scriptText: string,
  sec: ProvenanceSection,
  characterName: string,
  aliases: string[] = []
): boolean {
  if (!characterName || !characterName.trim()) return false;
  const rawTerms = [characterName, ...aliases]
    .map(n => n.trim().toLowerCase())
    .filter(t => t.length >= 2 && !/[，。！？；：,.!?;:▲\n]/.test(t));
  if (rawTerms.length === 0) return false;

  const slice = scriptText.slice(sec.charIndex, sec.endCharIndex);
  const lines = slice.split('\n');

  // Check 1: Roster lines in this scene
  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const trimmed = lines[i].trim();
    if (isCharacterRosterLine(trimmed)) {
      const roster = parseSceneRosterCharacters(trimmed).map(c => c.toLowerCase());
      const inRoster = rawTerms.some(name =>
        roster.some(r => r === name || r.includes(name) || name.includes(r))
      );
      if (inRoster) return true;
    }
  }

  // Check 2: Action lines starting with ▲ mentioning character or alias
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('▲')) {
      const lower = trimmed.toLowerCase();
      if (rawTerms.some(name => lower.includes(name))) {
        return true;
      }
    }
  }

  // Check 3: Dialogue lines spoken by this character
  for (const line of lines) {
    const speaker = extractSpeakerFromDialogueLine(line);
    if (speaker) {
      const spkLower = speaker.toLowerCase();
      if (rawTerms.some(name => spkLower === name || spkLower.includes(name) || name.includes(spkLower))) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Extracts the concrete provenance content span (full action/dialogue line or sentence)
 * surrounding a match index in scriptText, so clicking provenance highlights the actual content rather than just a bare keyword.
 */
export function extractConcreteEvidenceSpan(
  scriptText: string,
  matchGlobalIndex: number,
  explicitEvidenceText?: string
): { charIndex: number; text: string; lineText: string } {
  const clampedIdx = Math.max(0, Math.min(scriptText.length - 1, matchGlobalIndex));
  let lineStart = scriptText.lastIndexOf('\n', clampedIdx);
  lineStart = lineStart === -1 ? 0 : lineStart + 1;
  let lineEnd = scriptText.indexOf('\n', clampedIdx);
  if (lineEnd === -1) lineEnd = scriptText.length;

  const rawLine = scriptText.slice(lineStart, lineEnd);
  const leadingWs = rawLine.match(/^[\s　]+/)?.[0]?.length || 0;
  const trailingWs = rawLine.match(/[\s　]+$/)?.[0]?.length || 0;
  const trimmedStart = lineStart + leadingWs;
  const trimmedEnd = Math.max(trimmedStart, lineEnd - trailingWs);
  const trimmedLine = scriptText.slice(trimmedStart, trimmedEnd);

  if (explicitEvidenceText && explicitEvidenceText.trim().length >= 6) {
    const cleanEv = explicitEvidenceText.trim();
    const localIdx = rawLine.indexOf(cleanEv);
    if (localIdx !== -1) {
      return {
        charIndex: lineStart + localIdx,
        text: cleanEv,
        lineText: trimmedLine,
      };
    }
  }

  if (trimmedLine.length <= 120) {
    return {
      charIndex: trimmedStart,
      text: trimmedLine,
      lineText: trimmedLine,
    };
  }

  // For long multi-sentence paragraphs, extract the complete sentence containing matchGlobalIndex
  const sentenceDelims = /[。！？!?；;]/;
  let sentStart = trimmedStart;
  for (let p = clampedIdx - 1; p >= trimmedStart; p--) {
    if (sentenceDelims.test(scriptText[p])) {
      sentStart = p + 1;
      break;
    }
  }
  while (sentStart < clampedIdx && /[\s　]/.test(scriptText[sentStart])) {
    sentStart++;
  }

  let sentEnd = trimmedEnd;
  for (let p = clampedIdx; p < trimmedEnd; p++) {
    if (sentenceDelims.test(scriptText[p])) {
      sentEnd = p + 1;
      break;
    }
  }

  const sentText = scriptText.slice(sentStart, sentEnd).trim();
  if (sentText.length > 0) {
    const exactOffset = scriptText.indexOf(sentText, sentStart);
    return {
      charIndex: exactOffset !== -1 ? exactOffset : sentStart,
      text: sentText,
      lineText: trimmedLine,
    };
  }

  return {
    charIndex: trimmedStart,
    text: trimmedLine,
    lineText: trimmedLine,
  };
}

/**
 * When a provenance anchor points to a static character roster line (e.g. "人物 娜塔莉亚 布拉姆 安保若干"),
 * upgrades the highlight target to the first concrete action/narrative line in that same scene mentioning the asset.
 */
export function upgradeRosterAnchorToSceneContent(
  scriptText: string,
  secStart: number,
  secEnd: number,
  anchorGlobalIndex: number,
  matchedTerm?: string
): { charIndex: number; text: string } | null {
  let lineEnd = scriptText.indexOf('\n', anchorGlobalIndex);
  if (lineEnd === -1 || lineEnd >= secEnd) return null;

  const restSlice = scriptText.slice(lineEnd + 1, secEnd);
  const lines = restSlice.split('\n');
  const termLower = (matchedTerm || '').trim().toLowerCase();

  // Pass 1: First non-roster content line in the same scene that mentions matchedTerm
  let offsetAcc = lineEnd + 1;
  for (const raw of lines) {
    const trimmed = raw.trim();
    if (trimmed && !isCharacterRosterLine(trimmed)) {
      if (termLower && trimmed.toLowerCase().includes(termLower)) {
        // Disqualify if it's someone else speaking about the character
        const speaker = extractSpeakerFromDialogueLine(trimmed);
        if (!speaker || speaker.toLowerCase().includes(termLower) || termLower.includes(speaker.toLowerCase())) {
          const span = extractConcreteEvidenceSpan(scriptText, offsetAcc);
          return { charIndex: span.charIndex, text: span.text };
        }
      }
    }
    offsetAcc += raw.length + 1;
  }

  // Pass 2: First action line in the same scene that mentions matchedTerm or narrative action
  offsetAcc = lineEnd + 1;
  for (const raw of lines) {
    const trimmed = raw.trim();
    if (
      trimmed &&
      !isCharacterRosterLine(trimmed) &&
      trimmed.startsWith('▲')
    ) {
      if (termLower && trimmed.toLowerCase().includes(termLower)) {
        const span = extractConcreteEvidenceSpan(scriptText, offsetAcc);
        return { charIndex: span.charIndex, text: span.text };
      }
    }
    offsetAcc += raw.length + 1;
  }

  return null;
}

/**
 * Collects non-roster narrative/action sentence spans in a section that mention any of the given short entity terms.
 * Automatically skips line 0 (section header) and line 1 if it is a scene metadata header (e.g. "日 内 布拉姆房间"),
 * and strictly skips dialogue lines spoken by other characters (e.g. 焦恩: "布拉姆是...") so dialogue mentions are never
 * misattributed as character appearances.
 */
function collectNarrativeTermSpansInSection(
  scriptText: string,
  sec: ProvenanceSection,
  terms: string[]
): AssetProvenanceHighlightSpan[] {
  const validTerms = Array.from(
    new Set(
      terms
        .map(t => (typeof t === 'string' ? t.trim() : ''))
        .filter(t => t.length >= 2 && t.length <= 12 && !/[，。！？；：,.!?;:▲\n]/.test(t))
    )
  );
  if (validTerms.length === 0) return [];

  const spans: AssetProvenanceHighlightSpan[] = [];
  const seenCharIndices = new Set<number>();
  const slice = scriptText.slice(sec.charIndex, sec.endCharIndex);
  const lines = slice.split('\n');

  let offsetAcc = sec.charIndex;
  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const rawLine = lines[lineIdx];
    const trimmed = rawLine.trim();
    const lineGlobalStart = offsetAcc;
    offsetAcc += rawLine.length + 1;

    if (!trimmed) continue;
    // Skip section heading line (or episode + scene header lines)
    if (lineIdx === 0) continue;
    if (/^(?:【?\s*第?\s*[0-9一二三四五六七八九十百千]+\s*[集话回场幕]|\d+\s*[-—–]\s*\d+)/i.test(trimmed)) {
      continue;
    }
    if (lineIdx <= 2 && NEXT_LINE_SCENE_META_RX.test(trimmed)) {
      continue;
    }
    if (isCharacterRosterLine(trimmed)) continue;

    // Disqualify dialogue spoken by another character (e.g. 焦恩: "...布拉姆...")
    const speaker = extractSpeakerFromDialogueLine(rawLine);
    if (speaker) {
      const spkLower = speaker.toLowerCase();
      const isOwnDialogue = validTerms.some(
        t => spkLower === t.toLowerCase() || spkLower.includes(t.toLowerCase()) || t.toLowerCase().includes(spkLower)
      );
      if (!isOwnDialogue) {
        // Spoken by someone else, not an appearance of this character
        continue;
      }
    }

    const lowerLine = rawLine.toLowerCase();
    for (const term of validTerms) {
      const hitIdx = lowerLine.indexOf(term.toLowerCase());
      if (hitIdx !== -1) {
        const globalHit = lineGlobalStart + hitIdx;
        const span = extractConcreteEvidenceSpan(scriptText, globalHit);
        if (span.text && !seenCharIndices.has(span.charIndex)) {
          seenCharIndices.add(span.charIndex);
          const lineNumber = scriptText.slice(0, span.charIndex).split('\n').length;
          spans.push({
            charIndex: span.charIndex,
            endCharIndex: span.charIndex + span.text.length,
            text: span.text,
            lineNumber,
            sceneTitle: sec.title,
          });
        }
        break;
      }
    }
  }

  return spans;
}

/**
 * Directly resolves verbatim or near-verbatim script evidence sentences (including pronoun-based or outfit/action descriptions)
 * into VerifiedAnchorRecord items without requiring a separate keyword search round.
 */
export function buildVerifiedProvenanceFromEvidence(
  scriptText: string,
  tocItems: RawTocInput[] | undefined,
  rawInputs: ProvenanceEvidenceInput[],
  assetId: string = 'asset',
  fallbackAssetName?: string
): VerifiedAnchorRecord[] {
  if (!scriptText || !scriptText.trim() || !Array.isArray(rawInputs) || rawInputs.length === 0) {
    return [];
  }

  const sections = getFlatSearchSections(scriptText, tocItems);
  const lines = scriptText.split('\n');
  const lineStartOffsets: number[] = [];
  let charAcc = 0;
  for (const l of lines) {
    lineStartOffsets.push(charAcc);
    charAcc += l.length + 1;
  }

  const records: VerifiedAnchorRecord[] = [];
  const seenPositions = new Set<number>();

  const cleanSnippetText = (raw: string): string => {
    return raw
      .trim()
      .replace(/^(?:第?\s*\d+\s*行|L\d+)\s*[:：.\-—]\s*/i, '')
      .replace(/^[“"「『]+|[”"」』]+$/g, '')
      .trim();
  };

  for (let i = 0; i < rawInputs.length; i++) {
    const entry = rawInputs[i];
    if (!entry) continue;

    const rawText =
      typeof entry === 'string'
        ? entry
        : String(entry.evidenceText || entry.text || entry.snippet || entry.quote || '');
    const hintLineNumber =
      typeof entry === 'object' && typeof entry.lineNumber === 'number' && Number.isFinite(entry.lineNumber)
        ? Math.floor(entry.lineNumber)
        : undefined;
    const hintSceneTitle =
      typeof entry === 'object' && typeof entry.sceneTitle === 'string' && entry.sceneTitle.trim()
        ? entry.sceneTitle.trim()
        : undefined;

    const cleaned = cleanSnippetText(rawText);
    if (!cleaned && !hintLineNumber) continue;

    // Locate target section if hintSceneTitle is given
    const targetSec = hintSceneTitle
      ? sections.find(s => s.title === hintSceneTitle) ||
        sections.find(s => s.title.includes(hintSceneTitle) || hintSceneTitle.includes(s.title))
      : undefined;

    let matchStart = -1;
    let matchEnd = -1;

    const tryFindInRange = (rangeStart: number, rangeEnd: number): boolean => {
      if (!cleaned) return false;
      const slice = scriptText.slice(rangeStart, rangeEnd);

      // 1. Exact substring match
      const exactIdx = slice.indexOf(cleaned);
      if (exactIdx !== -1) {
        matchStart = rangeStart + exactIdx;
        matchEnd = matchStart + cleaned.length;
        return true;
      }

      // 2. Strip leading action marker ▲ or spaces
      const noTriangle = cleaned.replace(/^▲\s*/, '').trim();
      if (noTriangle.length >= 2) {
        const triIdx = slice.indexOf(noTriangle);
        if (triIdx !== -1) {
          matchStart = rangeStart + triIdx;
          if (matchStart > rangeStart && scriptText[matchStart - 1] === '▲') {
            matchStart -= 1;
          }
          matchEnd = rangeStart + triIdx + noTriangle.length;
          return true;
        }
      }

      // 3. Clause-based tolerant match (handles elided "..." or minor punctuation differences)
      const clauses = noTriangle
        .split(/[，。！？；…—,\.!?;:\s]+/)
        .map(c => c.trim())
        .filter(c => c.length >= 3);
      if (clauses.length > 0) {
        const firstClause = clauses[0];
        let searchFrom = 0;
        while (searchFrom < slice.length) {
          const cIdx = slice.indexOf(firstClause, searchFrom);
          if (cIdx === -1) break;
          const globalHit = rangeStart + cIdx;
          const span = extractConcreteEvidenceSpan(scriptText, globalHit);
          const allMatched = clauses.slice(1).every(cl => span.lineText.includes(cl));
          if (allMatched) {
            matchStart = span.charIndex;
            matchEnd = span.charIndex + span.text.length;
            return true;
          }
          searchFrom = cIdx + firstClause.length;
        }
      }

      return false;
    };

    // Priority 1: Search near hintLineNumber (±4 lines)
    if (hintLineNumber && hintLineNumber >= 1 && hintLineNumber <= lines.length) {
      const startL = Math.max(0, hintLineNumber - 4);
      const endL = Math.min(lines.length - 1, hintLineNumber + 2);
      const rangeStart = lineStartOffsets[startL];
      const rangeEnd = lineStartOffsets[endL] + lines[endL].length;
      tryFindInRange(rangeStart, rangeEnd);
    }

    // Priority 2: Search within targetSec
    if (matchStart === -1 && targetSec) {
      tryFindInRange(targetSec.charIndex, targetSec.endCharIndex);
    }

    // Priority 3: Search full script
    if (matchStart === -1 && cleaned) {
      tryFindInRange(0, scriptText.length);
    }

    // Priority 4: Fallback to hintLineNumber concrete line if valid
    if (matchStart === -1 && hintLineNumber && hintLineNumber >= 1 && hintLineNumber <= lines.length) {
      const lineOffset = lineStartOffsets[hintLineNumber - 1];
      const span = extractConcreteEvidenceSpan(scriptText, lineOffset);
      if (span.text.length > 0) {
        matchStart = span.charIndex;
        matchEnd = span.charIndex + span.text.length;
      }
    }

    if (matchStart === -1 || matchEnd <= matchStart) continue;

    const ownerSec =
      sections.find(s => matchStart >= s.charIndex && matchStart < s.endCharIndex) ||
      targetSec ||
      sections[0];

    // Check if the matched line is a static character roster line; if so, upgrade to concrete scene content
    const initialSpan = extractConcreteEvidenceSpan(scriptText, matchStart);
    if (isCharacterRosterLine(initialSpan.lineText) && ownerSec) {
      const upgraded = upgradeRosterAnchorToSceneContent(
        scriptText,
        ownerSec.charIndex,
        ownerSec.endCharIndex,
        matchStart,
        fallbackAssetName
      );
      if (upgraded) {
        matchStart = upgraded.charIndex;
        matchEnd = upgraded.charIndex + upgraded.text.length;
      }
    } else if (matchEnd - matchStart < 6) {
      // Expand ultra-short keyword matches to the concrete evidence span on that line
      matchStart = initialSpan.charIndex;
      matchEnd = initialSpan.charIndex + initialSpan.text.length;
    }

    if (seenPositions.has(matchStart)) continue;
    seenPositions.add(matchStart);

    const exactEvidence = scriptText.slice(matchStart, matchEnd);
    const lineNum = scriptText.slice(0, matchStart).split('\n').length;
    const secStart = ownerSec ? ownerSec.charIndex : 0;
    const secEnd = ownerSec ? ownerSec.endCharIndex : scriptText.length;

    const anchorStart = Math.max(secStart, matchStart - 14);
    const anchorEnd = Math.min(secEnd, matchEnd + 14);
    const anchorText = scriptText.slice(anchorStart, anchorEnd);
    const offsetInAnchor = matchStart - anchorStart;

    records.push({
      id: `vp_${assetId}_ev_${i}_${matchStart}`,
      sceneId: ownerSec?.id,
      sceneTitle: ownerSec ? ownerSec.title : (hintSceneTitle || '正文'),
      matchedTerm: exactEvidence,
      evidenceText: exactEvidence,
      anchorText,
      offsetInAnchor,
      fallbackCharIndex: matchStart,
      lineNumber: lineNum,
    });
  }

  return records;
}

/**
 * Searches full script text for all occurrences of assetName and its aliases,
 * returning context snippets (±80 chars), concrete evidence spans, and fingerprint anchors for LLM verification.
 * Longest terms are matched first so "纯金钥匙" is not double-matched as "钥匙".
 */
export function searchProvenanceCandidates(
  scriptText: string,
  tocItems: RawTocInput[] | undefined,
  assetName: string,
  aliases: string[] = [],
  scopeSceneTitles?: string[]
): ProvenanceCandidateItem[] {
  if (!scriptText || !scriptText.trim()) return [];
  const rawTerms = [assetName, ...(Array.isArray(aliases) ? aliases : [])]
    .map(t => (typeof t === 'string' ? t.trim() : ''))
    .filter(Boolean);
  const uniqueTerms = Array.from(new Set(rawTerms)).sort((a, b) => b.length - a.length);
  if (uniqueTerms.length === 0) return [];

  const sections = getFlatSearchSections(scriptText, tocItems);
  const scopeSet = Array.isArray(scopeSceneTitles) && scopeSceneTitles.length > 0
    ? new Set(scopeSceneTitles.map(s => s.trim().toLowerCase()))
    : null;

  const candidates: ProvenanceCandidateItem[] = [];

  for (const sec of sections) {
    if (scopeSet && !scopeSet.has(sec.title.toLowerCase())) {
      continue;
    }

    const slice = scriptText.slice(sec.charIndex, sec.endCharIndex);
    const sliceLower = slice.toLowerCase();
    const occupiedRanges: Array<[number, number]> = [];

    const rawHits: Array<{ localPos: number; term: string }> = [];

    for (const term of uniqueTerms) {
      const termLower = term.toLowerCase();
      let pos = 0;
      while ((pos = sliceLower.indexOf(termLower, pos)) !== -1) {
        const endPos = pos + term.length;
        const overlaps = occupiedRanges.some(([s, e]) => pos < e && endPos > s);
        if (!overlaps) {
          occupiedRanges.push([pos, endPos]);
          rawHits.push({
            localPos: pos,
            term: slice.slice(pos, endPos),
          });
        }
        pos = endPos;
      }
    }

    rawHits.sort((a, b) => a.localPos - b.localPos);

    // Coalesce same-line hits (on the exact same natural line)
    // keeping the longest/most specific matched term so one line never emits duplicate candidates.
    const deduplicatedHits: Array<{
      localPos: number;
      term: string;
      lineNum: number;
      globalPos: number;
      evidenceText: string;
      isRosterLine: boolean;
    }> = [];
    for (const hit of rawHits) {
      const globalPos = sec.charIndex + hit.localPos;
      const lineNum = scriptText.slice(0, globalPos).split('\n').length;
      const evidenceSpan = extractConcreteEvidenceSpan(scriptText, globalPos);
      const rosterFlag = isCharacterRosterLine(evidenceSpan.lineText);

      const prev = deduplicatedHits[deduplicatedHits.length - 1];
      if (prev && prev.lineNum === lineNum) {
        if (hit.term.length > prev.term.length) {
          deduplicatedHits[deduplicatedHits.length - 1] = {
            localPos: hit.localPos,
            term: hit.term,
            lineNum,
            globalPos,
            evidenceText: evidenceSpan.text,
            isRosterLine: rosterFlag,
          };
        }
        continue;
      }
      deduplicatedHits.push({
        localPos: hit.localPos,
        term: hit.term,
        lineNum,
        globalPos,
        evidenceText: evidenceSpan.text,
        isRosterLine: rosterFlag,
      });
    }

    // If the scene has concrete narrative/action hits (!isRosterLine), filter out static "人物 ..." roster header hits
    const hasNarrativeHits = deduplicatedHits.some(h => !h.isRosterLine);
    const effectiveHits = hasNarrativeHits
      ? deduplicatedHits.filter(h => !h.isRosterLine)
      : deduplicatedHits;

    for (const hit of effectiveHits) {
      const { globalPos, lineNum, evidenceText, isRosterLine } = hit;

      // Context snippet (±80 chars around the hit inside the section or script)
      const ctxStart = Math.max(sec.charIndex, globalPos - 80);
      const ctxEnd = Math.min(sec.endCharIndex, globalPos + hit.term.length + 80);
      const beforeCtx = scriptText.slice(ctxStart, globalPos).replace(/\r?\n/g, ' ');
      const afterCtx = scriptText.slice(globalPos + hit.term.length, ctxEnd).replace(/\r?\n/g, ' ');
      const contextSnippet = `${ctxStart > sec.charIndex ? '…' : ''}${beforeCtx}【${hit.term}】${afterCtx}${ctxEnd < sec.endCharIndex ? '…' : ''}`;

      // Fingerprint anchor (14 chars before + term + 14 chars after, staying on same/adjacent lines)
      const anchorStart = Math.max(sec.charIndex, globalPos - 14);
      const anchorEnd = Math.min(sec.endCharIndex, globalPos + hit.term.length + 14);
      const anchorText = scriptText.slice(anchorStart, anchorEnd);
      const offsetInAnchor = globalPos - anchorStart;

      candidates.push({
        candidateId: `cand_L${lineNum}_${globalPos}`,
        sceneId: sec.id,
        sceneTitle: sec.title,
        lineNumber: lineNum,
        charIndex: globalPos,
        matchedTerm: hit.term,
        evidenceText,
        isRosterLine,
        contextSnippet,
        anchorText,
        offsetInAnchor,
      });
    }
  }

  return candidates;
}

interface ResolvedInternalAnchor {
  id: string;
  anchor: VerifiedAnchorRecord;
  matchGlobalIndex: number;
  highlightCharIndex: number;
  highlightText: string;
  lineNumber: number;
  priority: number;
  ownerSec?: ProvenanceSection;
}

function mergeAndDeduplicateHighlightSpans(
  spans: AssetProvenanceHighlightSpan[]
): AssetProvenanceHighlightSpan[] {
  const sorted = [...spans].sort((a, b) => a.charIndex - b.charIndex || b.endCharIndex - a.endCharIndex);
  const result: AssetProvenanceHighlightSpan[] = [];
  for (const sp of sorted) {
    if (!sp.text || sp.endCharIndex <= sp.charIndex) continue;
    const prev = result[result.length - 1];
    if (prev && sp.charIndex >= prev.charIndex && sp.endCharIndex <= prev.endCharIndex) {
      continue;
    }
    if (prev && sp.charIndex === prev.charIndex && sp.endCharIndex > prev.endCharIndex) {
      result[result.length - 1] = sp;
      continue;
    }
    result.push(sp);
  }
  return result;
}

/**
 * Resolves model-verified provenance anchors against live scriptText in 0ms.
 * Supports episode-scene hierarchy folding:
 * - If an asset has verified occurrences in ALL scenes of an episode, folds into the episode (e.g. "二十二集")
 *   and aggregates all highlight spans across those scenes into `highlights`.
 * - If an asset only appears in specific scenes of an episode, emits those specific scenes (e.g. "22-1").
 */
export function resolveVerifiedProvenance(
  scriptText: string,
  tocItems: RawTocInput[] | undefined,
  verifiedProvenance: VerifiedAnchorRecord[] | undefined,
  options?: { assetName?: string; expandEpisodeScenes?: boolean }
): AssetProvenanceItem[] {
  if (!scriptText || !Array.isArray(verifiedProvenance) || verifiedProvenance.length === 0) {
    return [];
  }

  const sections = getFlatSearchSections(scriptText, tocItems);
  const groups = groupSectionsByEpisode(scriptText, tocItems);
  const resolvedAnchors: ResolvedInternalAnchor[] = [];

  for (let i = 0; i < verifiedProvenance.length; i++) {
    const anchor = verifiedProvenance[i];
    if (!anchor) continue;

    // 1. Find matching section by sceneId or sceneTitle
    const targetSec =
      sections.find(
        s => (anchor.sceneId && s.id === anchor.sceneId) || s.title === anchor.sceneTitle
      ) ||
      sections.find(
        s => s.title.includes(anchor.sceneTitle) || anchor.sceneTitle.includes(s.title)
      );

    let matchGlobalIndex = -1;

    if (targetSec && anchor.anchorText) {
      const secSlice = scriptText.slice(targetSec.charIndex, targetSec.endCharIndex);
      const anchorIdx = secSlice.indexOf(anchor.anchorText);
      if (anchorIdx !== -1) {
        matchGlobalIndex = targetSec.charIndex + anchorIdx + (anchor.offsetInAnchor || 0);
      } else if (anchor.evidenceText) {
        const evIdx = secSlice.indexOf(anchor.evidenceText);
        if (evIdx !== -1) {
          matchGlobalIndex = targetSec.charIndex + evIdx;
        }
      } else if (anchor.matchedTerm) {
        const termIdx = secSlice.toLowerCase().indexOf(anchor.matchedTerm.toLowerCase());
        if (termIdx !== -1) {
          matchGlobalIndex = targetSec.charIndex + termIdx;
        }
      }
    }

    // 2. Fallback: search full script for anchorText or evidenceText
    if (matchGlobalIndex === -1 && anchor.anchorText) {
      const globalAnchorIdx = scriptText.indexOf(anchor.anchorText);
      if (globalAnchorIdx !== -1) {
        matchGlobalIndex = globalAnchorIdx + (anchor.offsetInAnchor || 0);
      }
    }
    if (matchGlobalIndex === -1 && anchor.evidenceText) {
      const globalEvIdx = scriptText.indexOf(anchor.evidenceText);
      if (globalEvIdx !== -1) {
        matchGlobalIndex = globalEvIdx;
      }
    }

    if (matchGlobalIndex === -1) {
      continue;
    }

    const ownerSec =
      sections.find(s => matchGlobalIndex >= s.charIndex && matchGlobalIndex < s.endCharIndex) ||
      targetSec;

    const spanInfo = extractConcreteEvidenceSpan(scriptText, matchGlobalIndex, anchor.evidenceText);
    const isRoster = isCharacterRosterLine(spanInfo.lineText);
    const isActionLine = spanInfo.lineText.startsWith('▲');
    const priority = isRoster
      ? 0
      : (anchor.evidenceText && anchor.evidenceText.length >= 6) || isActionLine
        ? 3
        : 2;

    let highlightCharIndex = spanInfo.charIndex;
    let highlightText = spanInfo.text;

    if (isRoster && ownerSec) {
      const upgraded = upgradeRosterAnchorToSceneContent(
        scriptText,
        ownerSec.charIndex,
        ownerSec.endCharIndex,
        matchGlobalIndex,
        anchor.matchedTerm
      );
      if (upgraded) {
        highlightCharIndex = upgraded.charIndex;
        highlightText = upgraded.text;
      }
    }

    const lineNumber = scriptText.slice(0, highlightCharIndex).split('\n').length;
    resolvedAnchors.push({
      id: anchor.id || `vp_${i}_${matchGlobalIndex}`,
      anchor,
      matchGlobalIndex,
      highlightCharIndex,
      highlightText,
      lineNumber,
      priority,
      ownerSec,
    });
  }

  if (resolvedAnchors.length === 0) return [];

  const baseAssetName = options?.assetName
    ? options.assetName.replace(/（.*?）|\(.*?\)/g, '').trim()
    : '';

  if (groups.length === 0) {
    // Fallback if no structured groups
    const spans = mergeAndDeduplicateHighlightSpans(
      resolvedAnchors.map(r => ({
        charIndex: r.highlightCharIndex,
        endCharIndex: r.highlightCharIndex + r.highlightText.length,
        text: r.highlightText,
        lineNumber: r.lineNumber,
        sceneTitle: r.anchor.sceneTitle,
      }))
    );
    const primary = [...resolvedAnchors].sort((a, b) => b.priority - a.priority || a.matchGlobalIndex - b.matchGlobalIndex)[0];
    return [
      {
        id: primary.id,
        type: 'scene',
        title: primary.anchor.sceneTitle || '正文',
        displayLabel: primary.anchor.sceneTitle || '正文',
        isFullEpisode: false,
        charIndex: primary.matchGlobalIndex,
        firstMatchCharIndex: primary.matchGlobalIndex,
        matchedTerm: primary.anchor.matchedTerm,
        highlightCharIndex: primary.highlightCharIndex,
        highlightText: primary.highlightText,
        highlights: spans,
        lineNumber: primary.lineNumber,
      },
    ];
  }

  const results: AssetProvenanceItem[] = [];

  for (const group of groups) {
    const groupStart = group.episode
      ? group.episode.charIndex
      : group.scenes[0]?.charIndex ?? 0;
    const groupEnd =
      group.scenes.length > 0
        ? group.scenes[group.scenes.length - 1].endCharIndex
        : group.episode?.endCharIndex ?? scriptText.length;

    const groupAnchors = resolvedAnchors.filter(
      r => r.matchGlobalIndex >= groupStart && r.matchGlobalIndex < groupEnd
    );
    if (groupAnchors.length === 0) continue;

    // Collect concise search terms from anchors in this group + baseAssetName
    const conciseTerms = Array.from(
      new Set(
        [
          baseAssetName,
          ...groupAnchors
            .map(a => (a.anchor.matchedTerm || '').trim())
            .filter(t => t.length >= 2 && t.length <= 12 && !/[，。！？；：,.!?;:▲\n]/.test(t)),
        ].filter(Boolean)
      )
    );

    const isVersionSpecific = Boolean(
      options?.assetName && /[（(].+[）)]$/.test(options.assetName.trim())
    );

    const shouldScanEpisodeScenes = options?.expandEpisodeScenes === true;

    if (group.scenes.length > 0) {
      const matchedSceneEntries: Array<{
        scene: ProvenanceSection;
        anchors: ResolvedInternalAnchor[];
        spans: AssetProvenanceHighlightSpan[];
      }> = [];

      for (const scene of group.scenes) {
        const sceneAnchors = groupAnchors.filter(
          r => r.matchGlobalIndex >= scene.charIndex && r.matchGlobalIndex < scene.endCharIndex
        );

        let narrativeSpans: AssetProvenanceHighlightSpan[] = [];
        if (sceneAnchors.length === 0 && shouldScanEpisodeScenes) {
          const isPresent = baseAssetName
            ? isCharacterPresentInScene(scriptText, scene, baseAssetName, conciseTerms)
            : false;
          if (isPresent) {
            narrativeSpans = collectNarrativeTermSpansInSection(scriptText, scene, conciseTerms);
          }
        }

        if (sceneAnchors.length > 0 || narrativeSpans.length > 0) {
          const explicitSpans: AssetProvenanceHighlightSpan[] = sceneAnchors.map(r => ({
            charIndex: r.highlightCharIndex,
            endCharIndex: r.highlightCharIndex + r.highlightText.length,
            text: r.highlightText,
            lineNumber: r.lineNumber,
            sceneTitle: scene.title,
          }));
          const mergedSpans = mergeAndDeduplicateHighlightSpans([
            ...explicitSpans,
            ...narrativeSpans,
          ]);
          matchedSceneEntries.push({
            scene,
            anchors: sceneAnchors,
            spans: mergedSpans,
          });
        }
      }

      const isAllScenesMatched =
        group.episode !== null &&
        group.scenes.length >= 1 &&
        matchedSceneEntries.length === group.scenes.length;

      if (isAllScenesMatched && group.episode) {
        const allEpisodeSpans = mergeAndDeduplicateHighlightSpans(
          matchedSceneEntries.flatMap(m => m.spans)
        );
        const sortedGroupAnchors = [...groupAnchors].sort(
          (a, b) => b.priority - a.priority || a.matchGlobalIndex - b.matchGlobalIndex
        );
        const primaryAnchor = sortedGroupAnchors[0];
        const firstSpan = allEpisodeSpans[0];

        results.push({
          id: primaryAnchor?.id || `prov-ep-${group.episode.id}`,
          type: 'episode',
          title: group.episode.title,
          displayLabel: formatEpisodeDisplayLabel(group.episode.title),
          isFullEpisode: true,
          charIndex: group.episode.charIndex,
          firstMatchCharIndex: primaryAnchor ? primaryAnchor.matchGlobalIndex : (firstSpan?.charIndex ?? group.episode.charIndex),
          matchedTerm: primaryAnchor?.anchor.matchedTerm,
          highlightCharIndex: primaryAnchor ? primaryAnchor.highlightCharIndex : firstSpan?.charIndex,
          highlightText: primaryAnchor ? primaryAnchor.highlightText : firstSpan?.text,
          highlights: allEpisodeSpans,
          lineNumber: primaryAnchor ? primaryAnchor.lineNumber : (firstSpan?.lineNumber ?? group.episode.lineNumber),
          sceneCount: group.scenes.length,
          matchedSceneCount: matchedSceneEntries.length,
        });
      } else {
        for (const entry of matchedSceneEntries) {
          const sortedSceneAnchors = [...entry.anchors].sort(
            (a, b) => b.priority - a.priority || a.matchGlobalIndex - b.matchGlobalIndex
          );
          const primaryAnchor = sortedSceneAnchors[0];
          const firstSpan = entry.spans[0];
          const fullSceneTitle =
            group.episode && !entry.scene.title.includes(group.episode.title)
              ? `${group.episode.title} ${entry.scene.title}`.trim()
              : entry.scene.title;

          results.push({
            id: primaryAnchor?.id || `prov-sc-${entry.scene.id}`,
            type: 'scene',
            title: fullSceneTitle,
            displayLabel: formatSceneDisplayLabel(entry.scene.title, group.episode?.title),
            isFullEpisode: false,
            charIndex: entry.scene.charIndex,
            firstMatchCharIndex: primaryAnchor ? primaryAnchor.matchGlobalIndex : (firstSpan?.charIndex ?? entry.scene.charIndex),
            matchedTerm: primaryAnchor?.anchor.matchedTerm,
            highlightCharIndex: primaryAnchor ? primaryAnchor.highlightCharIndex : firstSpan?.charIndex,
            highlightText: primaryAnchor ? primaryAnchor.highlightText : firstSpan?.text,
            highlights: entry.spans,
            lineNumber: primaryAnchor ? primaryAnchor.lineNumber : (firstSpan?.lineNumber ?? entry.scene.lineNumber),
          });
        }
      }
    } else if (group.episode) {
      const explicitSpans: AssetProvenanceHighlightSpan[] = groupAnchors.map(r => ({
        charIndex: r.highlightCharIndex,
        endCharIndex: r.highlightCharIndex + r.highlightText.length,
        text: r.highlightText,
        lineNumber: r.lineNumber,
        sceneTitle: group.episode!.title,
      }));
      const mergedSpans = mergeAndDeduplicateHighlightSpans(explicitSpans);
      const sortedGroupAnchors = [...groupAnchors].sort(
        (a, b) => b.priority - a.priority || a.matchGlobalIndex - b.matchGlobalIndex
      );
      const primaryAnchor = sortedGroupAnchors[0];

      results.push({
        id: primaryAnchor.id,
        type: 'episode',
        title: group.episode.title,
        displayLabel: formatEpisodeDisplayLabel(group.episode.title),
        isFullEpisode: true,
        charIndex: group.episode.charIndex,
        firstMatchCharIndex: primaryAnchor.matchGlobalIndex,
        matchedTerm: primaryAnchor.anchor.matchedTerm,
        highlightCharIndex: primaryAnchor.highlightCharIndex,
        highlightText: primaryAnchor.highlightText,
        highlights: mergedSpans,
        lineNumber: primaryAnchor.lineNumber,
        sceneCount: 0,
        matchedSceneCount: 0,
      });
    }
  }

  return results;
}

/**
 * Calculates asset provenance entries based on episode/scene occurrence rules:
 * 1. If an asset appears in ALL scenes of an episode (or the single scene), folds up into that episode as "第X集 (全集)".
 * 2. If an asset appears in some (but not all) scenes, lists those specific scenes individually.
 */
export function calculateAssetProvenance(
  scriptText: string,
  tocItems: RawTocInput[] | undefined,
  assetName: string
): AssetProvenanceItem[] {
  if (!scriptText || !assetName || !assetName.trim()) {
    return [];
  }

  const target = assetName.trim();
  const targetLower = target.toLowerCase();
  const groups = groupSectionsByEpisode(scriptText, tocItems);

  // If no structured groups (e.g. raw text script without scenes or episodes)
  if (groups.length === 0) {
    const results: AssetProvenanceItem[] = [];
    const sourceLower = scriptText.toLowerCase();
    let pos = 0;
    let matchIdx = 0;
    while ((pos = sourceLower.indexOf(targetLower, pos)) !== -1) {
      const lineNum = scriptText.slice(0, pos).split('\n').length;
      const span = extractConcreteEvidenceSpan(scriptText, pos);
      results.push({
        id: `prov-raw-${pos}`,
        type: 'scene',
        title: `正文 (第${lineNum}行)`,
        displayLabel: `第 ${lineNum} 行`,
        charIndex: pos,
        firstMatchCharIndex: pos,
        matchedTerm: target,
        highlightCharIndex: span.charIndex,
        highlightText: span.text,
        highlights: [
          {
            charIndex: span.charIndex,
            endCharIndex: span.charIndex + span.text.length,
            text: span.text,
            lineNumber: lineNum,
          },
        ],
        lineNumber: lineNum,
      });
      matchIdx++;
      if (matchIdx >= 20) break; // limit un-structured fallback
      pos += target.length;
    }
    return results;
  }

  const results: AssetProvenanceItem[] = [];

  for (const group of groups) {
    if (group.scenes.length > 0) {
      const matchedScenes: Array<{
        scene: ProvenanceSection;
        firstMatchCharIndex: number;
        spans: AssetProvenanceHighlightSpan[];
      }> = [];

      for (const scene of group.scenes) {
        const sceneSlice = scriptText.slice(scene.charIndex, scene.endCharIndex);
        const matchPos = sceneSlice.toLowerCase().indexOf(targetLower);
        if (matchPos !== -1) {
          const isPresent = isCharacterPresentInScene(scriptText, scene, target);
          if (isPresent) {
            const spans = collectNarrativeTermSpansInSection(scriptText, scene, [target]);
            if (spans.length > 0) {
              matchedScenes.push({
                scene,
                firstMatchCharIndex: spans[0].charIndex,
                spans,
              });
            }
          }
        }
      }

      // Check all-scenes-in-episode condition OR single-scene episode condition
      const isAllScenesMatched =
        group.episode !== null &&
        group.scenes.length >= 1 &&
        matchedScenes.length === group.scenes.length;

      if (isAllScenesMatched && group.episode) {
        const allSpans = mergeAndDeduplicateHighlightSpans(matchedScenes.flatMap(m => m.spans));
        // Fold into Episode entry
        results.push({
          id: `prov-ep-${group.episode.id}`,
          type: 'episode',
          title: group.episode.title,
          displayLabel: formatEpisodeDisplayLabel(group.episode.title),
          isFullEpisode: true,
          charIndex: group.episode.charIndex,
          firstMatchCharIndex: matchedScenes[0]?.firstMatchCharIndex ?? group.episode.charIndex,
          matchedTerm: target,
          highlightCharIndex: allSpans[0]?.charIndex,
          highlightText: allSpans[0]?.text,
          highlights: allSpans,
          lineNumber: group.episode.lineNumber,
          sceneCount: group.scenes.length,
          matchedSceneCount: matchedScenes.length,
        });
      } else {
        // Emit individual matching scenes
        for (const m of matchedScenes) {
          results.push({
            id: `prov-sc-${m.scene.id}`,
            type: 'scene',
            title: m.scene.title,
            displayLabel: formatSceneDisplayLabel(m.scene.title, group.episode?.title),
            isFullEpisode: false,
            charIndex: m.scene.charIndex,
            firstMatchCharIndex: m.firstMatchCharIndex,
            matchedTerm: target,
            highlightCharIndex: m.spans[0]?.charIndex,
            highlightText: m.spans[0]?.text,
            highlights: m.spans,
            lineNumber: m.scene.lineNumber,
          });
        }
      }
    } else if (group.episode) {
      // Episode without explicit sub-scenes: check entire episode slice
      const epSlice = scriptText.slice(group.episode.charIndex, group.episode.endCharIndex);
      const matchPos = epSlice.toLowerCase().indexOf(targetLower);
      if (matchPos !== -1) {
        const spans = collectNarrativeTermSpansInSection(scriptText, group.episode, [target]);
        results.push({
          id: `prov-ep-${group.episode.id}`,
          type: 'episode',
          title: group.episode.title,
          displayLabel: formatEpisodeDisplayLabel(group.episode.title),
          isFullEpisode: true,
          charIndex: group.episode.charIndex,
          firstMatchCharIndex: group.episode.charIndex + matchPos,
          matchedTerm: target,
          highlightCharIndex: spans[0]?.charIndex,
          highlightText: spans[0]?.text,
          highlights: spans,
          lineNumber: group.episode.lineNumber,
          sceneCount: 0,
          matchedSceneCount: 0,
        });
      }
    }
  }

  return results;
}

function formatEpisodeDisplayLabel(title: string): string {
  const m = title.match(/第?\s*([0-9一二三四五六七八九十百千]+)\s*集/i);
  if (m) {
    return `${m[1]}集`;
  }
  if (!title.includes('集') && !title.includes('第')) {
    return title;
  }
  const cleaned = title.replace(/^第/, '').trim();
  const spaceIdx = cleaned.indexOf(' ');
  return spaceIdx > 0 ? cleaned.slice(0, spaceIdx) : cleaned;
}

function formatSceneDisplayLabel(title: string, episodeTitle?: string): string {
  let cleaned = title.trim();
  if (episodeTitle && cleaned.startsWith(episodeTitle)) {
    cleaned = cleaned.slice(episodeTitle.length).trim();
  }
  const dashMatch = cleaned.match(/^(\d+)\s*[-—–]\s*(\d+)/);
  if (dashMatch) {
    return `${dashMatch[1]}-${dashMatch[2]}`;
  }
  return cleaned || title;
}
