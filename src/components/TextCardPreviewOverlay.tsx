import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Check,
  Copy,
  Crosshair,
  Edit3,
  FileText,
  X,
} from 'lucide-react';
import type { CardData } from './GenerationCard';
import { MarkdownContent } from './MarkdownContent';

interface TextCardPreviewOverlayProps {
  card: CardData | null;
  showLocateOnCanvas?: boolean;
  onClose: () => void;
  onUpdate: (cardId: string, updates: Partial<CardData>) => void;
  onLocateOnCanvas?: (cardId: string) => void;
}

export const TextCardPreviewOverlay: React.FC<TextCardPreviewOverlayProps> = ({
  card,
  showLocateOnCanvas = false,
  onClose,
  onUpdate,
  onLocateOnCanvas,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (card) {
      setDraftTitle(card.textTitle || '');
      setDraftContent(card.textContent || '');
      setIsEditing(false);
      setCopied(false);
    }
  }, [card?.id]);

  useEffect(() => {
    if (!card) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [card, onClose]);

  const handleSave = useCallback(() => {
    if (!card) return;
    onUpdate(card.id, {
      textTitle: draftTitle.trim() || '未命名文本',
      textContent: draftContent,
    });
    setIsEditing(false);
  }, [card, draftContent, draftTitle, onUpdate]);

  const handleCopy = useCallback(async () => {
    if (!card?.textContent) return;
    try {
      await navigator.clipboard.writeText(card.textContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Ignore clipboard permission errors
    }
  }, [card?.textContent]);

  if (!card) return null;

  const displayTitle = (card.textTitle || '').trim() || '文本卡片';

  return (
    <div
      data-testid="text-card-preview-overlay"
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/30 p-6 pointer-events-auto"
      onPointerDown={e => {
        e.stopPropagation();
        if (e.target === e.currentTarget) onClose();
      }}
      onWheel={e => e.stopPropagation()}
    >
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.97 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        onPointerDown={e => e.stopPropagation()}
        className="w-[min(700px,92vw)] max-h-[82vh] flex flex-col rounded-2xl corner-squircle bg-white dark:bg-[#1d1e22] border border-neutral-200 dark:border-neutral-700/90 shadow-[0_24px_60px_rgba(0,0,0,0.22)] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/90 dark:bg-neutral-900/70 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <span className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <FileText size={15} strokeWidth={2.2} />
            </span>
            {isEditing ? (
              <input
                type="text"
                value={draftTitle}
                onChange={e => setDraftTitle(e.target.value)}
                onKeyDown={e => e.stopPropagation()}
                aria-label="编辑标题"
                className="w-full bg-white dark:bg-neutral-800 border border-blue-300 dark:border-blue-700 rounded-lg px-2.5 py-1 text-[14px] font-semibold text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            ) : (
              <div className="min-w-0">
                <h2 className="text-[15px] font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                  {displayTitle}
                </h2>
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                  已保存为画布文本卡片 · 关闭预览后保留在画布中
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {showLocateOnCanvas && onLocateOnCanvas && (
              <button
                type="button"
                onClick={() => onLocateOnCanvas(card.id)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-medium text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors cursor-pointer"
              >
                <Crosshair size={13} />
                <span>在画布中查看</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-colors cursor-pointer ${
                isEditing
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200/70 dark:hover:bg-neutral-800'
              }`}
            >
              {isEditing ? <Check size={13} /> : <Edit3 size={13} />}
              <span>{isEditing ? '保存' : '编辑'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200/70 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
              <span>{copied ? '已复制' : '复制'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="关闭文本卡片预览"
              className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-100 hover:bg-neutral-200/70 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5">
          {isEditing ? (
            <textarea
              value={draftContent}
              onChange={e => setDraftContent(e.target.value)}
              onKeyDown={e => e.stopPropagation()}
              aria-label="编辑正文"
              className="w-full min-h-[420px] resize-y bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-700 rounded-xl p-4 text-[13.5px] leading-[1.7] text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          ) : (
            <MarkdownContent content={card.textContent || ''} />
          )}
        </div>
      </motion.div>
    </div>
  );
};
