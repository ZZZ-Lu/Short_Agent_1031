import type { ScriptAssetVersion } from '../types/script';

export type AssetCategoryKey = 'character' | 'location' | 'prop';
export type AssetCollectionType = 'characters' | 'locations' | 'props';

export function toAssetCategoryKey(type: AssetCollectionType | AssetCategoryKey): AssetCategoryKey {
  if (type === 'characters' || type === 'character') return 'character';
  if (type === 'locations' || type === 'location') return 'location';
  return 'prop';
}

function extractFirstSceneHint(item: Record<string, any>): string {
  if (Array.isArray(item.sourceScenes) && item.sourceScenes.length > 0) {
    const first = String(item.sourceScenes[0] || '').trim();
    if (first) return `${first}首现`;
  }
  if (Array.isArray(item.verifiedProvenance) && item.verifiedProvenance.length > 0) {
    const first = String(item.verifiedProvenance[0]?.sceneTitle || '').trim();
    if (first) return `${first}首现`;
  }
  return '';
}

/**
 * Generates the light-colored identification description text for a top-level asset row.
 * Designed for disambiguation: avoids confusion, duplication, and loss by surfacing
 * explicit `description`, or synthesizing first appearance + owner/identity + distinguishing traits.
 */
export function getAssetIdentificationText(
  category: AssetCategoryKey | AssetCollectionType,
  item: Record<string, any> | null | undefined
): string {
  if (!item) return '';
  const explicitDesc = typeof item.description === 'string' ? item.description.trim() : '';
  if (explicitDesc) return explicitDesc;

  const versions: ScriptAssetVersion[] = Array.isArray(item.versions) ? item.versions : [];
  if (versions.length === 1 && typeof versions[0].description === 'string' && versions[0].description.trim()) {
    return versions[0].description.trim();
  }

  const cat = toAssetCategoryKey(category);
  const firstScene = extractFirstSceneHint(item);
  const versionSummary =
    versions.length > 1
      ? `含${versions.map(v => v.name).filter(Boolean).join('/')}等${versions.length}个版本`
      : '';

  if (cat === 'prop') {
    const parts: string[] = [];
    if (firstScene) parts.push(firstScene);
    const owner = typeof item.owner === 'string' ? item.owner.trim() : '';
    if (owner && owner !== '通用' && owner !== '无') {
      parts.push(`归属：${owner}`);
    }
    const material = typeof item.materialAndState === 'string' ? item.materialAndState.trim() : '';
    const story = typeof item.storySignificance === 'string' ? item.storySignificance.trim() : '';
    if (material && story && !story.includes(material)) {
      parts.push(`${material}（${story}）`);
    } else if (material) {
      parts.push(material);
    } else if (story) {
      parts.push(story);
    }
    if (versionSummary) parts.push(versionSummary);
    return parts.join(' · ') || owner || '关键道具';
  }

  if (cat === 'location') {
    const parts: string[] = [];
    if (firstScene) parts.push(firstScene);
    const locType = item.type === 'EXT' ? '外景' : item.type === 'INT' ? '内景' : '';
    const timeOfDay = typeof item.timeOfDay === 'string' ? item.timeOfDay.trim() : '';
    if (versionSummary) {
      if (locType) parts.push(locType);
      parts.push(versionSummary);
    } else {
      const envTag = [locType, timeOfDay].filter(Boolean).join('·');
      if (envTag) parts.push(envTag);
    }
    const atmosphere = typeof item.atmosphere === 'string' ? item.atmosphere.trim() : '';
    const visualDetails = typeof item.visualDetails === 'string' ? item.visualDetails.trim() : '';
    if (atmosphere) {
      parts.push(atmosphere);
    } else if (visualDetails) {
      parts.push(visualDetails);
    }
    return parts.join(' · ');
  }

  // character
  const parts: string[] = [];
  if (firstScene) parts.push(firstScene);
  const role = typeof item.role === 'string' ? item.role.trim() : '';
  if (role && role !== '剧中角色') parts.push(role);
  if (versionSummary) {
    parts.push(versionSummary);
  }
  const appearance = typeof item.appearance === 'string' ? item.appearance.trim() : '';
  if (appearance) {
    parts.push(appearance);
  } else if (role === '剧中角色') {
    parts.push(role);
  }
  return parts.join(' · ');
}

