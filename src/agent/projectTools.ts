import { readScriptDirectory, searchScript } from './scriptTools';

type ProjectData = { id: string; scriptText: string; characters: unknown[]; locations: unknown[]; props: unknown[] };

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
    const type = args.type;
    if (type != null && type !== 'characters' && type !== 'locations' && type !== 'props') throw new Error('资产类型无效。');
    const items = type === 'characters' || type === 'locations' || type === 'props' ? project[type] : [...project.characters.map(item => ({ type: 'characters', item })), ...project.locations.map(item => ({ type: 'locations', item })), ...project.props.map(item => ({ type: 'props', item }))];
    const offset = pageNumber(args.offset, 0, Number.MAX_SAFE_INTEGER);
    const limit = Math.max(1, pageNumber(args.limit, 50, 100));
    return { projectId: project.id, source: 'project', type: type || 'all', total: items.length, offset, items: items.slice(offset, offset + limit), nextOffset: offset + limit < items.length ? offset + limit : null };
  }
  throw new Error(`未知项目工具：${name}`);
}
