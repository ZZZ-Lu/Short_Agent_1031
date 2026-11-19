import React, { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { BookmarkPlus } from 'lucide-react';
import { ScriptSelectionChange } from './ScriptCodeEditor';
import {
  computeSelectionToolbarPosition,
  type ScriptSelectionAnchorRect,
  type SelectionToolbarPosition,
} from '../../utils/scriptAnnotations';

export interface ScriptSelectionToolbarAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  variant?: 'primary' | 'default';
  onClick: (selection: ScriptSelectionChange) => void;
}

interface ScriptSelectionToolbarProps {
  selection: ScriptSelectionChange | null;
  getAnchorRect?: () => ScriptSelectionAnchorRect | null;
  hidden?: boolean;
  extraActions?: ScriptSelectionToolbarAction[];
  onAddAnnotation: (selection: ScriptSelectionChange) => void;
}

function getFallbackDomSelectionRect(): ScriptSelectionAnchorRect | null {
  if (typeof window === 'undefined') return null;
  const selectionObj = window.getSelection();
  if (!selectionObj || selectionObj.isCollapsed || selectionObj.rangeCount === 0) {
    return null;
  }
  const range = selectionObj.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return null;
  return {
    left: rect.left,
    right: rect.right,
    top: rect.top,
    bottom: rect.bottom,
  };
}

export const ScriptSelectionToolbar: React.FC<ScriptSelectionToolbarProps> = ({
  selection,
  getAnchorRect,
  hidden = false,
  extraActions = [],
  onAddAnnotation,
}) => {
  const [position, setPosition] = useState<SelectionToolbarPosition | null>(null);
  const [isPointerDragging, setIsPointerDragging] = useState(false);
  const getAnchorRectRef = useRef(getAnchorRect);
  getAnchorRectRef.current = getAnchorRect;

  const updatePosition = useCallback(() => {
    if (!selection || !selection.text.trim() || hidden) {
      setPosition(null);
      return;
    }

    const anchorRect = getAnchorRectRef.current?.() || getFallbackDomSelectionRect();
    if (!anchorRect || typeof window === 'undefined') {
      setPosition(null);
      return;
    }

    const toolbarWidth = 128 + extraActions.length * 96;
    const computed = computeSelectionToolbarPosition({
      anchorRect,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      toolbarWidth,
      toolbarHeight: 40,
      margin: 12,
      gap: 8,
    });
    setPosition(computed);
  }, [selection, hidden, extraActions.length]);

  // Track left-button drag so the menu pops up cleanly right after release instead of jittering mid-drag
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handlePointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const target = e.target as Element | null;
      if (target?.closest('[data-script-selection-toolbar="true"]')) return;
      if (target?.closest('[data-agent-target="script.text"]')) {
        setIsPointerDragging(true);
      }
    };
    const handlePointerUp = () => {
      setIsPointerDragging(false);
    };
    window.addEventListener('pointerdown', handlePointerDown, true);
    window.addEventListener('pointerup', handlePointerUp, true);
    window.addEventListener('pointercancel', handlePointerUp, true);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown, true);
      window.removeEventListener('pointerup', handlePointerUp, true);
      window.removeEventListener('pointercancel', handlePointerUp, true);
    };
  }, []);

  useEffect(() => {
    if (!selection || !selection.text.trim() || hidden || isPointerDragging) {
      setPosition(null);
      return;
    }

    // Wait one animation frame so CodeMirror DOM & layout measurements are settled
    let rafId = window.requestAnimationFrame(() => {
      updatePosition();
    });

    const handleReposition = () => {
      updatePosition();
    };
    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [selection, hidden, isPointerDragging, updatePosition]);

  if (typeof document === 'undefined') return null;

  const isVisible = Boolean(selection && selection.text.trim() && !hidden && !isPointerDragging && position);

  const actions: ScriptSelectionToolbarAction[] = [
    {
      id: 'add-annotation',
      label: '添加标注',
      icon: <BookmarkPlus size={14} strokeWidth={2.2} />,
      variant: 'primary',
      onClick: (sel) => {
        onAddAnnotation(sel);
        setPosition(null);
      },
    },
    ...extraActions,
  ];

  return createPortal(
    <AnimatePresence>
      {isVisible && selection && position && (
        <div
          key="script-selection-toolbar-anchor"
          style={{
            position: 'fixed',
            left: `${position.x}px`,
            top: `${position.y}px`,
            transform: position.placement === 'above' ? 'translate(-50%, -100%)' : 'translate(-50%, 0%)',
            zIndex: 1000,
          }}
          className="pointer-events-none"
        >
          <motion.div
            data-testid="script-selection-toolbar"
            data-script-selection-toolbar="true"
            data-prevent-canvas-wheel="true"
            initial={{ opacity: 0, y: position.placement === 'above' ? 6 : -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: position.placement === 'above' ? 4 : -4, scale: 0.96 }}
            transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-1 px-1.5 py-1.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200/90 dark:border-neutral-700/90 shadow-[0_10px_30px_rgba(0,0,0,0.14)] pointer-events-auto select-none"
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            {actions.map((action, idx) => (
              <React.Fragment key={action.id}>
                {idx > 0 && <div className="w-px h-4 bg-neutral-200 dark:bg-neutral-700 mx-0.5" />}
                <button
                  type="button"
                  onClick={() => action.onClick(selection)}
                  className={
                    action.variant === 'primary'
                      ? 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-medium text-amber-700 dark:text-amber-300 bg-yellow-100/90 dark:bg-amber-950/60 hover:bg-yellow-200/80 dark:hover:bg-amber-900/80 transition-colors cursor-pointer whitespace-nowrap'
                      : 'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer whitespace-nowrap'
                  }
                >
                  {action.icon}
                  <span>{action.label}</span>
                </button>
              </React.Fragment>
            ))}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
