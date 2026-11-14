import {
  readScriptDirectory,
  readScriptStructured,
  searchScript,
  searchScriptWithScope,
  RECOMMENDED_BATCH_MAX_CHARS,
  buildBatchCharLimitAdvice,
} from './scriptTools';
import {
  searchProvenanceCandidates,
  computeScriptSignature,
  buildVerifiedProvenanceFromEvidence,
  type ProvenanceCandidateItem,
  type ProvenanceEvidenceInput,
  type VerifiedAnchorRecord,
} from '../utils/assetProvenance';
import {
  normalizeAssetVersions,
  mergeMultiVersionAssetList,
  itemToVersion,
  getDefaultAssetVersionName,
  isSameInitialVersionLook,
} from '../utils/assetVersions';
import { searchExperiences } from './experienceRegistry';

export type ProjectData = {
  id: string;
  scriptText: string;
  characters: any[];
  locations: any[];
  props: any[];
  [key: string]: any;
};

interface ProvenanceSearchSnapshot {
  scriptHash: string;
  searchedTerms: string[];
  candidates: ProvenanceCandidateItem[];
}

const provenanceSearchSnapshotCache = new Map<string, ProvenanceSearchSnapshot>();

const pageNumber = (value: unknown, fallback: number, max: number) => {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(max, Math.max(0, Math.floor(number))) : fallback;
};

interface FoundAssetMatch {
  type: 'characters' | 'locations' | 'props';
  index: number;
  item: any;
  versionIndex?: number;
  parentItem?: any;
}

function findAssetInProject(
  project: ProjectData,
  args: { id?: unknown; name?: unknown; type?: unknown }
): FoundAssetMatch | null {
  const normalizeCat = (t: unknown): 'characters' | 'locations' | 'props' | null => {
    if (t === 'character' || t === 'characters') return 'characters';
    if (t === 'location' || t === 'locations') return 'locations';
    if (t === 'prop' || t === 'props') return 'props';
    return null;
  };
  const explicitCat = normalizeCat(args.type);
  const categories: Array<'characters' | 'locations' | 'props'> = explicitCat
    ? [explicitCat]
    : ['characters', 'locations', 'props'];

  const targetId = typeof args.id === 'string' ? args.id.trim() : '';
  const targetName = typeof args.name === 'string' ? args.name.trim() : '';

  for (const cat of categories) {
    const list = Array.isArray(project[cat]) ? project[cat] : [];
    for (let idx = 0; idx < list.length; idx++) {
      const item = list[idx];
      if (!item) continue;
      if (
        (targetId && item.id === targetId) ||
        (targetName && item.name === targetName) ||
        (targetId && !targetName && item.name === targetId)
      ) {
        return { type: cat, index: idx, item };
      }
      if (Array.isArray(item.versions)) {
        for (let vIdx = 0; vIdx < item.versions.length; vIdx++) {
          const ver = item.versions[vIdx];
          if (!ver) continue;
          const combinedNameParen = `${item.name}（${ver.name}）`;
          const combinedNameAscii = `${item.name}(${ver.name})`;
          const combinedNameDot = `${item.name} · ${ver.name}`;
          if (
            (targetId && ver.id === targetId) ||
            (targetName &&
              (ver.name === targetName ||
                combinedNameParen === targetName ||
                combinedNameAscii === targetName ||
                combinedNameDot === targetName))
          ) {
            return {
              type: cat,
              index: idx,
              item: ver,
              versionIndex: vIdx,
              parentItem: item,
            };
          }
        }
      }
    }
  }

  // Fallback for abbreviated version IDs (e.g. "charv_2", "locv_1", "propv_1") or version names passed in `id`
  if (targetId) {
    for (const cat of categories) {
      const list = Array.isArray(project[cat]) ? project[cat] : [];
      for (let idx = list.length - 1; idx >= 0; idx--) {
        const item = list[idx];
        if (!item || !Array.isArray(item.versions)) continue;
        for (let vIdx = 0; vIdx < item.versions.length; vIdx++) {
          const ver = item.versions[vIdx];
          if (!ver) continue;
          const verIdStr = typeof ver.id === 'string' ? ver.id.trim() : '';
          const verNameStr = typeof ver.name === 'string' ? ver.name.trim() : '';
          if (
            (verIdStr && verIdStr.endsWith(`_${targetId}`)) ||
            (verNameStr && verNameStr === targetId)
          ) {
            return {
              type: cat,
              index: idx,
              item: ver,
              versionIndex: vIdx,
              parentItem: item,
            };
          }
        }
      }
    }
  }

  return null;
}

