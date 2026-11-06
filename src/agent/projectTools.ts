import { readScriptDirectory, searchScript } from './scriptTools';
import {
  searchProvenanceCandidates,
  computeScriptSignature,
  buildVerifiedProvenanceFromEvidence,
  type ProvenanceCandidateItem,
  type ProvenanceEvidenceInput,
  type VerifiedAnchorRecord,
} from '../utils/assetProvenance';
import { normalizeAssetVersions, mergeMultiVersionAssetList, itemToVersion } from '../utils/assetVersions';

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
  return null;
}

export function executeProjectReadTool(name: string, args: Record<string, unknown>, project: ProjectData) {
  if (name === 'script.directory') {
    const all = readScriptDirectory(project.scriptText, {
      query: typeof args.query === 'string' ? args.query : undefined,
      scenePattern: project.tocConfig?.scenePattern,
      flags: project.tocConfig?.flags,
      precomputedScenes: Array.isArray(project.scenes) ? project.scenes : undefined,
    });
    const offset = pageNumber(args.offset, 0, Number.MAX_SAFE_INTEGER);
    const limit = Math.max(1, pageNumber(args.limit, 100, 200));
    return { projectId: project.id, source: 'project', total: all.length, offset, entries: all.slice(offset, offset + limit), nextOffset: offset + limit < all.length ? offset + limit : null };
  }
  if (name === 'script.read') {
    const lines = project.scriptText ? project.scriptText.split('\n') : [];
    const offset = pageNumber(args.offset, 0, Number.MAX_SAFE_INTEGER);
    const limit = Math.max(1, pageNumber(args.limit, 100, 200));
    return { projectId: project.id, source: 'project', total: lines.length, offset, content: lines.slice(offset, offset + limit).join('\n'), nextOffset: offset + limit < lines.length ? offset + limit : null };
  }
  if (name === 'script.search') {
    if (typeof args.query !== 'string' || !args.query.trim()) throw new Error('搜索关键词不能为空。');
    return { projectId: project.id, source: 'project', matches: searchScript(project.scriptText, args.query) };
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
        const topText = Object.values(target)
          .filter(v => typeof v === 'string')
          .join(' ')
          .toLowerCase();
        const verText = Array.isArray(target.versions)
          ? target.versions
              .map((ver: any) =>
                Object.values(ver || {})
                  .filter(v => typeof v === 'string')
                  .join(' ')
              )
              .join(' ')
              .toLowerCase()
          : '';
        return topText.includes(q) || verText.includes(q);
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
      candidates: candidates.map(c => ({
        candidateId: c.candidateId,
        sceneTitle: c.sceneTitle,
        lineNumber: c.lineNumber,
        matchedTerm: c.matchedTerm,
        evidenceText: c.evidenceText,
        contextSnippet: c.contextSnippet,
      })),
      instruction: '请结合 assetProfile 逐一审阅每条 candidate 的 contextSnippet，分析剧本判断该资产（或该特定版本）在此处是否需要出现在画面中：需要出现在画面中则算作出场；若角色未在场且仅在他人台词中被侧面提及（口头提及）则绝对不算出场，严禁提交。随后调用 asset.commitProvenance 提交真实出场的 verifiedCandidateIds（也可在 provenances 中直接提交原文具体出场描写句 evidenceText，包含代词指代或特定服装/状态描写句）。',
    };
  }
  throw new Error(`未知项目工具：${name}`);
}

