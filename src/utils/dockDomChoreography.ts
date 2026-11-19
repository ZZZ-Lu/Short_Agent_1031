import type {
  DockPanelLayout,
  PanelWidthTransitionMeta,
} from './scriptBibleDockLayout';

export interface DockPanelDomRefs {
  shell: HTMLDivElement | null;
  card: HTMLDivElement | null;
  expandedContent: HTMLDivElement | null;
  miniContent: HTMLButtonElement | null;
}

export function createEmptyDockPanelDomRefs(): DockPanelDomRefs {
  return {
    shell: null,
    card: null,
    expandedContent: null,
    miniContent: null,
  };
}

/**
 * Render-adapter helper (one-way pure-data -> DOM):
 * Applies a pure PanelWidthTransitionMeta frame directly to a dock panel's DOM refs
 * so Stage 1 fade-out, Stage 2A subtree suspension, Stage 2B glide degradation, and
 * Stage 3B staggered reveal execute with ZERO React re-renders during motion.
 */
export function applyDockPanelMetaToDom(
  refs: DockPanelDomRefs,
  meta: PanelWidthTransitionMeta,
  options?: {
    /** During Stage 2A/2B before a collapsing panel unmounts in Stage 3A, suspend its subtree via content-visibility: hidden */
    suspendHiddenExpanded?: boolean;
  }
): void {
  const { shell, card, expandedContent, miniContent } = refs;

  if (shell) {
    if (meta.isGliding) {
      shell.setAttribute('data-dock-gliding', 'true');
      shell.style.willChange = 'transform';
    } else {
      shell.removeAttribute('data-dock-gliding');
      shell.style.willChange = '';
    }
  }

  if (card) {
    if (meta.isGliding) {
      card.setAttribute('data-dock-gliding', 'true');
    } else {
      card.removeAttribute('data-dock-gliding');
    }
  }

  if (expandedContent) {
    const shouldSuspend =
      meta.suspendSubtree ||
      Boolean(options?.suspendHiddenExpanded && meta.hidden);

    expandedContent.style.transition =
      meta.fadeDurationMs > 0
        ? `opacity ${meta.fadeDurationMs}ms ease-out`
        : 'none';
    expandedContent.style.opacity = String(meta.opacity);
    expandedContent.style.visibility = meta.hidden ? 'hidden' : 'visible';
    expandedContent.style.contentVisibility = shouldSuspend ? 'hidden' : 'visible';
    expandedContent.style.pointerEvents =
      meta.opacity < 1 || meta.hidden || shouldSuspend ? 'none' : '';

    if (meta.frozenWidth != null) {
      const px = `${meta.frozenWidth}px`;
      expandedContent.style.width = px;
      expandedContent.style.minWidth = px;
      expandedContent.style.maxWidth = px;
      expandedContent.style.flexShrink = '0';
    } else {
      expandedContent.style.width = '';
      expandedContent.style.minWidth = '';
      expandedContent.style.maxWidth = '';
      expandedContent.style.flexShrink = '';
    }
  }

  if (miniContent) {
    miniContent.style.transition =
      meta.fadeDurationMs > 0
        ? `opacity ${meta.fadeDurationMs}ms ease-out`
        : 'none';
    miniContent.style.opacity = String(meta.miniOpacity);
    miniContent.style.visibility = meta.miniHidden ? 'hidden' : 'visible';
    miniContent.style.pointerEvents =
      meta.miniOpacity < 1 || meta.miniHidden ? 'none' : '';
  }
}

/**
 * Applies pure DockPanelLayout geometry directly to the outer positioning shell
 * during Stage 2B so all 3 outer shells glide on the GPU compositor with zero React commits.
 */
export function applyDockPanelLayoutToShell(
  refs: DockPanelDomRefs,
  layout: DockPanelLayout
): void {
  const { shell } = refs;
  if (!shell) return;
  shell.style.transform = `translate3d(${layout.left}px, 0, 0)`;
  shell.style.width = `${layout.width}px`;
  shell.style.height = `${layout.height}px`;
  shell.style.zIndex = String(layout.zIndex);
  shell.style.maxWidth = layout.expanded ? `${layout.maxWidth}px` : '';
}

/**
 * Clears transient choreography overrides once all fade-ins have settled so
 * elements cleanly return to React's idle styles without triggering a React render.
 */
export function clearDockPanelDomOverrides(refs: DockPanelDomRefs): void {
  const { shell, card, expandedContent, miniContent } = refs;

  if (shell) {
    shell.removeAttribute('data-dock-gliding');
    shell.style.willChange = '';
  }
  if (card) {
    card.removeAttribute('data-dock-gliding');
  }
  if (expandedContent) {
    expandedContent.style.transition = '';
    expandedContent.style.opacity = '';
    expandedContent.style.visibility = '';
    expandedContent.style.contentVisibility = '';
    expandedContent.style.pointerEvents = '';
    expandedContent.style.width = '';
    expandedContent.style.minWidth = '';
    expandedContent.style.maxWidth = '';
    expandedContent.style.flexShrink = '';
  }
  if (miniContent) {
    miniContent.style.transition = '';
    miniContent.style.opacity = '';
    miniContent.style.visibility = '';
    miniContent.style.pointerEvents = '';
  }
}
