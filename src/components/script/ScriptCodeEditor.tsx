import React, { useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react';
import { EditorState, StateEffect, StateField, Range, Compartment } from '@codemirror/state';
import { EditorView, Decoration, DecorationSet, WidgetType, placeholder as cmPlaceholder, keymap } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { ScriptAnnotation } from '../../types/script';

export interface ScriptSelectionChange {
  text: string;
  start: number;
  end: number;
  lineStart: number;
  lineEnd: number;
}

export interface ScriptCodeEditorRef {
  scrollToOffset: (
    offset: number,
    options?: {
      behavior?: 'auto' | 'smooth';
      center?: boolean;
      select?: boolean;
      selectLength?: number;
    }
  ) => void;
  scrollToTop: (top: number) => void;
  getScrollTop: () => number;
  focus: () => void;
  getSelection: () => { start: number; end: number };
  setSelection: (start: number, end: number) => void;
  getEditorView: () => EditorView | null;
}

export interface ScriptCodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  annotations?: ScriptAnnotation[];
  activeAnnotationId?: string | null;
  onSelectionChange?: (selection: ScriptSelectionChange | null) => void;
  onCursorMove?: (offset: number) => void;
  onScroll?: (scrollTop: number) => void;
  onEscape?: () => void;
  onAnnotationClick?: (annotation: ScriptAnnotation) => void;
  className?: string;
}

class AnnotationBadgeWidget extends WidgetType {
  constructor(
    readonly badgeText: string,
    readonly category: string,
    readonly tooltip?: string,
    readonly onClick?: () => void
  ) {
    super();
  }

  toDOM() {
    const span = document.createElement('span');
    span.className = `cm-annotation-badge cm-badge-${this.category}`;
    span.textContent = this.badgeText;
    if (this.tooltip) {
      span.title = this.tooltip;
    }
    if (this.onClick) {
      span.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.onClick?.();
      };
    }
    return span;
  }

  ignoreEvent(event: Event) {
    if (event.type === 'click' || event.type === 'mousedown') {
      return false;
    }
    return true;
  }
}

// StateEffects to update annotations dynamically without re-initializing editor state
const setAnnotationsEffect = StateEffect.define<{
  annotations: ScriptAnnotation[];
  activeId: string | null;
}>();

const createDecorationRanges = (
  annotations: ScriptAnnotation[],
  activeId: string | null,
  docLength: number
): Range<Decoration>[] => {
  const ranges: Range<Decoration>[] = [];

  for (const ann of annotations) {
    const from = Math.max(0, Math.min(ann.from, docLength));
    const to = Math.max(from, Math.min(ann.to, docLength));

    if (to > from) {
      const isActive = ann.id === activeId || ann.active;
      let className = '';

      switch (ann.category) {
        case 'provenance':
          className = isActive
            ? 'cm-provenance-highlight-active'
            : 'cm-provenance-highlight';
          break;
        case 'character':
          className = isActive
            ? 'cm-character-highlight-active'
            : 'cm-character-highlight';
          break;
        case 'location':
          className = isActive
            ? 'cm-location-highlight-active'
            : 'cm-location-highlight';
          break;
        case 'prop':
          className = isActive
            ? 'cm-prop-highlight-active'
            : 'cm-prop-highlight';
          break;
        case 'search':
          className = isActive
            ? 'cm-search-highlight-active'
            : 'cm-search-highlight';
          break;
        default:
          className = isActive
            ? 'cm-provenance-highlight-active'
            : 'cm-provenance-highlight';
      }

      const markDeco = Decoration.mark({ class: className });
      ranges.push(markDeco.range(from, to));

      if (ann.badgeText) {
        const widgetDeco = Decoration.widget({
          widget: new AnnotationBadgeWidget(ann.badgeText, ann.category, ann.badgeTooltip, ann.onClick),
          side: 1,
        });
        ranges.push(widgetDeco.range(to, to));
      }
    }
  }

  return ranges;
};

const annotationsField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(decorations, tr) {
    for (const effect of tr.effects) {
      if (effect.is(setAnnotationsEffect)) {
        const ranges = createDecorationRanges(
          effect.value.annotations,
          effect.value.activeId,
          tr.newDoc.length
        );
        return Decoration.set(ranges, true);
      }
    }
    return decorations.map(tr.changes);
  },
  provide: (field) => EditorView.decorations.from(field),
});