/**
 * Generates the light-colored identification description text for a second-level version row.
 */
export function getVersionIdentificationText(
  category: AssetCategoryKey | AssetCollectionType,
  version: Partial<ScriptAssetVersion> | null | undefined
): string {
  if (!version) return '';
  const explicitDesc = typeof version.description === 'string' ? version.description.trim() : '';
  if (explicitDesc) return explicitDesc;

  const cat = toAssetCategoryKey(category);
  const firstScene = extractFirstSceneHint(version as Record<string, any>);
  const parts: string[] = [];
  if (firstScene) parts.push(firstScene);

  if (cat === 'character') {
    if (version.appearance?.trim()) parts.push(version.appearance.trim());
    if (version.role?.trim() && version.role.trim() !== '剧中角色') parts.push(version.role.trim());
    if (version.performanceNotes?.trim() && parts.length === 0) parts.push(version.performanceNotes.trim());
  } else if (cat === 'location') {
    const locType = version.type === 'EXT' ? '外景' : version.type === 'INT' ? '内景' : '';
    const time = version.timeOfDay?.trim() || '';
    const tag = [locType, time].filter(Boolean).join('·');
    if (tag && tag !== version.name) parts.push(tag);
    if (version.atmosphere?.trim()) parts.push(version.atmosphere.trim());
    if (version.visualDetails?.trim() && !version.atmosphere?.trim()) parts.push(version.visualDetails.trim());
  } else {
    if (version.owner?.trim() && version.owner.trim() !== '通用') parts.push(`归属：${version.owner.trim()}`);
    if (version.materialAndState?.trim()) parts.push(version.materialAndState.trim());
    if (version.storySignificance?.trim()) parts.push(version.storySignificance.trim());
  }

  return parts.join(' · ');
}

/**
 * Normalizes raw version objects into clean, serializable ScriptAssetVersion items.
 */
export function normalizeAssetVersions(
  type: AssetCollectionType,
  parentId: string,
  rawVersions: unknown[]
): ScriptAssetVersion[] {
  const prefix = type === 'characters' ? 'charv' : type === 'locations' ? 'locv' : 'propv';
  const result: ScriptAssetVersion[] = [];

  rawVersions.forEach((raw, idx) => {
    if (!raw || typeof raw !== 'object') return;
    const v = raw as Record<string, any>;
    const rawName = String(v.name || v.versionName || v.timeOfDay || '').trim();
    if (!rawName) return;

    const id =
      typeof v.id === 'string' && v.id.trim()
        ? v.id.trim()
        : `${parentId}_${prefix}_${idx + 1}`;

    const verObj: ScriptAssetVersion = {
      id,
      name: rawName,
    };
    if (typeof v.description === 'string' && v.description.trim()) verObj.description = v.description.trim();
    if (typeof v.role === 'string' && v.role.trim()) verObj.role = v.role.trim();
    if (typeof v.appearance === 'string' && v.appearance.trim()) verObj.appearance = v.appearance.trim();
    if (typeof v.personality === 'string' && v.personality.trim()) verObj.personality = v.personality.trim();
    if (typeof v.performanceNotes === 'string' && v.performanceNotes.trim()) verObj.performanceNotes = v.performanceNotes.trim();
    if (v.type === 'INT' || v.type === 'EXT' || v.locationType === 'INT' || v.locationType === 'EXT') {
      verObj.type = (v.locationType || v.type) === 'EXT' ? 'EXT' : 'INT';
    }
    if (typeof v.timeOfDay === 'string' && v.timeOfDay.trim()) verObj.timeOfDay = v.timeOfDay.trim();
    if (typeof v.atmosphere === 'string' && v.atmosphere.trim()) verObj.atmosphere = v.atmosphere.trim();
    if (typeof v.visualDetails === 'string' && v.visualDetails.trim()) verObj.visualDetails = v.visualDetails.trim();
    if (typeof v.owner === 'string' && v.owner.trim()) verObj.owner = v.owner.trim();
    if (typeof v.materialAndState === 'string' && v.materialAndState.trim()) verObj.materialAndState = v.materialAndState.trim();
    if (typeof v.storySignificance === 'string' && v.storySignificance.trim()) verObj.storySignificance = v.storySignificance.trim();
    if (Array.isArray(v.aliases) && v.aliases.length) verObj.aliases = v.aliases;
    if (Array.isArray(v.sourceScenes) && v.sourceScenes.length) verObj.sourceScenes = v.sourceScenes;
    if (v.provenanceStatus) verObj.provenanceStatus = v.provenanceStatus;
    if (Array.isArray(v.verifiedProvenance)) verObj.verifiedProvenance = v.verifiedProvenance;
    if (typeof v.verifiedScriptHash === 'string') verObj.verifiedScriptHash = v.verifiedScriptHash;
    if (typeof v.referenceImage === 'string') verObj.referenceImage = v.referenceImage;

    result.push(verObj);
  });

  return result;
}

