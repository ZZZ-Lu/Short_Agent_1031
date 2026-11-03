import { readScriptDirectory, searchScript } from './scriptTools';

export type ProjectData = {
  id: string;
  scriptText: string;
  characters: any[];
  locations: any[];
  props: any[];
  [key: string]: any;
};

const pageNumber = (value: unknown, fallback: number, max: number) => {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(max, Math.max(0, Math.floor(number))) : fallback;
};

export function executeProjectReadTool(name: string, args: Record<string, unknown>, project: ProjectData) {
  if (name === 'script.directory') {
    const all = readScriptDirectory(project.scriptText, { query: typeof args.query === 'string' ? args.query : undefined });
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
        const text = Object.values(target)
          .filter(v => typeof v === 'string')
          .join(' ')
          .toLowerCase();
        return text.includes(q);
      });
    }

    const offset = pageNumber(args.offset, 0, Number.MAX_SAFE_INTEGER);
    const limit = Math.max(1, pageNumber(args.limit, 50, 100));
    return { projectId: project.id, source: 'project', type: type || 'all', total: items.length, offset, items: items.slice(offset, offset + limit), nextOffset: offset + limit < items.length ? offset + limit : null };
  }
  throw new Error(`未知项目工具：${name}`);
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

    const createdItems = rawItems.map((item, index) => {
      const itemName = String(item.name || '').trim();
      if (!itemName) throw new Error('创建资产失败：资产名称 (name) 不能为空。');
      const prefix = type === 'characters' ? 'char' : type === 'locations' ? 'loc' : 'prop';
      const id = typeof item.id === 'string' && item.id.trim()
        ? item.id.trim()
        : `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}_${index}`;

      if (type === 'characters') {
        return {
          id,
          name: itemName,
          role: typeof item.role === 'string' ? item.role : '剧中角色',
          appearance: typeof item.appearance === 'string' ? item.appearance : '',
          age: typeof item.age === 'string' ? item.age : undefined,
          gender: typeof item.gender === 'string' ? item.gender : undefined,
          personality: typeof item.personality === 'string' ? item.personality : undefined,
          performanceNotes: typeof item.performanceNotes === 'string' ? item.performanceNotes : '',
          aliases: Array.isArray(item.aliases) ? item.aliases : undefined,
          sourceScenes: Array.isArray(item.sourceScenes) ? item.sourceScenes : undefined,
        };
      } else if (type === 'locations') {
        return {
          id,
          name: itemName,
          type: item.locationType === 'EXT' || item.type === 'EXT' ? 'EXT' : 'INT',
          timeOfDay: typeof item.timeOfDay === 'string' ? item.timeOfDay : '日景',
          atmosphere: typeof item.atmosphere === 'string' ? item.atmosphere : '',
          visualDetails: typeof item.visualDetails === 'string' ? item.visualDetails : '',
          sourceScenes: Array.isArray(item.sourceScenes) ? item.sourceScenes : undefined,
        };
      } else {
        return {
          id,
          name: itemName,
          owner: typeof item.owner === 'string' ? item.owner : '通用',
          materialAndState: typeof item.materialAndState === 'string' ? item.materialAndState : '',
          storySignificance: typeof item.storySignificance === 'string' ? item.storySignificance : '',
          sourceScenes: Array.isArray(item.sourceScenes) ? item.sourceScenes : undefined,
        };
      }
    });

    const existingList = Array.isArray(project[type]) ? project[type] : [];
    const updatedList = [...existingList, ...createdItems];

    return {
      updatedProject: {
        [type]: updatedList,
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

    let updates: Record<string, unknown> = {};
    if (args.updates && typeof args.updates === 'object' && !Array.isArray(args.updates)) {
      updates = { ...(args.updates as Record<string, unknown>) };
    } else {
      const { id: _ignoredId, type: _ignoredType, ...rest } = args;
      updates = rest;
    }
    delete updates.id;

    const categories: Array<'characters' | 'locations' | 'props'> = args.type
      ? [normalizeType(args.type)]
      : ['characters', 'locations', 'props'];

    let foundType: 'characters' | 'locations' | 'props' | null = null;
    let foundIndex = -1;

    for (const cat of categories) {
      const list = Array.isArray(project[cat]) ? project[cat] : [];
      const idx = list.findIndex(item => item && (item as any).id === id);
      if (idx !== -1) {
        foundType = cat;
        foundIndex = idx;
        break;
      }
    }

    if (!foundType || foundIndex === -1) {
      throw new Error(`未找到 ID 为 "${id}" 的资产条目。`);
    }

    const currentList = [...(project[foundType] || [])];
    const originalItem = currentList[foundIndex];
    const updatedItem = {
      ...originalItem,
      ...updates,
      id,
    };
    currentList[foundIndex] = updatedItem;

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
      for (const item of list) {
        if (item && targetIds.has(item.id)) {
          deletedIds.push(item.id);
        } else {
          remaining.push(item);
        }
      }
      if (remaining.length !== list.length) {
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
