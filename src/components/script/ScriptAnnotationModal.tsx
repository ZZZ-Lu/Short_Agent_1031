import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Bookmark, Check, X, Trash2 } from 'lucide-react';
import { ScriptAnnotation } from '../../types/script';

interface ScriptAnnotationModalProps {
  isOpen: boolean;
  selectedText: string;
  existingAnnotation?: ScriptAnnotation | null;
  onClose: () => void;
  onSave: (noteText: string, badgeText: string) => void;
  onDelete?: (id: string) => void;
}

export const ScriptAnnotationModal: React.FC<ScriptAnnotationModalProps> = ({
  isOpen,
  selectedText,
  existingAnnotation,
  onClose,
  onSave,
  onDelete,
}) => {
  const [noteText, setNoteText] = useState(
    (existingAnnotation?.meta?.noteText as string) || ''
  );
  const [badgeText, setBadgeText] = useState(
    existingAnnotation?.badgeText || '标注'
  );
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Always re-sync form state when opening or switching target annotation
  useEffect(() => {
    if (!isOpen) return;
    setNoteText((existingAnnotation?.meta?.noteText as string) || '');
    setBadgeText(existingAnnotation?.badgeText || '标注');
    const raf = window.requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(raf);
  }, [isOpen, existingAnnotation]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          data-testid="script-annotation-modal"
          data-prevent-canvas-wheel="true"
          className="fixed inset-0 z-[1005] flex items-center justify-center bg-black/30 p-4 pointer-events-auto"
          onPointerDown={e => {
            e.stopPropagation();
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="w-[min(460px,92vw)] flex flex-col rounded-2xl corner-squircle bg-white dark:bg-[#1d1e22] border border-neutral-200 dark:border-neutral-700/95 shadow-[0_24px_60px_rgba(0,0,0,0.22)] overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/90 dark:bg-neutral-900/70">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-yellow-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                  <Bookmark size={15} strokeWidth={2.2} />
                </span>
                <h3 className="text-[15px] font-semibold text-neutral-900 dark:text-neutral-100">
                  {existingAnnotation ? '编辑剧本标注' : '添加剧本标注'}
                </h3>
              </div>
              <button
                type="button"
                aria-label="关闭标注弹窗"
                onClick={onClose}
                className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-100 hover:bg-neutral-200/70 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-medium text-neutral-500 dark:text-neutral-400">
                  选中的文本片段
                </label>
                <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-700/80 text-[13px] text-neutral-700 dark:text-neutral-300 italic max-h-24 overflow-y-auto">
                  “{selectedText}”
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="script-annotation-badge-input"
                    className="text-[12px] font-medium text-neutral-500 dark:text-neutral-400"
                  >
                    右上角标识简字 (1-4个字)
                  </label>
                  <input
                    id="script-annotation-badge-input"
                    type="text"
                    maxLength={4}
                    value={badgeText}
                    onChange={e => setBadgeText(e.target.value)}
                    placeholder="如: 伏笔, 重点"
                    className="w-full bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 py-2 text-[13px] font-medium text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="script-annotation-note-input"
                  className="text-[12px] font-medium text-neutral-500 dark:text-neutral-400"
                >
                  标注内容与备注
                </label>
                <textarea
                  id="script-annotation-note-input"
                  ref={textareaRef}
                  rows={4}
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  placeholder="在此输入详细标注、导演提示或伏笔说明..."
                  className="w-full resize-none bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-700 rounded-xl p-3 text-[13px] leading-[1.6] text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between px-5 py-3 border-t border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/90 dark:bg-neutral-900/70">
              {existingAnnotation && onDelete ? (
                <button
                  type="button"
                  onClick={() => {
                    onDelete(existingAnnotation.id);
                    onClose();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/55 transition-colors cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>删除标注</span>
                </button>
              ) : <div />}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-1.5 rounded-lg text-[12.5px] font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/70 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSave(noteText.trim(), badgeText.trim() || '标注');
                    onClose();
                  }}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[12.5px] font-medium text-white bg-amber-500 hover:bg-amber-600 transition-colors cursor-pointer shadow-sm"
                >
                  <Check size={14} />
                  <span>完成</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