export function executeProjectReadTool(name: string, args: Record<string, unknown>, project?: ProjectData): Record<string, any> {
  if (name === 'experience.search') {
    const query = typeof args.query === 'string' ? args.query : String(args.query ?? '');
    return searchExperiences(query);
  }
  if (!project) {
    throw new Error('当前没有打开的项目。');
  }
  if (name === 'script.directory') {
    const rawEpisode = args.episode ?? args.episodeId ?? args.episodes;
    const all = readScriptDirectory(project.scriptText, {
      episode: rawEpisode as any,
      query: typeof args.query === 'string' ? args.query : undefined,
      scenePattern: project.tocConfig?.scenePattern,
      flags: project.tocConfig?.flags,
      precomputedScenes: Array.isArray(project.scenes) ? project.scenes : undefined,
    });
    const offset = pageNumber(args.offset, 0, Number.MAX_SAFE_INTEGER);
    const limit = Math.max(1, pageNumber(args.limit, 100, 200));
    const entries = all.slice(offset, offset + limit).map((entry, idx) => ({
      index: offset + idx + 1,
      ...entry,
      ...(Array.isArray(entry.scenes) && entry.scenes.length > 0
        ? {
            scenes: entry.scenes.map((sc, sIdx) => ({
              index: sIdx + 1,
              ...sc,
            })),
          }
        : {}),
    }));
    const totalScenes = all.reduce((acc, ep) => acc + (ep.sceneCount ?? (ep.scenes ? ep.scenes.length : 0)), 0);
    const totalParagraphs = all.reduce(
      (acc, ep) =>
        acc +
        (ep.paragraphCount ??
          (ep.scenes ? ep.scenes.reduce((pAcc, sc) => pAcc + (sc.paragraphCount ?? 0), 0) : 0)),
      0
    );
    const totalChars = all.reduce(
      (acc, ep) =>
        acc +
        (ep.charCount ??
          (ep.scenes ? ep.scenes.reduce((cAcc, sc) => cAcc + (sc.charCount ?? 0), 0) : 0)),
      0
    );
    const allScenesList = all.flatMap(ep => (Array.isArray(ep.scenes) ? ep.scenes : []));
    const sceneNumberCounts = new Map<string, number>();
    for (const sc of allScenesList) {
      const sn = typeof sc.sceneNumber === 'string' ? sc.sceneNumber.trim() : '';
      if (sn) sceneNumberCounts.set(sn, (sceneNumberCounts.get(sn) || 0) + 1);
    }
    const duplicateSceneNumbers = Array.from(sceneNumberCounts.entries())
      .filter(([, count]) => count >= 2)
      .map(([sn]) => sn);
    const duplicateSet = new Set(duplicateSceneNumbers);

    const scenesSummary = allScenesList.map(s => {
      const sn = typeof s.sceneNumber === 'string' ? s.sceneNumber.trim() : '';
      const idTag = sn && duplicateSet.has(sn) ? ` [id: ${s.id}]` : '';
      return `${s.title || s.sceneNumber || s.id}${idTag} (${s.paragraphCount ?? 0}段/${s.charCount ?? 0}字)`;
    });

    const duplicateNotice = (() => {
      if (duplicateSceneNumbers.length === 0) return '';
      const sampleSn = duplicateSceneNumbers[0];
      const sampleScenes = allScenesList.filter(s => (s.sceneNumber || '').trim() === sampleSn);
      const idExamples = sampleScenes.slice(0, 2).map(s => `"${s.id}"（${s.title}）`).join(' / ');
      return `注：目录存在重名场次编号（${duplicateSceneNumbers.join('、')}），调用 script.read 精准读取单个子场次时请传唯一 id（如 ${idExamples}）或带地点/内外景的标识（如 "${sampleSn}内" / "${sampleSn}外"），勿只传未区分的 "${sampleSn}"。`;
    })();

    const hasVolumeWarning =
      totalScenes >= 3 ||
      totalParagraphs >= 20 ||
      totalChars > RECOMMENDED_BATCH_MAX_CHARS;
    const baseNotice = hasVolumeWarning
      ? `我发现当前剧集目录包含 ${totalScenes} 个场次共 ${totalParagraphs} 个段落（正文约 ${totalChars} 字），内容较多。本次已将全部目录信息返回在下方，当前处于 Stage 0 阶段，${buildBatchCharLimitAdvice(RECOMMENDED_BATCH_MAX_CHARS)}`
      : '';
    const notice = [baseNotice, duplicateNotice].filter(Boolean).join(' ') || undefined;

    return {
      projectId: project.id,
      source: 'project',
      total: all.length,
      offset,
      entries,
      nextOffset: offset + limit < all.length ? offset + limit : null,
      totalScenes,
      totalParagraphs,
      totalChars,
      recommendedBatchMaxChars: RECOMMENDED_BATCH_MAX_CHARS,
      scenesSummary,
      ...(duplicateSceneNumbers.length > 0 ? { duplicateSceneNumbers } : {}),
      hasVolumeWarning,
      ...(notice ? { notice, warning: notice } : {}),
    };
  }
  if (name === 'script.read') {
    const rawEpisode = args.episode ?? args.episodeId ?? args.episodes;
    const rawScene = args.scene ?? args.sceneId ?? args.scenes;
    const rawParagraph = args.paragraph ?? args.paragraphs;
    const rawStartLine = args.startLine ?? (Array.isArray(args.lineRange) ? args.lineRange[0] : undefined);
    const rawEndLine = args.endLine ?? (Array.isArray(args.lineRange) ? args.lineRange[1] : undefined);
    const startLine = Number.isFinite(Number(rawStartLine)) && Number(rawStartLine) >= 1 ? Math.floor(Number(rawStartLine)) : undefined;
    const endLine = Number.isFinite(Number(rawEndLine)) && Number(rawEndLine) >= 1 ? Math.floor(Number(rawEndLine)) : undefined;
    const startParagraph = Number.isFinite(Number(args.startParagraph)) && Number(args.startParagraph) >= 1 ? Math.floor(Number(args.startParagraph)) : undefined;
    const endParagraph = Number.isFinite(Number(args.endParagraph)) && Number(args.endParagraph) >= 1 ? Math.floor(Number(args.endParagraph)) : undefined;
    const offset = args.offset !== undefined ? Math.max(1, pageNumber(args.offset, 1, Number.MAX_SAFE_INTEGER)) : undefined;
    const limit = args.limit !== undefined ? Math.max(1, pageNumber(args.limit, 100, 200)) : undefined;

    const structured = readScriptStructured(project.scriptText, {
      episode: rawEpisode as any,
      scene: rawScene as any,
      paragraph: rawParagraph as any,
      startParagraph,
      endParagraph,
      startLine,
      endLine,
      offset,
      limit,
      scenePattern: project.tocConfig?.scenePattern,
      flags: project.tocConfig?.flags,
      precomputedScenes: Array.isArray(project.scenes) ? project.scenes : undefined,
    });

    if ((structured as any).notFound) {
      throw new Error((structured as any).message || '未找到匹配的剧本集数或场次。');
    }

    const ambiguousFilters = (structured as any).ambiguousSceneFilters as
      | Array<{
          filter: string;
          matchedScenes: Array<{ id: string; sceneNumber?: string; title: string; paragraphCount: number; charCount: number }>;
        }>
      | undefined;
    const hasParagraphOrLineSlice =
      rawParagraph !== undefined || startParagraph !== undefined || endParagraph !== undefined || startLine !== undefined || endLine !== undefined;
    if (
      Array.isArray(ambiguousFilters) &&
      ambiguousFilters.length > 0 &&
      !hasParagraphOrLineSlice &&
      structured.charCount > RECOMMENDED_BATCH_MAX_CHARS
    ) {
      const detailText = ambiguousFilters
        .map(af => {
          const choices = af.matchedScenes
            .map(s => `"${s.title}" [id: "${s.id}", ${s.paragraphCount}段/${s.charCount}字]`)
            .join('、');
          return `场次条件 "${af.filter}" 同时命中了 ${af.matchedScenes.length} 个同名子场次（${choices}）`;
        })
        .join('；');
      const sampleFilter = ambiguousFilters[0]?.filter || '该场次号';
      const suggestedId = ambiguousFilters[0]?.matchedScenes[0]?.id || 'scene-...';
      throw new Error(
        `读取超限：${detailText}，导致本次合批正文达 ${structured.charCount} 字，已超过每轮建议上限 ${RECOMMENDED_BATCH_MAX_CHARS} 字。请改用唯一场次 id（如 "${suggestedId}"）或带地点/内外景区分的标识（如 "${sampleFilter}内" / "${sampleFilter}外"）拆批读取。`
      );
    }

    return {
      projectId: project.id,
      source: 'project',
      ...structured,
    };
  }
  if (name === 'script.search') {
    if (typeof args.query !== 'string' || !args.query.trim()) throw new Error('搜索关键词不能为空。');
    const rawEpisode = args.episode ?? args.episodeId;
    if (rawEpisode === undefined || rawEpisode === null || String(rawEpisode).trim() === '') {
      throw new Error('缺少必填参数 episode（请传入目标集数如 "第一集" 或 1；若需跨全剧搜索请传 "all" 或 "全部"）。');
    }
    const episode =
      typeof rawEpisode === 'string' || typeof rawEpisode === 'number'
        ? rawEpisode
        : String(rawEpisode);
    const scene = typeof args.scene === 'string' ? args.scene : undefined;
    const rawStartLine = args.startLine ?? (Array.isArray(args.lineRange) ? args.lineRange[0] : undefined);
    const rawEndLine = args.endLine ?? (Array.isArray(args.lineRange) ? args.lineRange[1] : undefined);
    const startLine = Number.isFinite(Number(rawStartLine)) && Number(rawStartLine) >= 1 ? Math.floor(Number(rawStartLine)) : undefined;
    const endLine = Number.isFinite(Number(rawEndLine)) && Number(rawEndLine) >= 1 ? Math.floor(Number(rawEndLine)) : undefined;
    const limit = Number.isFinite(Number(args.limit)) && Number(args.limit) >= 1 ? Math.floor(Number(args.limit)) : undefined;

    const searchRes = searchScriptWithScope(project.scriptText, args.query, {
      episode,
      scene,
      startLine,
      endLine,
      limit,
      scenePattern: project.tocConfig?.scenePattern,
      flags: project.tocConfig?.flags,
      precomputedScenes: Array.isArray(project.scenes) ? project.scenes : undefined,
    });
    return {
      projectId: project.id,
      source: 'project',
      ...(searchRes.scope ? { scope: searchRes.scope } : {}),
      total: searchRes.totalMatches,
      ...(typeof searchRes.totalChars === 'number' ? { totalChars: searchRes.totalChars } : {}),
      recommendedBatchMaxChars: searchRes.recommendedBatchMaxChars ?? RECOMMENDED_BATCH_MAX_CHARS,
      hasVolumeWarning: Boolean(searchRes.hasVolumeWarning),
      ...(searchRes.warning ? { warning: searchRes.warning } : {}),
      ...(searchRes.scenesSummary ? { scenesSummary: searchRes.scenesSummary } : {}),
      matches: searchRes.matches,
    };
  }
  if (name === 'asset.list') {
    let type = args.type;
    if (type === 'character') type = 'characters';
    if (type === 'location') type = 'locations';
    if (type === 'prop') type = 'props';
    if (type != null && type !== 'characters' && type !== 'locations' && type !== 'props') throw new Error('资产类型无效。');

    let items = type === 'characters' || type === 'locations' || type === 'props'
      ? (project[type] || [])
      : [
          ...(project.characters || []).map(item => ({ type: 'characters', item })),
          ...(project.locations || []).map(item => ({ type: 'locations', item })),
          ...(project.props || []).map(item => ({ type: 'props', item }))
        ];

    if (typeof args.query === 'string' && args.query.trim()) {
      const q = args.query.trim().toLowerCase();
      items = items.filter((entry: any) => {
        const target = entry.item ? entry.item : entry;
        const primaryParts: string[] = [
          target.id,
          target.name,
          target.role,
          ...(Array.isArray(target.aliases) ? target.aliases : []),
          ...(Array.isArray(target.versions)
            ? target.versions.flatMap((ver: any) => [
                ver?.id,
                ver?.name,
                ...(Array.isArray(ver?.aliases) ? ver.aliases : []),
              ])
            : []),
        ].filter((v): v is string => typeof v === 'string' && Boolean(v.trim()));
        return primaryParts.some(p => p.toLowerCase().includes(q));
      });
    }

    const offset = pageNumber(args.offset, 0, Number.MAX_SAFE_INTEGER);
    const limit = Math.max(1, pageNumber(args.limit, 50, 100));
    return { projectId: project.id, source: 'project', type: type || 'all', total: items.length, offset, items: items.slice(offset, offset + limit), nextOffset: offset + limit < items.length ? offset + limit : null };
  }
  if (name === 'asset.searchProvenanceCandidates') {
    const found = findAssetInProject(project, args);
    const primarySearchName = found
      ? String((found.parentItem ? found.parentItem.name : found.item.name) || '').trim()
      : typeof args.name === 'string'
        ? args.name.trim()
        : '';
    if (!primarySearchName) {
      throw new Error('检索出处候选失败：请提供有效的资产 id 或 name。');
    }

    const inputAliases = Array.isArray(args.aliases)
      ? args.aliases.filter((a): a is string => typeof a === 'string' && Boolean(a.trim())).map(a => a.trim())
      : [];
    const existingAliases = found && Array.isArray(found.item.aliases)
      ? found.item.aliases.filter((a: any): a is string => typeof a === 'string' && Boolean(a.trim())).map((a: string) => a.trim())
      : [];
    const parentAliases = found?.parentItem && Array.isArray(found.parentItem.aliases)
      ? found.parentItem.aliases.filter((a: any): a is string => typeof a === 'string' && Boolean(a.trim())).map((a: string) => a.trim())
      : [];
    const mergedAliases = Array.from(new Set([...parentAliases, ...existingAliases, ...inputAliases]));
    const scopeScenes = Array.isArray(args.scopeScenes)
      ? args.scopeScenes.filter((s): s is string => typeof s === 'string')
      : undefined;

    const candidates = searchProvenanceCandidates(
      project.scriptText || '',
      undefined,
      primarySearchName,
      mergedAliases,
      scopeScenes
    );

    const resolvedAssetId = found ? String(found.item.id) : String(args.id || primarySearchName);
    const displayAssetName = found?.parentItem
      ? `${found.parentItem.name}（${found.item.name}）`
      : primarySearchName;
    const searchedTerms = Array.from(new Set([primarySearchName, ...mergedAliases]));
    const scriptHash = computeScriptSignature(project.scriptText || '');
    provenanceSearchSnapshotCache.set(`${project.id}:${resolvedAssetId}`, {
      scriptHash,
      searchedTerms,
      candidates,
    });
    if (found && displayAssetName) {
      provenanceSearchSnapshotCache.set(`${project.id}:${displayAssetName}`, {
        scriptHash,
        searchedTerms,
        candidates,
      });
    }

    const dirEntries = readScriptDirectory(project.scriptText || '', {
      scenePattern: project.tocConfig?.scenePattern,
      flags: project.tocConfig?.flags,
      precomputedScenes: Array.isArray(project.scenes) ? project.scenes : undefined,
    });
    const sceneCharLookup = new Map<string, number>();
    const normTitleKey = (s: string) => s.replace(/\s+/g, ' ').trim();
    for (const ep of dirEntries) {
      if (typeof ep.charCount === 'number' && ep.title) {
        const epKey = normTitleKey(ep.title);
        if (!sceneCharLookup.has(epKey)) sceneCharLookup.set(epKey, ep.charCount);
      }
      if (Array.isArray(ep.scenes)) {
        for (const sc of ep.scenes) {
          if (typeof sc.charCount !== 'number') continue;
          if (ep.title && sc.title) {
            sceneCharLookup.set(normTitleKey(`${ep.title} ${sc.title}`), sc.charCount);
          }
          if (sc.title) {
            const scKey = normTitleKey(sc.title);
            if (!sceneCharLookup.has(scKey)) sceneCharLookup.set(scKey, sc.charCount);
          }
        }
      }
    }

    const sceneCandidateMap = new Map<string, { sceneTitle: string; charCount: number; candidateCount: number; candidateIndices: number[]; matchedEvidenceChars: number }>();
    candidates.forEach((c, idx) => {
      const sTitle = c.sceneTitle || '未知场次';
      const existing = sceneCandidateMap.get(sTitle);
      const evidenceLen = typeof c.evidenceText === 'string' ? c.evidenceText.length : 0;
      if (!existing) {
        const resolvedChars = sceneCharLookup.get(normTitleKey(sTitle));
        sceneCandidateMap.set(sTitle, {
          sceneTitle: sTitle,
          charCount: typeof resolvedChars === 'number' ? resolvedChars : evidenceLen,
          candidateCount: 1,
          candidateIndices: [idx + 1],
          matchedEvidenceChars: evidenceLen,
        });
      } else {
        existing.candidateCount += 1;
        existing.candidateIndices.push(idx + 1);
        existing.matchedEvidenceChars += evidenceLen;
        if (sceneCharLookup.get(normTitleKey(sTitle)) === undefined) {
          existing.charCount = existing.matchedEvidenceChars;
        }
      }
    });
    const candidateScenesSummary = Array.from(sceneCandidateMap.values()).map(({ matchedEvidenceChars: _m, ...rest }) => rest);
    const totalChars = candidateScenesSummary.reduce((acc, s) => acc + s.charCount, 0);
    const hasVolumeWarning =
      candidates.length > 15 ||
      (candidateScenesSummary.length >= 2 && candidates.length >= 12) ||
      totalChars > RECOMMENDED_BATCH_MAX_CHARS;
    const notice = hasVolumeWarning
      ? `我发现候选出处共 ${candidates.length} 条，跨越 ${candidateScenesSummary.length} 个场次（涉及场次正文约 ${totalChars} 字），内容较多。本次已将全部候选出处返回在下方，当前处于 Stage 0 阶段，${buildBatchCharLimitAdvice(RECOMMENDED_BATCH_MAX_CHARS)}`
      : undefined;

    return {
      projectId: project.id,
      source: 'project',
      assetId: resolvedAssetId,
      assetName: displayAssetName,
      assetType: found ? found.type : (args.type || 'unknown'),
      assetProfile: found ? {
        name: displayAssetName,
        parentName: found.parentItem?.name,
        versionName: found.parentItem ? found.item.name : undefined,
        description: found.item.description || found.parentItem?.description,
        owner: found.item.owner ?? found.parentItem?.owner,
        role: found.item.role ?? found.parentItem?.role,
        appearance: found.item.appearance ?? found.parentItem?.appearance,
        timeOfDay: found.item.timeOfDay ?? found.parentItem?.timeOfDay,
        materialAndState: found.item.materialAndState ?? found.parentItem?.materialAndState,
        storySignificance: found.item.storySignificance ?? found.parentItem?.storySignificance,
        atmosphere: found.item.atmosphere ?? found.parentItem?.atmosphere,
        visualDetails: found.item.visualDetails ?? found.parentItem?.visualDetails,
      } : undefined,
      searchedTerms,
      totalCandidates: candidates.length,
      totalChars,
      recommendedBatchMaxChars: RECOMMENDED_BATCH_MAX_CHARS,
      hasVolumeWarning,
      ...(notice ? { notice, warning: notice } : {}),
      ...(candidateScenesSummary.length > 0 ? { scenesSummary: candidateScenesSummary } : {}),
      candidates: candidates.map((c, idx) => ({
        index: idx + 1,
        candidateId: c.candidateId,
        sceneTitle: c.sceneTitle,
        lineNumber: c.lineNumber,
        matchedTerm: c.matchedTerm,
        evidenceText: c.evidenceText,
        contextSnippet: c.contextSnippet,
      })),
      instruction: '请结合 assetProfile 与 contextSnippet 筛选符合出处判定规则的候选段落，并调用 asset.commitProvenance 或 asset.create/update 提交。',
    };
  }
  throw new Error(`未知项目工具：${name}`);
}