function extractRawEvidenceInputs(obj: Record<string, unknown> | undefined | null): ProvenanceEvidenceInput[] {
  if (!obj || typeof obj !== 'object') return [];
  const rawList =
    Array.isArray(obj.provenances)
      ? obj.provenances
      : Array.isArray(obj.evidenceSnippets)
        ? obj.evidenceSnippets
        : Array.isArray(obj.evidenceTexts)
          ? obj.evidenceTexts
          : typeof obj.evidenceText === 'string' && obj.evidenceText.trim()
            ? [obj.evidenceText.trim()]
            : [];
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

  const existingAnchors: VerifiedAnchorRecord[] = Array.isArray(targetItem.verifiedProvenance)
    ? targetItem.verifiedProvenance
    : [];
  const mergedByPos = new Map<string, VerifiedAnchorRecord>();
  for (const a of [...existingAnchors, ...newAnchors]) {
    if (!a) continue;
    const key = `${a.sceneTitle || ''}:${a.fallbackCharIndex ?? a.anchorText}`;
    mergedByPos.set(key, a);
  }

  const finalAnchors = Array.from(mergedByPos.values());
  const finalScenes = Array.from(
    new Set([
      ...(Array.isArray(targetItem.sourceScenes) ? targetItem.sourceScenes : []),
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
      const addedVersions = normalizeAssetVersions(type, parentItem.id, rawItems);
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
        const charObj: Record<string, any> = {
          id,
          name: itemName,
          role: typeof item.role === 'string' && item.role.trim() ? item.role.trim() : '剧中角色',
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

      // If child versions have verified provenance, sync sourceScenes onto parent
      if (normalizedVersions && normalizedVersions.length > 0) {
        const verScenes = normalizedVersions.flatMap(v => (Array.isArray(v.sourceScenes) ? v.sourceScenes : []));
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

    // Updating a second-level version item directly
    if (found.parentItem && typeof found.versionIndex === 'number') {
      const parentItem = currentList[found.index];
      const versions = Array.isArray(parentItem.versions) ? [...parentItem.versions] : [];
      const updatedVersion: Record<string, any> = {
        ...versions[found.versionIndex],
        ...updates,
        id,
      };
      delete updatedVersion.provenances;
      delete updatedVersion.evidenceSnippets;
      delete updatedVersion.evidenceTexts;
      attachDirectProvenancesToItem(
        updatedVersion,
        updates,
        currentScriptText,
        currentScriptHash,
        parentItem.name
      );
      versions[found.versionIndex] = updatedVersion;
      const updatedParent = {
        ...parentItem,
        versions,
      };
      currentList[found.index] = updatedParent;

      return {
        updatedProject: {
          [foundType]: currentList,
        },
        output: {
          success: true,
          type: foundType,
          id,
          parentId: parentItem.id,
          item: updatedVersion,
          message: `成功更新资产【${parentItem.name}】的版本 [${updatedVersion.name || id}]。`,
        },
      };
    }

    const originalItem = currentList[found.index];
    if (Array.isArray(updates.versions)) {
      const rawVers = updates.versions as unknown[];
      const normVers = normalizeAssetVersions(foundType, id, rawVers);
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
      updates.versions = normVers;
    }
    const updatedItem: Record<string, any> = {
      ...originalItem,
      ...updates,
      id,
    };
    delete updatedItem.provenances;
    delete updatedItem.evidenceSnippets;
    delete updatedItem.evidenceTexts;
    attachDirectProvenancesToItem(
      updatedItem,
      updates,
      currentScriptText,
      currentScriptHash,
      updatedItem.name
    );
    currentList[found.index] = updatedItem;

    return {
      updatedProject: {
        [foundType]: currentList,
      },
      output: {
        success: true,
        type: foundType,
        id,
        item: updatedItem,
        message: `成功更新资产 [${updatedItem.name || id}]。`,
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

      // 4. Fallback sceneTitle match if caller passed a scene title directly
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

    // Merge candidateAnchors and directAnchors sorted by script position
    const combinedAnchorMap = new Map<number, VerifiedAnchorRecord>();
    for (const a of [...candidateAnchors, ...directAnchors]) {
      const posKey = a.fallbackCharIndex ?? -1;
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

    const verifiedScenes = Array.from(new Set(verifiedProvenance.map(a => a.sceneTitle).filter(Boolean)));

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
      currentList[found.index] = parentCopy;
    } else {
      currentList[found.index] = updatedItem;
    }

    return {
      updatedProject: {
        [found.type]: currentList,
      },
      output: {
        success: true,
        type: found.type,
        id: originalItem.id,
        name: displayAssetName,
        aliases: finalAliases,
        verifiedCount: verifiedProvenance.length,
        sourceScenes: verifiedScenes,
        provenanceStatus: 'verified',
        item: updatedItem,
        message: `已完成资产【${displayAssetName}】出处核验：共确认 ${verifiedProvenance.length} 处真实出场（涉及场次：${verifiedScenes.join('、') || '无'}）。`,
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
