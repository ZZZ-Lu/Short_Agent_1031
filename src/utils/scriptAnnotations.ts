import type { ScriptAnnotation } from '../types/script';

export interface ScriptSelectionAnchorRect {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface SelectionToolbarPosition {
  x: number;
  y: number;
  placement: 'above' | 'below';
}

export function computeSelectionToolbarPosition(params: {
  anchorRect: ScriptSelectionAnchorRect;
  viewportWidth: number;
  viewportHeight: number;
  toolbarWidth?: number;
  toolbarHeight?: number;
  margin?: number;
  gap?: number;
}): SelectionToolbarPosition {
  const {
    anchorRect,
    viewportWidth,
    viewportHeight,
    toolbarWidth = 148,
    toolbarHeight = 42,
    margin = 12,
    gap = 8,
  } = params;

  const rawCenterX = (anchorRect.left + anchorRect.right) / 2;
  const halfWidth = toolbarWidth / 2;
  const minX = Math.min(viewportWidth / 2, halfWidth + margin);
  const maxX = Math.max(minX, viewportWidth - halfWidth - margin);
  const x = Math.max(minX, Math.min(rawCenterX, maxX));

  const hasSpaceAbove = anchorRect.top - gap - toolbarHeight >= margin;
  if (hasSpaceAbove) {
    const y = Math.min(viewportHeight - margin, Math.max(margin + toolbarHeight, anchorRect.top - gap));
    return { x, y, placement: 'above' };
  }

  const maxBelowY = Math.max(margin, viewportHeight - toolbarHeight - margin);
  const y = Math.max(margin, Math.min(anchorRect.bottom + gap, maxBelowY));
  return { x, y, placement: 'below' };
}

export interface UpsertScriptAnnotationInput {
  id?: string;
  from: number;
  to: number;
  selectedText: string;
  noteText: string;
  badgeText?: string;
  now?: number;
}

/**
 * Pure, immutable, 100% JSON-serializable upsert for persisted script annotations.
 * Never attaches functions/DOM references onto persisted data.
 */
export function upsertScriptAnnotation(
  existingList: ScriptAnnotation[] | undefined,
  input: UpsertScriptAnnotationInput
): ScriptAnnotation[] {
  const list = Array.isArray(existingList) ? existingList : [];
  const now = input.now ?? Date.now();
  const normalizedBadge = (input.badgeText || '').trim().slice(0, 4) || '标注';
  const normalizedNote = (input.noteText || '').trim();
  const from = Math.max(0, Math.floor(input.from));
  const to = Math.max(from, Math.floor(input.to));
  const snippet = input.selectedText.replace(/\s+/g, ' ').trim();
  const tooltip = normalizedNote
    ? `${normalizedBadge}：${normalizedNote}`
    : `${normalizedBadge}：${snippet.slice(0, 30)}`;

  if (input.id) {
    const idx = list.findIndex((item) => item.id === input.id);
    if (idx >= 0) {
      const prev = list[idx];
      const prevMeta = (prev.meta && typeof prev.meta === 'object' ? prev.meta : {}) as Record<string, unknown>;
      const updated: ScriptAnnotation = {
        id: prev.id,
        from: prev.from,
        to: prev.to,
        category: 'annotation',
        name: snippet.slice(0, 32) || prev.name,
        badgeText: normalizedBadge,
        badgeTooltip: tooltip,
        colorVariant: 'amber',
        meta: {
          ...prevMeta,
          noteText: normalizedNote,
          selectedText: input.selectedText || (typeof prevMeta.selectedText === 'string' ? prevMeta.selectedText : ''),
          updatedAt: now,
        },
      };
      return [...list.slice(0, idx), updated, ...list.slice(idx + 1)];
    }
  }

  const newId = `ann_${now.toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  const created: ScriptAnnotation = {
    id: newId,
    from,
    to,
    category: 'annotation',
    name: snippet.slice(0, 32) || normalizedBadge,
    badgeText: normalizedBadge,
    badgeTooltip: tooltip,
    colorVariant: 'amber',
    meta: {
      noteText: normalizedNote,
      selectedText: input.selectedText,
      createdAt: now,
      updatedAt: now,
    },
  };

  return [...list, created];
}

export function deleteScriptAnnotation(
  existingList: ScriptAnnotation[] | undefined,
  annotationId: string
): ScriptAnnotation[] {
  if (!Array.isArray(existingList) || existingList.length === 0) return [];
  return existingList.filter((item) => item.id !== annotationId);
}

/**
 * Keeps persisted annotation offsets aligned when script text is edited outside annotated spans.
 * Returns null if no annotation changed (to avoid redundant writes).
 */
export function reconcileAnnotationsAfterTextChange(
  existingList: ScriptAnnotation[] | undefined,
  newText: string
): ScriptAnnotation[] | null {
  if (!Array.isArray(existingList) || existingList.length === 0) return null;

  let changed = false;
  const next: ScriptAnnotation[] = [];

  for (const ann of existingList) {
    const selectedText =
      typeof ann.meta?.selectedText === 'string' ? ann.meta.selectedText : '';

    if (
      selectedText &&
      ann.from >= 0 &&
      ann.to <= newText.length &&
      newText.slice(ann.from, ann.to) === selectedText
    ) {
      next.push(ann);
      continue;
    }

    if (selectedText) {
      // Search for the occurrence closest to the previous `from` offset
      let bestIdx = -1;
      let bestDist = Infinity;
      let searchFrom = 0;
      while (searchFrom <= newText.length) {
        const found = newText.indexOf(selectedText, searchFrom);
        if (found === -1) break;
        const dist = Math.abs(found - ann.from);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = found;
        }
        searchFrom = found + Math.max(1, selectedText.length);
      }

      if (bestIdx !== -1) {
        const newFrom = bestIdx;
        const newTo = bestIdx + selectedText.length;
        if (newFrom !== ann.from || newTo !== ann.to) {
          changed = true;
          next.push({ ...ann, from: newFrom, to: newTo });
        } else {
          next.push(ann);
        }
        continue;
      }
    }

    // Clamp fallback when annotated text itself was edited
    const clampedFrom = Math.max(0, Math.min(ann.from, newText.length));
    const clampedTo = Math.max(clampedFrom, Math.min(ann.to, newText.length));
    if (clampedTo > clampedFrom) {
      if (clampedFrom !== ann.from || clampedTo !== ann.to) {
        changed = true;
        next.push({ ...ann, from: clampedFrom, to: clampedTo });
      } else {
        next.push(ann);
      }
    } else {
      changed = true;
    }
  }

  return changed ? next : null;
}