function extractRawEvidenceInputs(obj: Record<string, unknown> | undefined | null): ProvenanceEvidenceInput[] {
  if (!obj || typeof obj !== 'object') return [];
  const rawList: any[] = [];
  if (Array.isArray(obj.provenances)) {
    rawList.push(...obj.provenances);
  } else if (Array.isArray(obj.evidenceSnippets)) {
    rawList.push(...obj.evidenceSnippets);
  } else if (Array.isArray(obj.evidenceTexts)) {
    rawList.push(...obj.evidenceTexts);
  }

  if (Array.isArray(obj.paragraphIndicesByScene)) {
    rawList.push(...obj.paragraphIndicesByScene);
  }

  const topSceneTitle = typeof obj.sceneTitle === 'string' && obj.sceneTitle.trim()
    ? obj.sceneTitle.trim()
    : typeof obj.scene === 'string' && obj.scene.trim()
      ? obj.scene.trim()
      : undefined;

  if (
    obj.paragraphIndex !== undefined ||
    obj.paragraphIndices !== undefined ||
    obj.paragraph !== undefined ||
    obj.paragraphs !== undefined
  ) {
    rawList.push({
      sceneTitle: topSceneTitle,
      paragraphIndex: obj.paragraphIndex,
      paragraphIndices: obj.paragraphIndices,
      paragraph: obj.paragraph,
      paragraphs: obj.paragraphs,
      evidenceText: typeof obj.evidenceText === 'string' ? obj.evidenceText : undefined,
    });
  } else if (typeof obj.evidenceText === 'string' && obj.evidenceText.trim() && rawList.length === 0) {
    rawList.push({
      sceneTitle: topSceneTitle,
      evidenceText: obj.evidenceText.trim(),
    });
  }

  return rawList.filter((item): item is ProvenanceEvidenceInput =>
    typeof item === 'string' ? Boolean(item.trim()) : Boolean(item && typeof item === 'object')
  );
}

