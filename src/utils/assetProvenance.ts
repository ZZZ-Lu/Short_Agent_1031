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

/**
 * Parses script lines into episodes and scenes if structured TOC is not provided
 */
export function extractSectionsFromScript(scriptText: string): ProvenanceSection[] {
  if (!scriptText || !scriptText.trim()) return [];
  const lines = scriptText.split('\n');
  const sections: Array<Omit<ProvenanceSection, 'endCharIndex'>> = [];
  let charAcc = 0;

  const episodeRx = /^(?:【\s*第?\s*[0-9一二三四五六七八九十百千]+\s*[集话回][^】]*】|第\s*[0-9一二三四五六七八九十百千]+\s*[集话回]|(?:EPISODE|EP)\s*#?\s*\d+)/i;
  const sceneRx = /^(?:【\s*(?:场|场景|场次)?\s*[0-9一二三四五六七八九十百千]+[^】]*】|第\s*[0-9一二三四五六七八九十百千]+\s*[场幕]|(?:SCENE)\s*#?\s*\d+|[0-9]+[.\-、]\s*(?:内景|外景|内|外)|(?:内景|外景|INT\.|EXT\.)\s+)/i;

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed) {
      if (episodeRx.test(trimmed)) {
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
        const bracket = trimmed.match(/^【(.+?)】/);
        if (bracket) title = bracket[1];
        sections.push({
          id: `sc-${index}-${charAcc}`,
          type: 'scene',
          title,
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
 * Aggregates script sections into Episode groups with their child scenes
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

  // If tocItems had no episodes or scenes, fall back to script line scanning
  const hasEpisodesOrScenes = sections.some(s => s.type === 'episode' || s.type === 'scene');
  if (!hasEpisodesOrScenes) {
    sections = extractSectionsFromScript(scriptText);
  }

  if (sections.length === 0) {
    return [];
  }

  const groups: ProvenanceEpisodeGroup[] = [];
  let currentGroup: ProvenanceEpisodeGroup | null = null;

  for (const sec of sections) {
    const isEpisode = sec.type === 'episode' || (/集|EPISODE|EP\b/i.test(sec.title) && !/^\d+[-—]\d+/.test(sec.title));
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
 * upgrades the highlight target to the first concrete action/narrative line in that same scene.
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
        const span = extractConcreteEvidenceSpan(scriptText, offsetAcc);
        return { charIndex: span.charIndex, text: span.text };
      }
    }
    offsetAcc += raw.length + 1;
  }

  // Pass 2: First action description line (starting with ▲) or narrative line in the same scene
  offsetAcc = lineEnd + 1;
  for (const raw of lines) {
    const trimmed = raw.trim();
    if (
      trimmed &&
      !isCharacterRosterLine(trimmed) &&
      !/^(?:\d+\s*[-—]\s*\d+|(?:日|夜|晨|昏|内|外|内景|外景)(?:[\s/·]+(?:日|夜|晨|昏|内|外|内景|外景))*)\b/.test(trimmed)
    ) {
      const span = extractConcreteEvidenceSpan(scriptText, offsetAcc);
      return { charIndex: span.charIndex, text: span.text };
    }
    offsetAcc += raw.length + 1;
  }

  return null;
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

/**
 * Resolves model-verified provenance anchors against live scriptText in 0ms.
 * Uses anchorText + offsetInAnchor so edits in earlier episodes never shift or break highlights,
 * and computes concrete highlightCharIndex + highlightText so clicking a provenance badge highlights
 * the actual provenance content sentence rather than a bare name in a character roster.
 */
export function resolveVerifiedProvenance(
  scriptText: string,
  tocItems: RawTocInput[] | undefined,
  verifiedProvenance: VerifiedAnchorRecord[] | undefined
): AssetProvenanceItem[] {
  if (!scriptText || !Array.isArray(verifiedProvenance) || verifiedProvenance.length === 0) {
    return [];
  }

  const sections = getFlatSearchSections(scriptText, tocItems);
  const resolved: AssetProvenanceItem[] = [];
  const sceneIndexMap = new Map<string, { arrayIdx: number; priority: number }>();

  for (let i = 0; i < verifiedProvenance.length; i++) {
    const anchor = verifiedProvenance[i];
    if (!anchor) continue;

    // 1. Find matching section by sceneId or sceneTitle
    const targetSec = sections.find(
      s => (anchor.sceneId && s.id === anchor.sceneId) || s.title === anchor.sceneTitle
    ) || sections.find(
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

    // Find which section owns this matchGlobalIndex
    const ownerSec = sections.find(
      s => matchGlobalIndex >= s.charIndex && matchGlobalIndex < s.endCharIndex
    ) || targetSec;

    const spanInfo = extractConcreteEvidenceSpan(scriptText, matchGlobalIndex, anchor.evidenceText);
    const isRoster = isCharacterRosterLine(spanInfo.lineText);
    const isActionLine = spanInfo.lineText.startsWith('▲');
    const priority = isRoster ? 0 : (anchor.evidenceText && anchor.evidenceText.length >= 6) || isActionLine ? 3 : 2;

    let highlightCharIndex = spanInfo.charIndex;
    let highlightText = spanInfo.text;

    // If this anchor is on a static "人物 ..." roster line, upgrade its highlight to the first real action/content line in the scene
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

    const sceneKey = ownerSec ? ownerSec.id : `${anchor.sceneTitle}_${matchGlobalIndex}`;
    const lineNumber = scriptText.slice(0, highlightCharIndex).split('\n').length;
    const title = ownerSec ? ownerSec.title : anchor.sceneTitle;
    const isEp = ownerSec ? (ownerSec.type === 'episode' || /集|EPISODE|EP\b/i.test(title)) : /集/i.test(title);

    const item: AssetProvenanceItem = {
      id: anchor.id || `vp_${i}_${matchGlobalIndex}`,
      type: isEp ? 'episode' : 'scene',
      title,
      displayLabel: isEp ? formatEpisodeDisplayLabel(title) : title,
      isFullEpisode: isEp,
      charIndex: ownerSec ? ownerSec.charIndex : matchGlobalIndex,
      firstMatchCharIndex: matchGlobalIndex,
      matchedTerm: anchor.matchedTerm,
      highlightCharIndex,
      highlightText,
      lineNumber,
    };

    const existingSceneEntry = sceneIndexMap.get(sceneKey);
    if (existingSceneEntry !== undefined) {
      // Replace existing scene entry if the earlier one was a roster line (priority 0) or lower priority
      if (priority > existingSceneEntry.priority) {
        resolved[existingSceneEntry.arrayIdx] = item;
        sceneIndexMap.set(sceneKey, { arrayIdx: existingSceneEntry.arrayIdx, priority });
      }
      continue;
    }

    sceneIndexMap.set(sceneKey, { arrayIdx: resolved.length, priority });
    resolved.push(item);
  }

  return resolved;
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
      results.push({
        id: `prov-raw-${pos}`,
        type: 'scene',
        title: `正文 (第${lineNum}行)`,
        displayLabel: `第 ${lineNum} 行`,
        charIndex: pos,
        firstMatchCharIndex: pos,
        matchedTerm: target,
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
      }> = [];

      for (const scene of group.scenes) {
        const sceneSlice = scriptText.slice(scene.charIndex, scene.endCharIndex);
        const matchPos = sceneSlice.toLowerCase().indexOf(targetLower);
        if (matchPos !== -1) {
          matchedScenes.push({
            scene,
            firstMatchCharIndex: scene.charIndex + matchPos,
          });
        }
      }

      // Check all-scenes-in-episode condition OR single-scene episode condition
      const isAllScenesMatched =
        group.episode !== null &&
        group.scenes.length >= 1 &&
        matchedScenes.length === group.scenes.length;

      if (isAllScenesMatched && group.episode) {
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
            displayLabel: m.scene.title,
            isFullEpisode: false,
            charIndex: m.scene.charIndex,
            firstMatchCharIndex: m.firstMatchCharIndex,
            matchedTerm: target,
            lineNumber: m.scene.lineNumber,
          });
        }
      }
    } else if (group.episode) {
      // Episode without explicit sub-scenes: check entire episode slice
      const epSlice = scriptText.slice(group.episode.charIndex, group.episode.endCharIndex);
      const matchPos = epSlice.toLowerCase().indexOf(targetLower);
      if (matchPos !== -1) {
        results.push({
          id: `prov-ep-${group.episode.id}`,
          type: 'episode',
          title: group.episode.title,
          displayLabel: formatEpisodeDisplayLabel(group.episode.title),
          isFullEpisode: true,
          charIndex: group.episode.charIndex,
          firstMatchCharIndex: group.episode.charIndex + matchPos,
          matchedTerm: target,
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