/**
 * Parses an asset name to see if it uses a version suffix like "伯爵大厅（日景）" or "娜塔莉亚（晚礼服）" or "伯爵大厅 - 夜景".
 * Note: Callers MUST only group items when 2+ items share the same baseName (or an existing parent has `baseName`),
 * so standalone disambiguated names like "画（生日蛋糕）" are never falsely split.
 */
export function parseBaseAndVersionName(rawName: string): { baseName: string; versionName: string } | null {
  const trimmed = (rawName || '').trim();
  const parenMatch = trimmed.match(/^(.+?)\s*[（(]([^）)]+)[）)]$/);
  if (parenMatch) {
    const baseName = parenMatch[1].trim();
    const versionName = parenMatch[2].trim();
    if (baseName && versionName) {
      return { baseName, versionName };
    }
  }
  const dashMatch = trimmed.match(/^(.+?)\s*[-·—]\s*(日景|夜景|黄昏|清晨|傍晚|雨夜|白天|夜晚|.+?装|.+?服|.+?造型|.+?版|.+?态|.+?形态)$/);
  if (dashMatch) {
    const baseName = dashMatch[1].trim();
    const versionName = dashMatch[2].trim();
    if (baseName && versionName) {
      return { baseName, versionName };
    }
  }
  return null;
}

export function itemToVersion(type: AssetCollectionType, item: Record<string, any>, fallbackVersionName: string): ScriptAssetVersion {
  const ver: ScriptAssetVersion = {
    id: String(item.id || `${type}_ver_${Date.now()}`),
    name: fallbackVersionName,
  };
  if (typeof item.description === 'string' && item.description.trim()) ver.description = item.description.trim();
  if (typeof item.role === 'string' && item.role.trim()) ver.role = item.role.trim();
  if (typeof item.appearance === 'string' && item.appearance.trim()) ver.appearance = item.appearance.trim();
  if (typeof item.personality === 'string' && item.personality.trim()) ver.personality = item.personality.trim();
  if (typeof item.performanceNotes === 'string' && item.performanceNotes.trim()) ver.performanceNotes = item.performanceNotes.trim();
  if (item.type === 'INT' || item.type === 'EXT') ver.type = item.type;
  if (typeof item.timeOfDay === 'string' && item.timeOfDay.trim()) ver.timeOfDay = item.timeOfDay.trim();
  if (typeof item.atmosphere === 'string' && item.atmosphere.trim()) ver.atmosphere = item.atmosphere.trim();
  if (typeof item.visualDetails === 'string' && item.visualDetails.trim()) ver.visualDetails = item.visualDetails.trim();
  if (typeof item.owner === 'string' && item.owner.trim()) ver.owner = item.owner.trim();
  if (typeof item.materialAndState === 'string' && item.materialAndState.trim()) ver.materialAndState = item.materialAndState.trim();
  if (typeof item.storySignificance === 'string' && item.storySignificance.trim()) ver.storySignificance = item.storySignificance.trim();
  if (Array.isArray(item.aliases) && item.aliases.length) ver.aliases = item.aliases;
  if (Array.isArray(item.sourceScenes) && item.sourceScenes.length) ver.sourceScenes = item.sourceScenes;
  if (item.provenanceStatus) ver.provenanceStatus = item.provenanceStatus;
  if (Array.isArray(item.verifiedProvenance)) ver.verifiedProvenance = item.verifiedProvenance;
  if (typeof item.verifiedScriptHash === 'string') ver.verifiedScriptHash = item.verifiedScriptHash;
  if (typeof item.referenceImage === 'string') ver.referenceImage = item.referenceImage;
  return ver;
}