function attachDirectProvenancesToItem(
  targetItem: Record<string, any>,
  rawInput: Record<string, unknown>,
  scriptText: string,
  scriptHash: string,
  fallbackAssetName?: string
) {
  const rawEvidences = extractRawEvidenceInputs(rawInput);
  if (rawEvidences.length === 0 || !scriptText) return;

  const newAnchors = buildVerifiedProvenanceFromEvidence(
    scriptText,
    undefined,
    rawEvidences,
    String(targetItem.id || 'asset'),
    fallbackAssetName || String(targetItem.name || '')
  );

  if (newAnchors.length === 0) return;

  const isOverwrite =
    rawInput.mode === 'overwrite' ||
    rawInput.provenanceMode === 'overwrite' ||
    rawInput.replace === true;
  const existingAnchors: VerifiedAnchorRecord[] =
    !isOverwrite && Array.isArray(targetItem.verifiedProvenance)
      ? targetItem.verifiedProvenance
      : [];
  const mergedByPos = new Map<string, VerifiedAnchorRecord>();
  for (const a of [...existingAnchors, ...newAnchors]) {
    if (!a) continue;
    const key =
      typeof a.fallbackCharIndex === 'number' && a.fallbackCharIndex >= 0
        ? `pos:${a.fallbackCharIndex}`
        : `${a.sceneTitle || ''}:${a.anchorText || a.evidenceText || ''}`;
    const prev = mergedByPos.get(key);
    if (!prev || (a.evidenceText && (!prev.evidenceText || a.evidenceText.length > prev.evidenceText.length))) {
      mergedByPos.set(key, a);
    }
  }

  const finalAnchors = Array.from(mergedByPos.values()).sort(
    (a, b) => (a.fallbackCharIndex ?? 0) - (b.fallbackCharIndex ?? 0)
  );
  const finalScenes = Array.from(
    new Set([
      ...(!isOverwrite && Array.isArray(targetItem.sourceScenes) ? targetItem.sourceScenes : []),
      ...finalAnchors.map(a => a.sceneTitle).filter(Boolean),
    ])
  );

  targetItem.verifiedProvenance = finalAnchors;
  targetItem.provenanceStatus = 'verified';
  targetItem.verifiedScriptHash = scriptHash;
  if (finalScenes.length > 0) {
    targetItem.sourceScenes = finalScenes;
  }
}

function countTotalVerifiedProvenance(item: Record<string, any> | null | undefined): number {
  if (!item || typeof item !== 'object') return 0;
  const parentAnchors: any[] = Array.isArray(item.verifiedProvenance) ? item.verifiedProvenance : [];
  const versionAnchors: any[] = Array.isArray(item.versions)
    ? item.versions.flatMap((v: any) => (Array.isArray(v?.verifiedProvenance) ? v.verifiedProvenance : []))
    : [];
  const all = [...parentAnchors, ...versionAnchors];
  if (all.length === 0) return 0;
  const keys = new Set<string>();
  all.forEach((a, idx) => {
    if (!a) return;
    const key =
      typeof a.fallbackCharIndex === 'number' && a.fallbackCharIndex >= 0
        ? `pos:${a.fallbackCharIndex}`
        : `${a.sceneTitle || ''}:${a.lineNumber || ''}:${a.anchorText || a.evidenceText || a.text || idx}`;
    keys.add(key);
  });
  return keys.size;
}

export interface ProjectAssetMutationResult {
  updatedProject: Partial<ProjectData>;
  output: Record<string, unknown>;
}