export const ScriptCodeEditor = forwardRef<ScriptCodeEditorRef, ScriptCodeEditorProps>(
  (
    {
      value,
      onChange,
      readOnly = false,
      placeholder = '在此直接输入或粘贴剧本正文...',
      annotations = [],
      activeAnnotationId = null,
      onSelectionChange,
      onCursorMove,
      onScroll,
      onEscape,
      onAnnotationClick,
      className = '',
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const viewRef = useRef<EditorView | null>(null);
    const readOnlyCompartmentRef = useRef(new Compartment());
    const isDispatchingFromPropsRef = useRef(false);

    // Callbacks refs to avoid stale closures in update listeners
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;
    const onSelectionChangeRef = useRef(onSelectionChange);
    onSelectionChangeRef.current = onSelectionChange;
    const onCursorMoveRef = useRef(onCursorMove);
    onCursorMoveRef.current = onCursorMove;
    const onScrollRef = useRef(onScroll);
    onScrollRef.current = onScroll;
    const onEscapeRef = useRef(onEscape);
    onEscapeRef.current = onEscape;
    const onAnnotationClickRef = useRef(onAnnotationClick);
    onAnnotationClickRef.current = onAnnotationClick;
    const annotationsRef = useRef(annotations);
    annotationsRef.current = annotations;

    useImperativeHandle(
      ref,
      () => ({
        scrollToOffset: (offset, options) => {
          const view = viewRef.current;
          if (!view) return;
          const pos = Math.max(0, Math.min(offset, view.state.doc.length));

          if (options?.select && options.selectLength && options.selectLength > 0) {
            const endPos = Math.min(view.state.doc.length, pos + options.selectLength);
            view.dispatch({
              selection: { anchor: pos, head: endPos },
              effects: EditorView.scrollIntoView(pos, {
                y: options?.center ? 'center' : 'nearest',
                yMargin: 80,
              }),
            });
          } else {
            view.dispatch({
              selection: { anchor: pos, head: pos },
              effects: EditorView.scrollIntoView(pos, {
                y: options?.center ? 'center' : 'nearest',
                yMargin: 80,
              }),
            });
          }
        },
        scrollToTop: (top) => {
          const view = viewRef.current;
          if (!view) return;
          view.scrollDOM.scrollTop = top;
        },
        getScrollTop: () => {
          return viewRef.current ? viewRef.current.scrollDOM.scrollTop : 0;
        },
        focus: () => {
          viewRef.current?.focus();
        },
        getSelection: () => {
          if (!viewRef.current) return { start: 0, end: 0 };
          const main = viewRef.current.state.selection.main;
          return { start: main.from, end: main.to };
        },
        setSelection: (start, end) => {
          const view = viewRef.current;
          if (!view) return;
          const from = Math.max(0, Math.min(start, view.state.doc.length));
          const to = Math.max(from, Math.min(end, view.state.doc.length));
          view.dispatch({
            selection: { anchor: from, head: to },
          });
        },
        getEditorView: () => viewRef.current,
      }),
      []
    );

    // Initialize EditorView
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const initialRanges = createDecorationRanges(annotations, activeAnnotationId, value.length);

      const baseTheme = EditorView.theme({
        '&': {
          height: '100%',
          backgroundColor: 'transparent',
          fontSize: '14px',
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
          color: 'inherit',
          outline: 'none',
        },
        '.cm-scroller': {
          fontFamily: 'inherit',
          padding: '16px 17px 16px 22px',
          overflowY: 'auto',
          overflowX: 'hidden',
          lineHeight: '1.625',
        },
        '.cm-content': {
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          minHeight: '100%',
          caretColor: '#3b82f6',
        },
        '.cm-line': {
          padding: '0',
          fontWeight: '500',
        },
        '&.cm-focused .cm-cursor': {
          borderLeftColor: '#3b82f6',
        },
        '&.cm-focused .cm-selectionBackground, ::selection': {
          backgroundColor: 'rgba(59, 130, 246, 0.25) !important',
        },
        '.cm-placeholder': {
          color: 'rgba(156, 163, 175, 0.7)',
          fontStyle: 'normal',
        },
        // Provenance annotations: clean, non-conflicting, comfortable highlight
        '.cm-provenance-highlight': {
          backgroundColor: 'rgba(59, 130, 246, 0.20)',
          borderRadius: '3px',
          boxShadow: '0 0 0 1.5px rgba(59, 130, 246, 0.35)',
          color: 'inherit !important',
          transition: 'background-color 150ms ease, box-shadow 150ms ease',
        },
        '.cm-provenance-highlight-active': {
          backgroundColor: 'rgba(59, 130, 246, 0.30)',
          borderRadius: '3px',
          boxShadow: '0 0 0 1.5px rgba(59, 130, 246, 0.65)',
          fontWeight: '600',
          color: 'inherit !important',
          transition: 'background-color 150ms ease, box-shadow 150ms ease',
        },
        // Asset types annotations (Character, Location, Prop)
        '.cm-character-highlight': {
          backgroundColor: 'rgba(168, 85, 247, 0.18)',
          borderRadius: '3px',
          boxShadow: '0 0 0 1.5px rgba(168, 85, 247, 0.35)',
          color: 'inherit !important',
        },
        '.cm-character-highlight-active': {
          backgroundColor: 'rgba(168, 85, 247, 0.34)',
          borderRadius: '3px',
          boxShadow: '0 0 0 2px rgba(168, 85, 247, 0.75)',
          fontWeight: '600',
          color: 'inherit !important',
        },
        '.cm-location-highlight': {
          backgroundColor: 'rgba(16, 185, 129, 0.18)',
          borderRadius: '3px',
          boxShadow: '0 0 0 1.5px rgba(16, 185, 129, 0.35)',
          color: 'inherit !important',
        },
        '.cm-location-highlight-active': {
          backgroundColor: 'rgba(16, 185, 129, 0.34)',
          borderRadius: '3px',
          boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.75)',
          fontWeight: '600',
          color: 'inherit !important',
        },
        '.cm-prop-highlight': {
          backgroundColor: 'rgba(245, 158, 11, 0.18)',
          borderRadius: '3px',
          boxShadow: '0 0 0 1.5px rgba(245, 158, 11, 0.35)',
          color: 'inherit !important',
        },
        '.cm-prop-highlight-active': {
          backgroundColor: 'rgba(245, 158, 11, 0.34)',
          borderRadius: '3px',
          boxShadow: '0 0 0 2px rgba(245, 158, 11, 0.75)',
          fontWeight: '600',
          color: 'inherit !important',
        },
        '.cm-search-highlight': {
          backgroundColor: 'rgba(234, 179, 8, 0.25)',
          borderRadius: '2px',
        },
        '.cm-search-highlight-active': {
          backgroundColor: 'rgba(234, 179, 8, 0.45)',
          borderRadius: '2px',
          boxShadow: '0 0 0 1.5px rgba(234, 179, 8, 0.8)',
          fontWeight: '600',
        },
        // Inline squircle badge widget styling
        '.cm-annotation-badge': {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px',
          fontWeight: '700',
          lineHeight: '1',
          padding: '1.5px 5px',
          borderRadius: '9999px',
          marginLeft: '4px',
          marginRight: '2px',
          verticalAlign: 'middle',
          userSelect: 'none',
          pointerEvents: 'auto',
          cursor: 'pointer',
          boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
          transition: 'transform 120ms ease, background-color 150ms ease',
        },
        '.cm-annotation-badge:hover': {
          transform: 'scale(1.15)',
        },
        '.cm-annotation-badge:active': {
          transform: 'scale(0.95)',
        },
        '.cm-badge-provenance': {
          backgroundColor: 'rgba(59, 130, 246, 0.22)',
          color: '#3b82f6',
          border: '1px solid rgba(59, 130, 246, 0.4)',
        },
        '.cm-badge-character': {
          backgroundColor: 'rgba(168, 85, 247, 0.22)',
          color: '#a855f7',
          border: '1px solid rgba(168, 85, 247, 0.4)',
        },
        '.cm-badge-location': {
          backgroundColor: 'rgba(16, 185, 129, 0.22)',
          color: '#10b981',
          border: '1px solid rgba(16, 185, 129, 0.4)',
        },
        '.cm-badge-prop': {
          backgroundColor: 'rgba(245, 158, 11, 0.22)',
          color: '#f59e0b',
          border: '1px solid rgba(245, 158, 11, 0.4)',
        },
      });

      const updateListener = EditorView.updateListener.of((update) => {
        if (update.docChanged && !isDispatchingFromPropsRef.current) {
          const newDoc = update.state.doc.toString();
          onChangeRef.current?.(newDoc);
        }

        if (update.selectionSet || update.docChanged) {
          const main = update.state.selection.main;
          if (main.empty) {
            onCursorMoveRef.current?.(main.head);
            onSelectionChangeRef.current?.(null);
          } else {
            const doc = update.state.doc;
            const text = doc.sliceString(main.from, main.to);
            const lineStart = doc.lineAt(main.from).number;
            const lineEnd = doc.lineAt(main.to).number;
            onSelectionChangeRef.current?.({
              text,
              start: main.from,
              end: main.to,
              lineStart,
              lineEnd,
            });
          }
        }
      });

      const state = EditorState.create({
        doc: value,
        extensions: [
          history(),
          keymap.of([
            {
              key: 'Escape',
              run: () => {
                if (onEscapeRef.current) {
                  onEscapeRef.current();
                  return true;
                }
                return false;
              },
            },
            ...defaultKeymap,
            ...historyKeymap,
          ]),
          EditorView.lineWrapping,
          readOnlyCompartmentRef.current.of(EditorState.readOnly.of(readOnly)),
          cmPlaceholder(placeholder),
          baseTheme,
          annotationsField,
          EditorView.domEventHandlers({
            click(event, view) {
              const pos = view.posAtCoords({ x: event.clientX, y: event.clientY });
              if (pos !== null) {
                const hit = annotationsRef.current.find(a => pos >= a.from && pos <= a.to);
                if (hit) {
                  hit.onClick?.();
                  onAnnotationClickRef.current?.(hit);
                }
              }
              return false;
            },
          }),
          updateListener,
        ],
      });

      const view = new EditorView({
        state,
        parent: container,
      });

      // Apply initial decorations
      if (initialRanges.length > 0) {
        view.dispatch({
          effects: setAnnotationsEffect.of({
            annotations,
            activeId: activeAnnotationId,
          }),
        });
      }

      const handleScroll = () => {
        onScrollRef.current?.(view.scrollDOM.scrollTop);
      };
      view.scrollDOM.addEventListener('scroll', handleScroll, { passive: true });

      viewRef.current = view;

      return () => {
        view.scrollDOM.removeEventListener('scroll', handleScroll);
        view.destroy();
        viewRef.current = null;
      };
    }, []); // Run on mount only

    // Sync external value changes
    useEffect(() => {
      const view = viewRef.current;
      if (!view) return;
      const currentDoc = view.state.doc.toString();
      if (currentDoc !== value) {
        isDispatchingFromPropsRef.current = true;
        view.dispatch({
          changes: { from: 0, to: currentDoc.length, insert: value },
        });
        isDispatchingFromPropsRef.current = false;
      }
    }, [value]);

    // Sync readOnly changes
    useEffect(() => {
      const view = viewRef.current;
      if (!view) return;
      view.dispatch({
        effects: readOnlyCompartmentRef.current.reconfigure(EditorState.readOnly.of(readOnly)),
      });
    }, [readOnly]);

    // Sync annotations and activeAnnotationId
    useEffect(() => {
      const view = viewRef.current;
      if (!view) return;
      view.dispatch({
        effects: setAnnotationsEffect.of({
          annotations,
          activeId: activeAnnotationId,
        }),
      });
    }, [annotations, activeAnnotationId]);

    return (
      <div
        ref={containerRef}
        data-agent-target="script.text"
        className={`script-code-editor-root relative w-full h-full flex-1 overflow-hidden select-text text-gray-800 dark:text-neutral-300 ${className}`}
      />
    );
  }
);

ScriptCodeEditor.displayName = 'ScriptCodeEditor';