/**
 * Automatically merges multi-version assets in a list when:
 * 1. Two or more items share the same base name via `BaseName（VersionName）` (e.g., "伯爵大厅（日景）" + "伯爵大厅（夜景）"), OR
 * 2. Two or more items have the exact same `name` (e.g., two "伯爵大厅" entries with `timeOfDay: "日景"` and `"夜景"`, or two "娜塔莉亚" entries with different outfits), OR
 * 3. A `BaseName（VersionName）` item matches an existing parent item named `BaseName`.
 *
 * Single standalone items with parentheses (such as "画（生日蛋糕）" where no other "画（...）" or "画" exists) are NEVER split.
 */
export function mergeMultiVersionAssetList<T extends Record<string, any>>(
  type: AssetCollectionType,
  items: T[]
): T[] {
  if (!Array.isArray(items) || items.length <= 1) return items;

  // Count how many items map to each candidate baseName
  const baseNameCounts = new Map<string, number>();
  const exactNameSet = new Set<string>();

  for (const item of items) {
    if (!item || typeof item.name !== 'string') continue;
    const rawName = item.name.trim();
    exactNameSet.add(rawName);
    const parsed = parseBaseAndVersionName(rawName);
    const key = parsed ? parsed.baseName : rawName;
    baseNameCounts.set(key, (baseNameCounts.get(key) || 0) + 1);
  }

  // Determine which baseNames actually have multiple versions
  const multiVersionBaseNames = new Set<string>();
  for (const [baseName, count] of baseNameCounts.entries()) {
    if (count >= 2) {
      multiVersionBaseNames.add(baseName);
    }
  }

  if (multiVersionBaseNames.size === 0) {
    return items;
  }

  const groupedByBase = new Map<string, T>();
  const output: T[] = [];

  for (const item of items) {
    if (!item || typeof item.name !== 'string') {
      output.push(item);
      continue;
    }
    const rawName = item.name.trim();
    const parsed = parseBaseAndVersionName(rawName);
    const candidateBase = parsed ? parsed.baseName : rawName;

    if (!multiVersionBaseNames.has(candidateBase)) {
      output.push(item);
      continue;
    }

    const derivedVersionName = parsed
      ? parsed.versionName
      : type === 'locations'
        ? String(item.timeOfDay || '默认版').trim()
        : type === 'characters'
          ? String(item.appearance || item.role || '造型版').trim().slice(0, 16)
          : String(item.materialAndState || '状态版').trim().slice(0, 16);

    const existingParent = groupedByBase.get(candidateBase);
    const incomingVersions: ScriptAssetVersion[] = Array.isArray(item.versions) && item.versions.length > 0
      ? normalizeAssetVersions(type, item.id, item.versions)
      : [itemToVersion(type, item, derivedVersionName)];

    if (!existingParent) {
      const parentCopy: Record<string, any> = {
        ...item,
        name: candidateBase,
        versions: incomingVersions,
      };
      groupedByBase.set(candidateBase, parentCopy as T);
      output.push(parentCopy as T);
    } else {
      const prevVersions: ScriptAssetVersion[] = Array.isArray(existingParent.versions)
        ? [...existingParent.versions]
        : [];
      for (const ver of incomingVersions) {
        const dupIdx = prevVersions.findIndex(v => v.id === ver.id || v.name === ver.name);
        if (dupIdx !== -1) {
          prevVersions[dupIdx] = { ...prevVersions[dupIdx], ...ver };
        } else {
          prevVersions.push(ver);
        }
      }
      (existingParent as Record<string, any>).versions = prevVersions;
      // Merge sourceScenes onto parent if present
      const mergedScenes = Array.from(
        new Set([
          ...(Array.isArray(existingParent.sourceScenes) ? existingParent.sourceScenes : []),
          ...(Array.isArray(item.sourceScenes) ? item.sourceScenes : []),
        ])
      );
      if (mergedScenes.length > 0) {
        (existingParent as Record<string, any>).sourceScenes = mergedScenes;
      }
    }
  }

  return output;
}