export function executeProjectAssetMutation(
  name: string,
  args: Record<string, unknown>,
  project: ProjectData
): ProjectAssetMutationResult {
  const normalizeType = (t: unknown): 'characters' | 'locations' | 'props' => {
    if (t === 'character' || t === 'characters') return 'characters';
    if (t === 'location' || t === 'locations') return 'locations';
    if (t === 'prop' || t === 'props') return 'props';
    throw new Error('资产类型无效，必须为 "characters" | "locations" | "props"。');
  };

  const currentScriptText = project.scriptText || '';
  const currentScriptHash = computeScriptSignature(currentScriptText);

  if (name === 'asset.create') {
    const type = normalizeType(args.type);
    let rawItems: Array<Record<string, unknown>> = [];
    if (Array.isArray(args.items)) {
      rawItems = args.items.filter(item => item && typeof item === 'object');
    } else if (args.item && typeof args.item === 'object') {
      rawItems = [args.item as Record<string, unknown>];
    } else if (typeof args.name === 'string' && args.name.trim()) {
      rawItems = [args];
    }

    if (rawItems.length === 0) {
      throw new Error('创建资产失败：必须提供包含 name 的资产对象或 items 列表。');
    }

    // If parentId is provided on top-level args, append new version(s) directly to the existing parent asset
    const topParentId = typeof args.parentId === 'string' && args.parentId.trim() ? args.parentId.trim() : '';
    if (topParentId) {
      const existingList = [...(Array.isArray(project[type]) ? project[type] : [])];
      const pIdx = existingList.findIndex((item: any) => item && item.id === topParentId);
      if (pIdx === -1) {
        throw new Error(`未找到父资产 ID "${topParentId}"，无法添加版本。`);
      }
      const parentItem = existingList[pIdx];
      let currentVersions = Array.isArray(parentItem.versions) ? [...parentItem.versions] : [];
      if (currentVersions.length === 0) {
        const defaultVersionName = type === 'locations' ? '日景' : type === 'characters' ? '常服' : '初始态';
        currentVersions = [itemToVersion(type, parentItem, defaultVersionName)];
      }
      const addedVersions = normalizeAssetVersions(type, parentItem.id, rawItems, currentVersions);
      addedVersions.forEach((ver, vIdx) => {
        if (rawItems[vIdx]) {
          attachDirectProvenancesToItem(
            ver as Record<string, any>,
            rawItems[vIdx],
            currentScriptText,
            currentScriptHash,
            parentItem.name
          );
        }
      });
      const mergedVersions = [...currentVersions, ...addedVersions];
      const updatedParent: Record<string, any> = {
        ...parentItem,
        versions: mergedVersions,
      };
      const versionScenes = mergedVersions.flatMap(v => (Array.isArray(v.sourceScenes) ? v.sourceScenes : []));
      if (versionScenes.length > 0) {
        updatedParent.sourceScenes = Array.from(
          new Set([...(Array.isArray(updatedParent.sourceScenes) ? updatedParent.sourceScenes : []), ...versionScenes])
        );
      }
      existingList[pIdx] = updatedParent;
      return {
        updatedProject: {
          [type]: existingList,
        },
        output: {
          success: true,
          type,
          parentId: topParentId,
          createdCount: addedVersions.length,
          items: addedVersions,
          message: `成功在资产【${parentItem.name}】下新增 ${addedVersions.length} 个版本。`,
        },
      };
    }

    const createdItems = rawItems.map((item, index) => {
      const itemName = String(item.name || '').trim();
      if (!itemName) throw new Error('创建资产失败：资产名称 (name) 不能为空。');
      const prefix = type === 'characters' ? 'char' : type === 'locations' ? 'loc' : 'prop';
      const id = typeof item.id === 'string' && item.id.trim()
        ? item.id.trim()
        : `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}_${index}`;

      const rawVerArray = Array.isArray(item.versions) ? item.versions : [];
      const normalizedVersions = rawVerArray.length > 0
        ? normalizeAssetVersions(type, id, rawVerArray)
        : undefined;

      if (normalizedVersions && normalizedVersions.length > 0) {
        normalizedVersions.forEach((ver, vIdx) => {
          const rawVer = rawVerArray[vIdx];
          if (rawVer && typeof rawVer === 'object') {
            attachDirectProvenancesToItem(
              ver as Record<string, any>,
              rawVer as Record<string, unknown>,
              currentScriptText,
              currentScriptHash,
              itemName
            );
          }
        });
      }

      let builtObj: Record<string, any>;
      if (type === 'characters') {
        let resolvedRole = typeof item.role === 'string' && item.role.trim() ? item.role.trim() : '';
        if (!resolvedRole || resolvedRole === '剧中角色') {
          const desc = typeof item.description === 'string' ? item.description : '';
          const matchRole = desc.match(/(心理医生|教父|管家|养父|养母|家主|警探|医生|护士|杀手|保镖|秘书|司机)/);
          resolvedRole = matchRole ? matchRole[1] : (resolvedRole || '剧中角色');
        }
        const charObj: Record<string, any> = {
          id,
          name: itemName,
          role: resolvedRole,
        };
        if (typeof item.description === 'string' && item.description.trim()) charObj.description = item.description.trim();
        if (typeof item.appearance === 'string' && item.appearance.trim()) charObj.appearance = item.appearance.trim();
        if (typeof item.age === 'string' && item.age.trim()) charObj.age = item.age.trim();
        if (typeof item.gender === 'string' && item.gender.trim()) charObj.gender = item.gender.trim();
        if (typeof item.personality === 'string' && item.personality.trim()) charObj.personality = item.personality.trim();
        if (typeof item.performanceNotes === 'string' && item.performanceNotes.trim()) charObj.performanceNotes = item.performanceNotes.trim();
        if (Array.isArray(item.aliases) && item.aliases.length) charObj.aliases = item.aliases;
        if (Array.isArray(item.sourceScenes) && item.sourceScenes.length) charObj.sourceScenes = item.sourceScenes;
        if (normalizedVersions && normalizedVersions.length > 0) charObj.versions = normalizedVersions;
        builtObj = charObj;
      } else if (type === 'locations') {
        const locObj: Record<string, any> = {
          id,
          name: itemName,
          type: item.locationType === 'EXT' || item.type === 'EXT' ? 'EXT' : 'INT',
          timeOfDay: typeof item.timeOfDay === 'string' && item.timeOfDay.trim() ? item.timeOfDay.trim() : '日景',
        };
        if (typeof item.description === 'string' && item.description.trim()) locObj.description = item.description.trim();
        if (typeof item.atmosphere === 'string' && item.atmosphere.trim()) locObj.atmosphere = item.atmosphere.trim();
        if (typeof item.visualDetails === 'string' && item.visualDetails.trim()) locObj.visualDetails = item.visualDetails.trim();
        if (Array.isArray(item.aliases) && item.aliases.length) locObj.aliases = item.aliases;
        if (Array.isArray(item.sourceScenes) && item.sourceScenes.length) locObj.sourceScenes = item.sourceScenes;
        if (normalizedVersions && normalizedVersions.length > 0) locObj.versions = normalizedVersions;
        builtObj = locObj;
      } else {
        const propObj: Record<string, any> = {
          id,
          name: itemName,
          owner: typeof item.owner === 'string' && item.owner.trim() ? item.owner.trim() : '通用',
        };
        if (typeof item.description === 'string' && item.description.trim()) propObj.description = item.description.trim();
        if (typeof item.materialAndState === 'string' && item.materialAndState.trim()) propObj.materialAndState = item.materialAndState.trim();
        if (typeof item.storySignificance === 'string' && item.storySignificance.trim()) propObj.storySignificance = item.storySignificance.trim();
        if (Array.isArray(item.aliases) && item.aliases.length) propObj.aliases = item.aliases;
        if (Array.isArray(item.sourceScenes) && item.sourceScenes.length) propObj.sourceScenes = item.sourceScenes;
        if (normalizedVersions && normalizedVersions.length > 0) propObj.versions = normalizedVersions;
        builtObj = propObj;
      }

      // Attach direct provenances if provided on the top-level item
      attachDirectProvenancesToItem(builtObj, item, currentScriptText, currentScriptHash, itemName);

      // If variant version(s) were provided while top-level item has its own distinct provenances, prepend the default version
      if (
        normalizedVersions &&
        normalizedVersions.length >= 1 &&
        Array.isArray(builtObj.verifiedProvenance) &&
        builtObj.verifiedProvenance.length > 0
      ) {
        const defaultVerName = getDefaultAssetVersionName(type, builtObj);
        const alreadyHasDefault = normalizedVersions.some(
          v => v.id === builtObj.id || v.name === builtObj.name || v.name === defaultVerName
        );
        if (!alreadyHasDefault) {
          const verPosSet = new Set(
            normalizedVersions
              .flatMap((v: any) => (Array.isArray(v?.verifiedProvenance) ? v.verifiedProvenance : []))
              .map(a =>
                typeof a?.fallbackCharIndex === 'number' && a.fallbackCharIndex >= 0
                  ? `pos:${a.fallbackCharIndex}`
                  : `${a?.sceneTitle || ''}:${a?.lineNumber || ''}:${a?.evidenceText || ''}`
              )
          );
          const hasDistinctParentProvs = builtObj.verifiedProvenance.some((a: any) => {
            const key =
              typeof a?.fallbackCharIndex === 'number' && a.fallbackCharIndex >= 0
                ? `pos:${a.fallbackCharIndex}`
                : `${a?.sceneTitle || ''}:${a?.lineNumber || ''}:${a?.evidenceText || ''}`;
            return !verPosSet.has(key);
          });
          if (hasDistinctParentProvs) {
            const defaultVer = itemToVersion(type, builtObj, defaultVerName);
            builtObj.versions = [defaultVer, ...normalizedVersions];
          }
        }
      }

      // If child versions have verified provenance, sync sourceScenes onto parent
      if (Array.isArray(builtObj.versions) && builtObj.versions.length > 0) {
        const verScenes = builtObj.versions.flatMap((v: any) => (Array.isArray(v.sourceScenes) ? v.sourceScenes : []));
        if (verScenes.length > 0) {
          builtObj.sourceScenes = Array.from(
            new Set([...(Array.isArray(builtObj.sourceScenes) ? builtObj.sourceScenes : []), ...verScenes])
          );
        }
      }

      return builtObj;
    });

    const existingList = Array.isArray(project[type]) ? project[type] : [];
    const combinedList = mergeMultiVersionAssetList(type, [...existingList, ...createdItems]);

    return {
      updatedProject: {
        [type]: combinedList,
      },
      output: {
        success: true,
        type,
        createdCount: createdItems.length,
        items: createdItems,
        message: `成功在项目【${type}】中新增 ${createdItems.length} 个资产条目。`,
      },
    };
  }

  if (name === 'asset.update') {
    const id = typeof args.id === 'string' ? args.id.trim() : '';
    if (!id) throw new Error('修改资产失败：必须提供资产 ID (id)。');

    const { id: _ignoredId, type: _ignoredType, updates: nestedUpdates, ...rest } = args;
    let updates: Record<string, unknown> = { ...rest };
    if (nestedUpdates && typeof nestedUpdates === 'object' && !Array.isArray(nestedUpdates)) {
      updates = { ...updates, ...(nestedUpdates as Record<string, unknown>) };
    }
    delete updates.id;
    delete updates.type;
    delete updates.updates;

    const found = findAssetInProject(project, { id, type: args.type });
    if (!found) {
      throw new Error(`未找到 ID 为 "${id}" 的资产条目。`);
    }

    const foundType = found.type;
    const currentList = [...(project[foundType] || [])];

    // Updating a second-level version item directly (when not appending sibling `versions` onto the parent)
    if (found.parentItem && typeof found.versionIndex === 'number' && !Array.isArray(updates.versions)) {
      const parentItem = currentList[found.index];
      const versions = Array.isArray(parentItem.versions) ? [...parentItem.versions] : [];
      const canonicalVersionId = String(versions[found.versionIndex]?.id || id);
      const updatedVersion: Record<string, any> = {
        ...versions[found.versionIndex],
        ...updates,
        id: canonicalVersionId,
      };
      delete updatedVersion.provenances;
      delete updatedVersion.evidenceSnippets;
      delete updatedVersion.evidenceTexts;
      delete updatedVersion.mode;
      delete updatedVersion.provenanceMode;
      delete updatedVersion.replace;
      delete updatedVersion.paragraphIndex;
      delete updatedVersion.paragraphIndices;
      delete updatedVersion.sceneTitle;
      delete updatedVersion.verifiedCandidateIds;
      attachDirectProvenancesToItem(
        updatedVersion,
        updates,
        currentScriptText,
        currentScriptHash,
        parentItem.name
      );
      versions[found.versionIndex] = updatedVersion;
      const verScenes = versions.flatMap((v: any) => (Array.isArray(v?.sourceScenes) ? v.sourceScenes : []));
      const mergedParentScenes = Array.from(
        new Set([...(Array.isArray(parentItem.sourceScenes) ? parentItem.sourceScenes : []), ...verScenes])
      );
      const updatedParent: Record<string, any> = {
        ...parentItem,
        ...(mergedParentScenes.length > 0 ? { sourceScenes: mergedParentScenes } : {}),
        versions,
      };
      if (found.versionIndex === 0 && updatedParent.id === canonicalVersionId && Array.isArray(updatedVersion.verifiedProvenance)) {
        updatedParent.verifiedProvenance = updatedVersion.verifiedProvenance;
        updatedParent.provenanceStatus = 'verified';
        updatedParent.verifiedScriptHash = currentScriptHash;
      }
      currentList[found.index] = updatedParent;
      const verifiedCount = countTotalVerifiedProvenance(updatedParent);

      return {
        updatedProject: {
          [foundType]: currentList,
        },
        output: {
          success: true,
          type: foundType,
          id: canonicalVersionId,
          parentId: parentItem.id,
          verifiedCount,
          item: updatedVersion,
          message: `成功更新资产【${parentItem.name}】的版本 [${updatedVersion.name || canonicalVersionId}]（当前累计确认 ${verifiedCount} 处真实出场）。`,
        },
      };
    }

    const originalItem = currentList[found.index];
    const canonicalParentId = String(originalItem?.id || id);
    if (Array.isArray(updates.versions)) {
      const rawVers = updates.versions as unknown[];
      let existingVersions = Array.isArray(originalItem.versions) ? [...originalItem.versions] : [];
      const defaultVersionName = getDefaultAssetVersionName(foundType, originalItem);
      if (
        args.mode !== 'overwrite' &&
        existingVersions.length === 0 &&
        rawVers.length >= 1
      ) {
        const hasExplicitDefault = rawVers.some(rv => {
          const r = rv as Record<string, any> | undefined;
          const rId = typeof r?.id === 'string' ? r.id.trim() : '';
          const rName = String(r?.name || r?.versionName || r?.timeOfDay || '').trim();
          return Boolean(
            (rId && rId === originalItem.id) ||
            (rName && (rName === originalItem.name || rName === defaultVersionName))
          );
        });
        const hasAnyNamedVariant = rawVers.some(rv => {
          const r = rv as Record<string, any> | undefined;
          return Boolean(String(r?.name || r?.versionName || r?.timeOfDay || '').trim());
        });
        if (hasAnyNamedVariant && !hasExplicitDefault) {
          existingVersions = [itemToVersion(foundType, originalItem, defaultVersionName)];
        }
      }

      const normVers = normalizeAssetVersions(
        foundType,
        canonicalParentId,
        rawVers,
        args.mode === 'overwrite' ? undefined : existingVersions
      );
      normVers.forEach((ver, vIdx) => {
        const rawVer = rawVers[vIdx];
        if (rawVer && typeof rawVer === 'object') {
          attachDirectProvenancesToItem(
            ver as Record<string, any>,
            rawVer as Record<string, unknown>,
            currentScriptText,
            currentScriptHash,
            originalItem.name
          );
        }
      });
      if (args.mode === 'overwrite') {
        updates.versions = normVers;
      } else if (existingVersions.length === 0) {
        updates.versions = normVers;
      } else {
        const mergedVersions = [...existingVersions];
        for (const newVer of normVers) {
          let vMatchIdx = mergedVersions.findIndex(
            ev => (newVer.id && ev.id === newVer.id) || (newVer.name && ev.name === newVer.name)
          );
          let matchedByInitialLook = false;
          if (
            vMatchIdx < 0 &&
            mergedVersions.length > 0 &&
            mergedVersions[0].id === originalItem.id &&
            mergedVersions[0].name === defaultVersionName &&
            isSameInitialVersionLook(mergedVersions[0], newVer, originalItem)
          ) {
            vMatchIdx = 0;
            matchedByInitialLook = true;
          }
          if (vMatchIdx >= 0) {
            const existingV = mergedVersions[vMatchIdx] as any;
            const targetNewVer = newVer as any;
            const mergedV: Record<string, any> = {
              ...existingV,
              ...targetNewVer,
              id: existingV.id,
              ...(matchedByInitialLook ? { name: existingV.name } : {}),
            };
            if (Array.isArray(existingV.provenances) && !Array.isArray(targetNewVer.provenances)) {
              mergedV.provenances = existingV.provenances;
            } else if (Array.isArray(existingV.provenances) && Array.isArray(targetNewVer.provenances)) {
              const provMap = new Map<string, any>();
              existingV.provenances.forEach((p: any) => {
                provMap.set(`${p.lineNumber}:${p.evidenceText || ''}`, p);
              });
              targetNewVer.provenances.forEach((p: any) => {
                provMap.set(`${p.lineNumber}:${p.evidenceText || ''}`, p);
              });
              mergedV.provenances = Array.from(provMap.values());
            }
            if (Array.isArray(existingV.verifiedProvenance) && !Array.isArray(targetNewVer.verifiedProvenance)) {
              mergedV.verifiedProvenance = existingV.verifiedProvenance;
            } else if (Array.isArray(existingV.verifiedProvenance) && Array.isArray(targetNewVer.verifiedProvenance)) {
              const anchorMap = new Map<string, any>();
              const toAnchorKey = (a: any) =>
                typeof a?.fallbackCharIndex === 'number' && a.fallbackCharIndex >= 0
                  ? `pos:${a.fallbackCharIndex}`
                  : `${a?.lineNumber || ''}:${a?.text || a?.evidenceText || ''}`;
              existingV.verifiedProvenance.forEach((a: any) => {
                if (a) anchorMap.set(toAnchorKey(a), a);
              });
              targetNewVer.verifiedProvenance.forEach((a: any) => {
                if (a) anchorMap.set(toAnchorKey(a), a);
              });
              mergedV.verifiedProvenance = Array.from(anchorMap.values()).sort(
                (a, b) => (a.fallbackCharIndex ?? 0) - (b.fallbackCharIndex ?? 0)
              );
            }
            const mergedVerScenes = Array.from(
              new Set([
                ...(Array.isArray(existingV.sourceScenes) ? existingV.sourceScenes : []),
                ...(Array.isArray(targetNewVer.sourceScenes) ? targetNewVer.sourceScenes : []),
                ...(Array.isArray(mergedV.verifiedProvenance)
                  ? mergedV.verifiedProvenance.map((a: any) => a?.sceneTitle).filter(Boolean)
                  : []),
              ])
            );
            if (mergedVerScenes.length > 0) {
              mergedV.sourceScenes = mergedVerScenes;
            }
            mergedVersions[vMatchIdx] = mergedV;
          } else {
            mergedVersions.push(newVer);
          }
        }
        updates.versions = mergedVersions;
      }
    }
    const updatedItem: Record<string, any> = {
      ...originalItem,
      ...updates,
      id: canonicalParentId,
    };
    delete updatedItem.provenances;
    delete updatedItem.evidenceSnippets;
    delete updatedItem.evidenceTexts;
    delete updatedItem.mode;
    delete updatedItem.provenanceMode;
    delete updatedItem.replace;
    delete updatedItem.paragraphIndex;
    delete updatedItem.paragraphIndices;
    delete updatedItem.sceneTitle;
    delete updatedItem.verifiedCandidateIds;
    attachDirectProvenancesToItem(
      updatedItem,
      updates,
      currentScriptText,
      currentScriptHash,
      updatedItem.name
    );

    // Sync default version versions[0] if it shares the parent asset ID or when top-level provenances are explicitly appended
    const hasTopLevelProvenanceInput = Boolean(
      updates.provenances || updates.sceneTitle || updates.paragraphIndices || updates.paragraphIndex
    );
    if (
      Array.isArray(updatedItem.versions) &&
      updatedItem.versions.length > 0 &&
      (updatedItem.versions[0]?.id === updatedItem.id || hasTopLevelProvenanceInput) &&
      (Array.isArray(updatedItem.verifiedProvenance) || Array.isArray(updatedItem.versions[0]?.verifiedProvenance))
    ) {
      const unionMap = new Map<string, any>();
      const pushAnchor = (a: any) => {
        if (!a) return;
        const key =
          typeof a.fallbackCharIndex === 'number' && a.fallbackCharIndex >= 0
            ? `pos:${a.fallbackCharIndex}`
            : `${a.lineNumber || ''}:${a.text || a.evidenceText || ''}`;
        unionMap.set(key, a);
      };
      if (Array.isArray(updatedItem.verifiedProvenance)) {
        updatedItem.verifiedProvenance.forEach(pushAnchor);
      }
      if (Array.isArray(updatedItem.versions[0].verifiedProvenance)) {
        updatedItem.versions[0].verifiedProvenance.forEach(pushAnchor);
      }
      const unionProvenance = Array.from(unionMap.values()).sort(
        (a, b) => (a.fallbackCharIndex ?? 0) - (b.fallbackCharIndex ?? 0)
      );
      updatedItem.verifiedProvenance = unionProvenance;
      updatedItem.provenanceStatus = unionProvenance.length > 0 ? 'verified' : updatedItem.provenanceStatus;
      updatedItem.verifiedScriptHash = currentScriptHash;

      const ver0Scenes = Array.from(
        new Set(unionProvenance.map((a: any) => a?.sceneTitle).filter(Boolean))
      );
      const syncedVer0 = {
        ...updatedItem.versions[0],
        ...(typeof updatedItem.versions[0].appearance === 'string' && updatedItem.versions[0].appearance.trim()
          ? {}
          : typeof updatedItem.appearance === 'string' && updatedItem.appearance.trim()
            ? { appearance: updatedItem.appearance.trim() }
            : {}),
        ...(typeof updatedItem.versions[0].role === 'string' && updatedItem.versions[0].role.trim()
          ? {}
          : typeof updatedItem.role === 'string' && updatedItem.role.trim()
            ? { role: updatedItem.role.trim() }
            : {}),
        verifiedProvenance: unionProvenance,
        provenanceStatus: updatedItem.provenanceStatus,
        verifiedScriptHash: updatedItem.verifiedScriptHash,
        ...(ver0Scenes.length > 0 ? { sourceScenes: ver0Scenes } : {}),
      };
      updatedItem.versions = [syncedVer0, ...updatedItem.versions.slice(1)];
    }

    // Sync sourceScenes from versions if present
    if (Array.isArray(updatedItem.versions) && updatedItem.versions.length > 0) {
      const verScenes = updatedItem.versions.flatMap((v: any) => (Array.isArray(v.sourceScenes) ? v.sourceScenes : []));
      if (verScenes.length > 0) {
        updatedItem.sourceScenes = Array.from(
          new Set([...(Array.isArray(updatedItem.sourceScenes) ? updatedItem.sourceScenes : []), ...verScenes])
        );
      }
    }
    currentList[found.index] = updatedItem;

    const verifiedCount = countTotalVerifiedProvenance(updatedItem);
    return {
      updatedProject: {
        [foundType]: currentList,
      },
      output: {
        success: true,
        type: foundType,
        id,
        verifiedCount,
        ...(Array.isArray(updatedItem.sourceScenes) ? { sourceScenes: updatedItem.sourceScenes } : {}),
        item: updatedItem,
        message: `成功更新资产 [${updatedItem.name || id}]（当前累计确认 ${verifiedCount} 处真实出场）。`,
      },
    };
  }

  if (name === 'asset.commitProvenance') {
    const found = findAssetInProject(project, args);
    if (!found) {
      const targetLabel = String(args.id || args.name || '');
      throw new Error(`提交出处核验失败：未找到资产 "${targetLabel}"。`);
    }

    const originalItem = found.item;
    const primarySearchName = found.parentItem ? found.parentItem.name : originalItem.name;
    const displayAssetName = found.parentItem ? `${found.parentItem.name}（${originalItem.name}）` : originalItem.name;

    const inputAliases = Array.isArray(args.aliases)
      ? args.aliases.filter((a): a is string => typeof a === 'string' && Boolean(a.trim())).map(a => a.trim())
      : [];
    const existingAliases = Array.isArray(originalItem.aliases)
      ? originalItem.aliases.filter((a: any): a is string => typeof a === 'string' && Boolean(a.trim())).map((a: string) => a.trim())
      : [];

    // Retrieve the exact snapshot from the preceding asset.searchProvenanceCandidates call
    // so changing `aliases` between search and commit never shifts candidate indices or drops searched terms.
    const cachedSnapshot =
      provenanceSearchSnapshotCache.get(`${project.id}:${originalItem.id}`) ||
      provenanceSearchSnapshotCache.get(`${project.id}:${displayAssetName}`) ||
      provenanceSearchSnapshotCache.get(`${project.id}:${originalItem.name}`);
    const validCached = cachedSnapshot && cachedSnapshot.scriptHash === currentScriptHash ? cachedSnapshot : null;

    const unionSearchTerms = Array.from(
      new Set([
        ...existingAliases,
        ...inputAliases,
        ...(validCached ? validCached.searchedTerms : []),
      ])
    );

    const freshCandidates = searchProvenanceCandidates(
      currentScriptText,
      undefined,
      primarySearchName,
      unionSearchTerms
    );

    const primaryCandidates = validCached ? validCached.candidates : freshCandidates;

    const verifiedIds = Array.isArray(args.verifiedCandidateIds)
      ? args.verifiedCandidateIds.map(v => String(v).trim()).filter(Boolean)
      : [];

    const matchedByCharIndex = new Map<number, ProvenanceCandidateItem>();
    const unmatchedRawStrings: string[] = [];

    for (const rawId of verifiedIds) {
      // 1. Direct candidateId match (e.g. "cand_L747_38973") in primary or fresh candidates
      const exactHit =
        primaryCandidates.find(c => c.candidateId === rawId) ||
        freshCandidates.find(c => c.candidateId === rawId);
      if (exactHit) {
        matchedByCharIndex.set(exactHit.charIndex, exactHit);
        continue;
      }

      // 2. Deterministic ID format `cand_L<line>_<charIndex>` fallback by charIndex / lineNumber
      const detMatch = rawId.match(/^cand_L(\d+)_(\d+)$/);
      if (detMatch) {
        const targetLine = Number(detMatch[1]);
        const targetCharIndex = Number(detMatch[2]);
        const posHit =
          primaryCandidates.find(c => c.charIndex === targetCharIndex || c.lineNumber === targetLine) ||
          freshCandidates.find(c => c.charIndex === targetCharIndex || c.lineNumber === targetLine);
        if (posHit) {
          matchedByCharIndex.set(posHit.charIndex, posHit);
          continue;
        }
      }

      // 3. Legacy ordinal format `cand_<index>` — resolved strictly against the cached search snapshot
      // so index `N` always maps to the exact N-th candidate the Agent saw during `searchProvenanceCandidates`.
      const ordinalMatch = rawId.match(/^cand_(\d+)$/);
      if (ordinalMatch) {
        const idx = Number(ordinalMatch[1]);
        const ordHit = primaryCandidates[idx];
        if (ordHit) {
          matchedByCharIndex.set(ordHit.charIndex, ordHit);
          continue;
        }
      }

      // 4. Paragraph index formats: p_1, para_1, paragraph_1, [1], or 1
      const paraMatch = rawId.match(/^(?:p|para|paragraph)_?(\d+)$/i) || rawId.match(/^\[?(\d+)\]?$/);
      if (paraMatch) {
        const pIdx = Number(paraMatch[1]);
        const topScene = typeof args.sceneTitle === 'string' ? args.sceneTitle : (typeof args.scene === 'string' ? args.scene : undefined);
        unmatchedRawStrings.push({
          sceneTitle: topScene,
          paragraphIndex: pIdx,
        } as any);
        continue;
      }

      // 5. Fallback sceneTitle match if caller passed a scene title directly
      let matchedScene = false;
      for (const c of primaryCandidates) {
        if (c.sceneTitle === rawId) {
          matchedByCharIndex.set(c.charIndex, c);
          matchedScene = true;
        }
      }
      if (!matchedScene && !/^cand_/i.test(rawId)) {
        unmatchedRawStrings.push(rawId);
      }
    }

    const matchedCandidates = Array.from(matchedByCharIndex.values()).sort((a, b) => a.charIndex - b.charIndex);

    const candidateAnchors: VerifiedAnchorRecord[] = matchedCandidates.map((c, idx) => ({
      id: `vp_${originalItem.id}_${idx}_${c.charIndex}`,
      sceneId: c.sceneId,
      sceneTitle: c.sceneTitle,
      matchedTerm: c.matchedTerm,
      evidenceText: c.evidenceText,
      anchorText: c.anchorText,
      offsetInAnchor: c.offsetInAnchor,
      fallbackCharIndex: c.charIndex,
      lineNumber: c.lineNumber,
    }));

    // Also resolve any direct evidence inputs (provenances / evidenceSnippets / verbatim quotes)
    const directEvidenceInputs: ProvenanceEvidenceInput[] = [
      ...extractRawEvidenceInputs(args),
      ...unmatchedRawStrings,
    ];
    const directAnchors =
      directEvidenceInputs.length > 0
        ? buildVerifiedProvenanceFromEvidence(
            currentScriptText,
            undefined,
            directEvidenceInputs,
            originalItem.id,
            primarySearchName
          )
        : [];

    const isOverwrite =
      args.mode === 'overwrite' ||
      args.provenanceMode === 'overwrite' ||
      args.replace === true;
    const existingAnchors: VerifiedAnchorRecord[] =
      !isOverwrite && Array.isArray(originalItem.verifiedProvenance)
        ? originalItem.verifiedProvenance
        : [];

    // Merge existingAnchors (unless overwrite), candidateAnchors, and directAnchors sorted by script position
    const combinedAnchorMap = new Map<string, VerifiedAnchorRecord>();
    for (const a of [...existingAnchors, ...candidateAnchors, ...directAnchors]) {
      if (!a) continue;
      const posKey =
        typeof a.fallbackCharIndex === 'number' && a.fallbackCharIndex >= 0
          ? `pos:${a.fallbackCharIndex}`
          : `${a.sceneTitle || ''}:${a.anchorText || a.evidenceText || ''}`;
      const existing = combinedAnchorMap.get(posKey);
      if (!existing || (a.evidenceText && (!existing.evidenceText || a.evidenceText.length > existing.evidenceText.length))) {
        combinedAnchorMap.set(posKey, a);
      }
    }
    const verifiedProvenance = Array.from(combinedAnchorMap.values()).sort(
      (a, b) => (a.fallbackCharIndex ?? 0) - (b.fallbackCharIndex ?? 0)
    );

    // Ensure aliases include both user/Agent-submitted aliases AND any term actually matched by verified candidates
    const finalAliases = Array.from(
      new Set([
        ...existingAliases,
        ...inputAliases,
        ...matchedCandidates.map(c => c.matchedTerm).filter(Boolean),
      ])
    );

    const verifiedScenes = Array.from(
      new Set([
        ...(!isOverwrite && Array.isArray(originalItem.sourceScenes) ? originalItem.sourceScenes : []),
        ...verifiedProvenance.map(a => a.sceneTitle).filter(Boolean),
      ])
    );

    const currentList = [...(project[found.type] || [])];
    const updatedItem = {
      ...originalItem,
      aliases: finalAliases,
      sourceScenes: verifiedScenes,
      provenanceStatus: 'verified' as const,
      verifiedProvenance,
      verifiedScriptHash: currentScriptHash,
    };

    if (found.parentItem && typeof found.versionIndex === 'number') {
      const parentCopy = { ...currentList[found.index] };
      const versionsCopy = Array.isArray(parentCopy.versions) ? [...parentCopy.versions] : [];
      versionsCopy[found.versionIndex] = updatedItem;
      parentCopy.versions = versionsCopy;
      const allVerScenes = versionsCopy.flatMap((v: any) => (Array.isArray(v?.sourceScenes) ? v.sourceScenes : []));
      if (allVerScenes.length > 0) {
        parentCopy.sourceScenes = Array.from(
          new Set([...(Array.isArray(parentCopy.sourceScenes) ? parentCopy.sourceScenes : []), ...allVerScenes])
        );
      }
      currentList[found.index] = parentCopy;
    } else {
      if (
        Array.isArray(updatedItem.versions) &&
        updatedItem.versions.length > 0 &&
        updatedItem.versions[0]?.id === updatedItem.id
      ) {
        const syncedVer0 = {
          ...updatedItem.versions[0],
          aliases: finalAliases,
          sourceScenes: verifiedScenes,
          provenanceStatus: 'verified' as const,
          verifiedProvenance,
          verifiedScriptHash: currentScriptHash,
        };
        updatedItem.versions = [syncedVer0, ...updatedItem.versions.slice(1)];
      }
      currentList[found.index] = updatedItem;
    }

    const submittedCount = candidateAnchors.length + directAnchors.length;
    return {
      updatedProject: {
        [found.type]: currentList,
      },
      output: {
        success: true,
        type: found.type,
        id: originalItem.id,
        name: displayAssetName,
        mode: isOverwrite ? 'overwrite' : 'append',
        aliases: finalAliases,
        submittedCount,
        verifiedCount: verifiedProvenance.length,
        sourceScenes: verifiedScenes,
        provenanceStatus: 'verified',
        item: updatedItem,
        message: `已完成资产【${displayAssetName}】出处${isOverwrite ? '重设' : '增量更新'}：本次提交 ${submittedCount} 处，当前累计确认 ${verifiedProvenance.length} 处真实出场（涉及场次：${verifiedScenes.join('、') || '无'}）。`,
      },
    };
  }

  if (name === 'asset.delete') {
    const targetIds = new Set<string>();
    if (typeof args.id === 'string' && args.id.trim()) {
      targetIds.add(args.id.trim());
    }
    if (Array.isArray(args.ids)) {
      for (const id of args.ids) {
        if (typeof id === 'string' && id.trim()) targetIds.add(id.trim());
      }
    }

    if (targetIds.size === 0) {
      throw new Error('删除资产失败：必须提供 id 或 ids。');
    }

    const categories: Array<'characters' | 'locations' | 'props'> = args.type
      ? [normalizeType(args.type)]
      : ['characters', 'locations', 'props'];

    const updatedPatch: Partial<ProjectData> = {};
    const deletedIds: string[] = [];

    for (const cat of categories) {
      const list = Array.isArray(project[cat]) ? project[cat] : [];
      const remaining: any[] = [];
      let catChanged = false;
      for (const item of list) {
        if (item && targetIds.has(item.id)) {
          deletedIds.push(item.id);
          catChanged = true;
        } else if (item && Array.isArray(item.versions) && item.versions.length > 0) {
          const keptVersions = item.versions.filter((ver: any) => {
            if (ver && targetIds.has(ver.id)) {
              deletedIds.push(ver.id);
              catChanged = true;
              return false;
            }
            return true;
          });
          if (keptVersions.length !== item.versions.length) {
            remaining.push({ ...item, versions: keptVersions });
          } else {
            remaining.push(item);
          }
        } else {
          remaining.push(item);
        }
      }
      if (catChanged) {
        updatedPatch[cat] = remaining;
      }
    }

    if (deletedIds.length === 0) {
      throw new Error(`未找到匹配待删除 ID 的资产条目：${Array.from(targetIds).join(', ')}。`);
    }

    return {
      updatedProject: updatedPatch,
      output: {
        success: true,
        deletedCount: deletedIds.length,
        deletedIds,
        message: `成功删除 ${deletedIds.length} 个资产条目。`,
      },
    };
  }

  throw new Error(`未知资产操作工具：${name}`);
}
