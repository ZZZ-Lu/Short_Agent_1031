export type AssetContextCategory = 'character' | 'location' | 'prop';

export type AssetContextMenuActionId =
  | 'add-version'
  | 'view'
  | 'edit'
  | 'bind-image'
  | 'agent-generate-image'
  | 'delete';

export interface AssetContextMenuItemDescriptor {
  id: AssetContextMenuActionId;
  label: string;
  destructive?: boolean;
  dividerBefore?: boolean;
}

export interface ContextMenuPositionInput {
  x: number;
  y: number;
  viewportWidth: number;
  viewportHeight: number;
  menuWidth?: number;
  menuHeight?: number;
  margin?: number;
}

export interface AssetContextMenuAnchorInput {
  clientY: number;
  viewportHeight: number;
  menuHeight?: number;
  hudHeight?: number;
  margin?: number;
  cascadeBelowAgentHud?: boolean;
}

export interface ClampedContextMenuPosition {
  left: number;
  top: number;
}

export function getAddVersionActionLabel(category: AssetContextCategory): string {
  if (category === 'character') return '新增服装/造型版本';
  if (category === 'location') return '新增日景/夜景版本';
  return '新增道具状态版本';
}

export function buildAssetContextMenuItems({
  category,
  isVersion,
}: {
  category: AssetContextCategory;
  isVersion: boolean;
}): AssetContextMenuItemDescriptor[] {
  if (isVersion) {
    return [
      { id: 'view', label: '查看版本详情' },
      { id: 'edit', label: '编辑版本' },
      { id: 'bind-image', label: '手动绑定图像', dividerBefore: true },
      { id: 'agent-generate-image', label: 'Agent 生成资产图' },
      { id: 'delete', label: '删除版本', destructive: true, dividerBefore: true },
    ];
  }

  return [
    { id: 'add-version', label: getAddVersionActionLabel(category) },
    { id: 'view', label: '查看资产详情' },
    { id: 'edit', label: '编辑资产' },
    { id: 'bind-image', label: '手动绑定图像', dividerBefore: true },
    { id: 'agent-generate-image', label: 'Agent 生成资产图' },
    { id: 'delete', label: '删除资产', destructive: true, dividerBefore: true },
  ];
}

export function getAssetContextMenuHeaderLabel({
  itemName,
  parentName,
}: {
  itemName?: string;
  parentName?: string;
}): string {
  const cleanItem = (itemName || '').trim();
  const cleanParent = (parentName || '').trim();
  if (cleanParent && cleanItem) {
    return `${cleanParent} · ${cleanItem}`;
  }
  return cleanItem || cleanParent || '资产操作';
}

export function resolveAssetContextMenuAnchorY({
  clientY,
  viewportHeight,
  menuHeight = 264,
  hudHeight = 80,
  margin = 12,
  cascadeBelowAgentHud = false,
}: AssetContextMenuAnchorInput): number {
  if (!cascadeBelowAgentHud) return clientY;

  const safeHeight = Math.max(margin * 2 + 1, viewportHeight);
  const belowY = clientY + hudHeight;
  if (belowY + menuHeight <= safeHeight - margin) {
    return belowY;
  }

  const aboveY = clientY - menuHeight - margin;
  if (aboveY >= margin) {
    return aboveY;
  }

  return Math.max(margin, safeHeight - menuHeight - margin);
}

export function clampAssetContextMenuPosition({
  x,
  y,
  viewportWidth,
  viewportHeight,
  menuWidth = 184,
  menuHeight = 188,
  margin = 12,
}: ContextMenuPositionInput): ClampedContextMenuPosition {
  const safeWidth = Math.max(margin * 2 + 1, viewportWidth);
  const safeHeight = Math.max(margin * 2 + 1, viewportHeight);

  const maxLeft = Math.max(margin, safeWidth - menuWidth - margin);
  const maxTop = Math.max(margin, safeHeight - menuHeight - margin);

  const left = Math.max(margin, Math.min(x, maxLeft));
  const top = Math.max(margin, Math.min(y, maxTop));

  return { left, top };
}
