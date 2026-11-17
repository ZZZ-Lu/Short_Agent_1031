import React, { useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Edit3, Eye, Link2, Plus, Sparkles, Trash2 } from 'lucide-react';
import {
  type AssetContextCategory,
  type AssetContextMenuActionId,
  buildAssetContextMenuItems,
  clampAssetContextMenuPosition,
  getAssetContextMenuHeaderLabel,
  resolveAssetContextMenuAnchorY,
} from '../utils/assetContextMenu';

export interface AssetItemContextMenuProps {
  isOpen: boolean;
  x: number;
  y: number;
  category: AssetContextCategory;
  itemName?: string;
  parentName?: string;
  isVersion: boolean;
  cascadeBelowAgentHud?: boolean;
  onAction: (action: AssetContextMenuActionId) => void;
  onClose: () => void;
}

const ACTION_ICONS: Record<AssetContextMenuActionId, React.ReactNode> = {
  'add-version': <Plus className="w-3.5 h-3.5 shrink-0" />,
  view: <Eye className="w-3.5 h-3.5 shrink-0" />,
  edit: <Edit3 className="w-3.5 h-3.5 shrink-0" />,
  'bind-image': <Link2 className="w-3.5 h-3.5 shrink-0 text-blue-500 dark:text-blue-400" />,
  'agent-generate-image': <Sparkles className="w-3.5 h-3.5 shrink-0 text-purple-500 dark:text-purple-400" />,
  delete: <Trash2 className="w-3.5 h-3.5 shrink-0" />,
};

export function AssetItemContextMenu({
  isOpen,
  x,
  y,
  category,
  itemName,
  parentName,
  isVersion,
  cascadeBelowAgentHud = false,
  onAction,
  onClose,
}: AssetItemContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  const items = useMemo(
    () => buildAssetContextMenuItems({ category, isVersion }),
    [category, isVersion]
  );

  const headerLabel = useMemo(
    () => getAssetContextMenuHeaderLabel({ itemName, parentName }),
    [itemName, parentName]
  );

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    const handlePointerDownCapture = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (menuRef.current && target && menuRef.current.contains(target)) {
        return;
      }
      onClose();
    };

    const handleWindowChange = () => {
      onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('pointerdown', handlePointerDownCapture, true);
    window.addEventListener('resize', handleWindowChange);
    window.addEventListener('blur', handleWindowChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('pointerdown', handlePointerDownCapture, true);
      window.removeEventListener('resize', handleWindowChange);
      window.removeEventListener('blur', handleWindowChange);
    };
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1440;
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 900;
  const estimatedHeight = isVersion ? 228 : 264;
  const anchorY = resolveAssetContextMenuAnchorY({
    clientY: y,
    viewportHeight,
    menuHeight: estimatedHeight,
    hudHeight: 80,
    margin: 12,
    cascadeBelowAgentHud,
  });
  const { left, top } = clampAssetContextMenuPosition({
    x,
    y: anchorY,
    viewportWidth,
    viewportHeight,
    menuWidth: 196,
    menuHeight: estimatedHeight,
    margin: 12,
  });

  return createPortal(
    <div
      ref={menuRef}
      role="menu"
      aria-label={`${headerLabel} 操作菜单`}
      data-asset-context-menu="true"
      data-prevent-canvas-wheel="true"
      onPointerDown={(e) => e.stopPropagation()}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      style={{ top, left }}
      className="fixed z-[120] w-[196px] bg-white/95 dark:bg-neutral-800/95 backdrop-blur-md border border-gray-200/90 dark:border-neutral-700/80 shadow-[0_12px_36px_rgba(0,0,0,0.14)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.45)] rounded-2xl corner-squircle p-1.5 select-none"
    >
      <div className="px-2.5 py-1 text-[11px] font-semibold text-gray-400 dark:text-neutral-400 truncate border-b border-gray-100 dark:border-neutral-700/60 mb-1">
        {headerLabel}
      </div>
      <div className="flex flex-col gap-0.5">
        {items.map((item) => (
          <React.Fragment key={item.id}>
            {item.dividerBefore && (
              <div className="my-0.5 border-t border-gray-100 dark:border-neutral-700/60" />
            )}
            <button
              type="button"
              role="menuitem"
              onClick={(e) => {
                e.stopPropagation();
                onAction(item.id);
                onClose();
              }}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors text-left cursor-pointer ${
                item.destructive
                  ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/60'
                  : 'text-gray-700 dark:text-neutral-200 hover:bg-blue-50 dark:hover:bg-neutral-700/70 hover:text-blue-600 dark:hover:text-blue-300'
              }`}
            >
              {ACTION_ICONS[item.id]}
              <span className="truncate">{item.label}</span>
            </button>
          </React.Fragment>
        ))}
      </div>
    </div>,
    document.body
  );
}
