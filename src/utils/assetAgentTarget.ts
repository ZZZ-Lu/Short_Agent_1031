import type { AssetCategoryKey } from './assetVersions';

export interface ParsedAssetAgentTarget {
  category: AssetCategoryKey;
  itemId: string;
  parentId?: string;
  isVersion: boolean;
}

export interface ResolvedAssetTargetResult {
  category: AssetCategoryKey;
  item: any;
  parentItem?: any;
  isVersion: boolean;
}

const VALID_CATEGORIES: AssetCategoryKey[] = ['character', 'location', 'prop'];
const TARGET_PREFIX = 'assets.item.';
const VERSION_SEGMENT = '.version.';

export function buildAssetAgentTargetId(
  category: AssetCategoryKey,
  itemId: string,
  parentId?: string
): string {
  const cleanId = String(itemId || '').trim();
  const cleanParentId = typeof parentId === 'string' ? parentId.trim() : '';
  if (cleanParentId) {
    return `${TARGET_PREFIX}${category}.${cleanParentId}${VERSION_SEGMENT}${cleanId}`;
  }
  return `${TARGET_PREFIX}${category}.${cleanId}`;
}

export function parseAssetAgentTargetId(
  targetId: string | null | undefined
): ParsedAssetAgentTarget | null {
  if (!targetId || !targetId.startsWith(TARGET_PREFIX)) return null;
  const remainder = targetId.slice(TARGET_PREFIX.length);
  for (const category of VALID_CATEGORIES) {
    const catPrefix = `${category}.`;
    if (!remainder.startsWith(catPrefix)) continue;
    const rawIdPart = remainder.slice(catPrefix.length);
    if (!rawIdPart) return null;

    const versionIdx = rawIdPart.lastIndexOf(VERSION_SEGMENT);
    if (versionIdx > 0) {
      const parentId = rawIdPart.slice(0, versionIdx);
      const itemId = rawIdPart.slice(versionIdx + VERSION_SEGMENT.length);
      if (parentId && itemId) {
        return {
          category,
          parentId,
          itemId,
          isVersion: true,
        };
      }
    }

    return {
      category,
      itemId: rawIdPart,
      isVersion: false,
    };
  }
  return null;
}

export function resolveAssetItemFromProject(
  project: {
    characters?: any[];
    locations?: any[];
    props?: any[];
  } | null | undefined,
  targetId: string | null | undefined
): ResolvedAssetTargetResult | null {
  const parsed = parseAssetAgentTargetId(targetId);
  if (!parsed || !project) return null;

  const list =
    parsed.category === 'character'
      ? project.characters
      : parsed.category === 'location'
        ? project.locations
        : project.props;

  if (!Array.isArray(list) || list.length === 0) return null;

  if (parsed.isVersion) {
    if (parsed.parentId) {
      const exactParent = list.find((entry) => entry?.id === parsed.parentId);
      if (exactParent && Array.isArray(exactParent.versions)) {
        const exactVer = exactParent.versions.find((v: any) => v?.id === parsed.itemId);
        if (exactVer) {
          return {
            category: parsed.category,
            item: exactVer,
            parentItem: exactParent,
            isVersion: true,
          };
        }
      }
    }
    for (const entry of list) {
      if (!Array.isArray(entry?.versions)) continue;
      const ver = entry.versions.find((v: any) => v?.id === parsed.itemId);
      if (ver) {
        return {
          category: parsed.category,
          item: ver,
          parentItem: entry,
          isVersion: true,
        };
      }
    }
    return null;
  }

  const topLevel = list.find((entry) => entry?.id === parsed.itemId);
  if (topLevel) {
    return {
      category: parsed.category,
      item: topLevel,
      isVersion: false,
    };
  }

  for (const entry of list) {
    if (!Array.isArray(entry?.versions)) continue;
    const ver = entry.versions.find((v: any) => v?.id === parsed.itemId);
    if (ver) {
      return {
        category: parsed.category,
        item: ver,
        parentItem: entry,
        isVersion: true,
      };
    }
  }

  return null;
}

export interface AssetFeedSectionTargetLike {
  category: AssetCategoryKey;
  assetId: string;
  parentId?: string;
  isVersion?: boolean;
}

/**
 * Checks whether an AssetImageFeed section (or its bound canvas card IDs) is
 * currently targeted by any active Agent focus ID.
 * Mirrors the exact parent/version matching semantics of `isSectionActive` in AssetImageFeedPanel.
 */
export function isAssetSectionAgentFocused(
  section: AssetFeedSectionTargetLike,
  focusedTargetIds: ReadonlyArray<string | null | undefined>,
  boundCardIds?: ReadonlyArray<string | null | undefined>
): boolean {
  if (!Array.isArray(focusedTargetIds) || focusedTargetIds.length === 0) {
    return false;
  }

  const normalizedTargets = focusedTargetIds.filter(
    (id): id is string => typeof id === 'string' && id.trim().length > 0
  );
  if (normalizedTargets.length === 0) return false;

  if (Array.isArray(boundCardIds) && boundCardIds.length > 0) {
    for (const cardId of boundCardIds) {
      if (cardId && normalizedTargets.includes(cardId)) {
        return true;
      }
    }
  }

  const sectionIsVersion = Boolean(section.isVersion);
  for (const rawTargetId of normalizedTargets) {
    const parsed = parseAssetAgentTargetId(rawTargetId);
    if (!parsed || parsed.category !== section.category) continue;

    if (parsed.isVersion) {
      if (
        sectionIsVersion &&
        section.assetId === parsed.itemId &&
        (!parsed.parentId || !section.parentId || section.parentId === parsed.parentId)
      ) {
        return true;
      }
      continue;
    }

    if (!sectionIsVersion && section.assetId === parsed.itemId) {
      return true;
    }

    if (sectionIsVersion && section.parentId === parsed.itemId) {
      return true;
    }
  }

  return false;
}

export function findAssetItemByIdInProject(
  project: {
    characters?: any[];
    locations?: any[];
    props?: any[];
  } | null | undefined,
  itemId: string
): { category: AssetCategoryKey; item: any; parentItem?: any; isVersion: boolean } | null {
  if (!project || !itemId) return null;
  const categories: AssetCategoryKey[] = ['character', 'location', 'prop'];
  for (const cat of categories) {
    const list = cat === 'character' ? project.characters : cat === 'location' ? project.locations : project.props;
    if (!Array.isArray(list)) continue;
    for (const entry of list) {
      if (entry?.id === itemId) {
        return { category: cat, item: entry, isVersion: false };
      }
      if (Array.isArray(entry?.versions)) {
        for (const ver of entry.versions) {
          if (ver?.id === itemId) {
            return { category: cat, item: ver, parentItem: entry, isVersion: true };
          }
        }
      }
    }
  }
  return null;
}

export function resolveAllAssetTargetIds(
  project: {
    characters?: any[];
    locations?: any[];
    props?: any[];
  } | null | undefined,
  assetIds: Iterable<string>,
  primaryTargetId?: string
): string[] {
  const result: string[] = [];
  if (primaryTargetId) {
    result.push(primaryTargetId);
  }
  const resultSet = new Set<string>(result);
  for (const id of assetIds) {
    const found = findAssetItemByIdInProject(project, id);
    if (found) {
      const targetId = buildAssetAgentTargetId(found.category, found.item.id, found.parentItem?.id);
      if (targetId && !resultSet.has(targetId)) {
        resultSet.add(targetId);
        result.push(targetId);
      }
    }
  }
  return result;
}
