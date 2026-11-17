export function escapeAttrSelectorValue(value: unknown): string {
  return String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"');
}

export function safeQuerySelector<T extends Element = HTMLElement>(
  root: ParentNode | null | undefined,
  selector: string
): T | null {
  if (!root || !selector) return null;
  try {
    return root.querySelector(selector) as T | null;
  } catch {
    return null;
  }
}

export function findAssetRowElement(
  root: ParentNode | null | undefined,
  params: {
    category?: string;
    itemId?: string;
    parentId?: string;
    isVersion?: boolean;
  }
): HTMLElement | null {
  if (!root || !params.itemId) return null;
  const safeId = escapeAttrSelectorValue(params.itemId);
  const safeCategory = params.category ? escapeAttrSelectorValue(params.category) : '';
  const safeParentId = params.parentId ? escapeAttrSelectorValue(params.parentId) : '';
  const versionAttr = typeof params.isVersion === 'boolean' ? (params.isVersion ? 'true' : 'false') : '';

  if (safeCategory && safeParentId) {
    const exact = safeQuerySelector(
      root,
      `[data-agent-target="assets.item.${safeCategory}.${safeParentId}.version.${safeId}"]`
    );
    if (exact) return exact;
  }

  if (safeCategory && versionAttr) {
    const exactFlat = safeQuerySelector(
      root,
      `[data-agent-target="assets.item.${safeCategory}.${safeId}"][data-asset-version="${versionAttr}"]`
    );
    if (exactFlat) return exactFlat;
  }

  if (safeCategory) {
    const byCat = safeQuerySelector(
      root,
      `[data-agent-target="assets.item.${safeCategory}.${safeId}"]`
    );
    if (byCat) return byCat;
  }

  if (versionAttr) {
    const bySuffixVersion = safeQuerySelector(
      root,
      `[data-agent-target$=".${safeId}"][data-asset-version="${versionAttr}"]`
    );
    if (bySuffixVersion) return bySuffixVersion;
  }

  return safeQuerySelector(root, `[data-agent-target$=".${safeId}"]`);
}
