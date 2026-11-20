import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { MotionValue } from 'motion/react';
import { CardData, getCardSize } from './GenerationCard';
import {
  computeLineageSegment,
  isSameLineageSegment,
  resolveLiveCardPosition,
  type LineageSegment,
  type LiveDragDelta,
  type LiveNanoDragDelta,
} from '../utils/lineageGeometry';

export interface CanvasLineageOverlayProps {
  cards: CardData[];
  selectedCardIds: string[];
  scale?: MotionValue<number>;
}

interface LineageConnection {
  id: string;
  source: CardData;
  target: CardData;
}

interface ConnectionSvgRefs {
  line: SVGLineElement | null;
  startDot: SVGCircleElement | null;
  endDot: SVGCircleElement | null;
}

export const CanvasLineageOverlay: React.FC<CanvasLineageOverlayProps> = React.memo(function CanvasLineageOverlay({
  cards,
  selectedCardIds,
  scale,
}) {
  const nodeMapRef = useRef<Map<string, ConnectionSvgRefs>>(new Map());
  const lastSegmentMapRef = useRef<Map<string, LineageSegment>>(new Map());
  const lastScaleRef = useRef<number | null>(null);

  // ONLY render when cards are actively selected
  const activeSelectedSet = useMemo(() => new Set(selectedCardIds), [selectedCardIds]);

  // Compute upstream connections for selected cards
  const connections = useMemo(() => {
    if (activeSelectedSet.size === 0 || cards.length === 0) return [];

    const cardMap = new Map<string, CardData>();
    const urlToCardIds = new Map<string, string[]>();
    const indexUrl = (url: string | null | undefined, cardId: string) => {
      if (!url) return;
      let list = urlToCardIds.get(url);
      if (!list) {
        list = [];
        urlToCardIds.set(url, list);
      }
      list.push(cardId);
    };
    cards.forEach(c => {
      cardMap.set(c.id, c);
      indexUrl(c.imageUrl, c.id);
      indexUrl(c.originalImageUrl, c.id);
      indexUrl(c.thumbnailUrl, c.id);
    });

    const connMap = new Map<string, LineageConnection>();
    const visited = new Set<string>();

    const traceUpstream = (currCard: CardData) => {
      if (visited.has(currCard.id)) return;
      visited.add(currCard.id);

      // Case 1: The card is forked from a parent card -> connect to parent
      if (currCard.derivedFromId) {
        const parent = cardMap.get(currCard.derivedFromId);
        if (parent) {
          const key = `${parent.id}->${currCard.id}`;
          if (!connMap.has(key)) {
            connMap.set(key, { id: key, source: parent, target: currCard });
          }
          // Recursively trace upstream predecessors
          traceUpstream(parent);
        }
      }

      // Case 2: Reference images
      // If reference images are inherited from the parent card, do not display their lines.
      // If they are newly attached/connected afterwards, display their lines.
      const parentRefIds = new Set<string>();
      if (currCard.derivedFromId) {
        const parent = cardMap.get(currCard.derivedFromId);
        if (parent) {
          if (parent.referenceSourceIds) {
            parent.referenceSourceIds.forEach(id => parentRefIds.add(id));
          }
          if (parent.referenceImages) {
            parent.referenceImages.forEach(r => {
              if (r.sourceCardId) parentRefIds.add(r.sourceCardId);
              if (r.url) {
                const matchedIds = urlToCardIds.get(r.url);
                if (matchedIds) {
                  for (let i = 0; i < matchedIds.length; i++) {
                    if (matchedIds[i] !== parent.id) parentRefIds.add(matchedIds[i]);
                  }
                }
              }
            });
          }
        }
      }

      const refIds = new Set<string>();
      if (currCard.referenceSourceIds) {
        currCard.referenceSourceIds.forEach(id => refIds.add(id));
      }
      if (currCard.referenceImages) {
        currCard.referenceImages.forEach(r => {
          if (r.sourceCardId) {
            refIds.add(r.sourceCardId);
          } else if (r.url) {
            const matchedIds = urlToCardIds.get(r.url);
            const matchedId = matchedIds?.find(id => id !== currCard.id);
            if (matchedId) {
              refIds.add(matchedId);
            }
          }
        });
      }

      if (refIds.size > 0) {
        refIds.forEach(srcId => {
          // If inherited from parent, skip connecting line
          if (parentRefIds.has(srcId)) return;
          // If this source card is the parent itself, the parent->currCard line is already added
          if (currCard.derivedFromId && srcId === currCard.derivedFromId) return;

          const srcCard = cardMap.get(srcId);
          if (srcCard) {
            const key = `${srcCard.id}->${currCard.id}`;
            if (!connMap.has(key)) {
              connMap.set(key, { id: key, source: srcCard, target: currCard });
            }
            // Recursively trace upstream predecessors of the newly referenced card
            traceUpstream(srcCard);
          }
        });
      }
    };

    // Trace upstream lineage for every selected card
    selectedCardIds.forEach(id => {
      const card = cardMap.get(id);
      if (card) {
        traceUpstream(card);
      }
    });

    return Array.from(connMap.values());
  }, [cards, activeSelectedSet, selectedCardIds]);

  const connectionsRef = useRef(connections);
  connectionsRef.current = connections;
  const activeSelectedSetRef = useRef(activeSelectedSet);
  activeSelectedSetRef.current = activeSelectedSet;

  // Keep cached SVG segment coords aligned whenever React commits new connections or card positions
  useLayoutEffect(() => {
    const activeIds = new Set<string>();
    const domDelta = (window as any).__dragDelta as LiveDragDelta | null | undefined;
    const nanoDelta = (window as any).__nanoDragging as LiveNanoDragDelta | null | undefined;

    for (let i = 0; i < connections.length; i++) {
      const conn = connections[i];
      activeIds.add(conn.id);
      const srcDim = getCardSize(conn.source);
      const tgtDim = getCardSize(conn.target);
      const srcPos = resolveLiveCardPosition(conn.source, activeSelectedSet, domDelta, nanoDelta);
      const tgtPos = resolveLiveCardPosition(conn.target, activeSelectedSet, domDelta, nanoDelta);
      const seg = computeLineageSegment(
        { x: srcPos.x, y: srcPos.y, width: srcDim.width, height: srcDim.height },
        { x: tgtPos.x, y: tgtPos.y, width: tgtDim.width, height: tgtDim.height }
      );
      lastSegmentMapRef.current.set(conn.id, seg);
    }

    lastSegmentMapRef.current.forEach((_seg, existingId) => {
      if (!activeIds.has(existingId)) {
        lastSegmentMapRef.current.delete(existingId);
        nodeMapRef.current.delete(existingId);
      }
    });
  }, [connections, activeSelectedSet]);

  // Zero-React-Render live drag synchronization: patch only changed SVG attributes in a single coalesced rAF
  useEffect(() => {
    if (connections.length === 0) return;
    let rafId: number | null = null;

    const patchSvgGeometry = () => {
      const list = connectionsRef.current;
      if (list.length === 0) return;
      const selected = activeSelectedSetRef.current;
      const domDelta = (window as any).__dragDelta as LiveDragDelta | null | undefined;
      const nanoDelta = (window as any).__nanoDragging as LiveNanoDragDelta | null | undefined;

      for (let i = 0; i < list.length; i++) {
        const conn = list[i];
        const refs = nodeMapRef.current.get(conn.id);
        if (!refs) continue;

        const srcDim = getCardSize(conn.source);
        const tgtDim = getCardSize(conn.target);
        const srcPos = resolveLiveCardPosition(conn.source, selected, domDelta, nanoDelta);
        const tgtPos = resolveLiveCardPosition(conn.target, selected, domDelta, nanoDelta);

        const seg = computeLineageSegment(
          { x: srcPos.x, y: srcPos.y, width: srcDim.width, height: srcDim.height },
          { x: tgtPos.x, y: tgtPos.y, width: tgtDim.width, height: tgtDim.height }
        );

        if (isSameLineageSegment(lastSegmentMapRef.current.get(conn.id), seg)) {
          continue;
        }
        lastSegmentMapRef.current.set(conn.id, seg);

        const x1 = String(seg.x1);
        const y1 = String(seg.y1);
        const x2 = String(seg.x2);
        const y2 = String(seg.y2);

        if (refs.line) {
          refs.line.setAttribute('x1', x1);
          refs.line.setAttribute('y1', y1);
          refs.line.setAttribute('x2', x2);
          refs.line.setAttribute('y2', y2);
        }
        if (refs.startDot) {
          refs.startDot.setAttribute('cx', x1);
          refs.startDot.setAttribute('cy', y1);
        }
        if (refs.endDot) {
          refs.endDot.setAttribute('cx', x2);
          refs.endDot.setAttribute('cy', y2);
        }
      }
    };

    const schedulePatch = () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          rafId = null;
          patchSvgGeometry();
        });
      }
    };

    window.addEventListener('card-drag-move', schedulePatch);
    window.addEventListener('nano-dragging', schedulePatch);

    return () => {
      window.removeEventListener('card-drag-move', schedulePatch);
      window.removeEventListener('nano-dragging', schedulePatch);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [connections.length > 0]);

  // Zero-React-Render scale-invariant stroke & dot sizing via direct ref iteration
  useEffect(() => {
    if (!scale || connections.length === 0) return;
    let rafId: number | null = null;
    const syncScaleToSvg = () => {
      const safeScale = Math.max(scale.get() || 1, 0.001);
      if (lastScaleRef.current !== null && Math.abs(lastScaleRef.current - safeScale) < 0.0005) {
        return;
      }
      lastScaleRef.current = safeScale;
      const sw = (1.5 / safeScale).toString();
      const r = (3.5 / safeScale).toString();
      nodeMapRef.current.forEach(refs => {
        if (refs.line) refs.line.setAttribute('stroke-width', sw);
        if (refs.startDot) refs.startDot.setAttribute('r', r);
        if (refs.endDot) refs.endDot.setAttribute('r', r);
      });
    };
    const unsub = scale.on('change', () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          rafId = null;
          syncScaleToSvg();
        });
      }
    });
    return () => {
      unsub();
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [scale, connections.length > 0]);

  if (connections.length === 0) return null;

  const BLUE_COLOR = '#3b82f6';
  const safeScale = Math.max((scale ? scale.get() : 1) || 1, 0.001);
  lastScaleRef.current = safeScale;
  const strokeWidth = 1.5 / safeScale;
  const dotRadius = 3.5 / safeScale;
  const domDelta = (window as any).__dragDelta as LiveDragDelta | null | undefined;
  const nanoDelta = (window as any).__nanoDragging as LiveNanoDragDelta | null | undefined;

  const registerRef = (
    connId: string,
    field: keyof ConnectionSvgRefs,
    el: SVGLineElement | SVGCircleElement | null
  ) => {
    let entry = nodeMapRef.current.get(connId);
    if (!entry) {
      if (!el) return;
      entry = { line: null, startDot: null, endDot: null };
      nodeMapRef.current.set(connId, entry);
    }
    entry[field] = el as any;
    if (!entry.line && !entry.startDot && !entry.endDot) {
      nodeMapRef.current.delete(connId);
    }
  };

  return (
    <svg
      className="absolute inset-0 pointer-events-none overflow-visible z-[6]"
      style={{ width: 1, height: 1 }}
    >
      {connections.map(conn => {
        const { source, target } = conn;
        const srcDim = getCardSize(source);
        const tgtDim = getCardSize(target);

        const srcPos = resolveLiveCardPosition(source, activeSelectedSet, domDelta, nanoDelta);
        const tgtPos = resolveLiveCardPosition(target, activeSelectedSet, domDelta, nanoDelta);

        const seg = computeLineageSegment(
          { x: srcPos.x, y: srcPos.y, width: srcDim.width, height: srcDim.height },
          { x: tgtPos.x, y: tgtPos.y, width: tgtDim.width, height: tgtDim.height }
        );

        return (
          <g key={conn.id}>
            {/* Pure Clean Blue Straight Line (Scale Invariant) */}
            <line
              ref={el => registerRef(conn.id, 'line', el)}
              x1={seg.x1}
              y1={seg.y1}
              x2={seg.x2}
              y2={seg.y2}
              stroke={BLUE_COLOR}
              strokeWidth={strokeWidth}
            />

            {/* Start Circular Dot (Scale Invariant) */}
            <circle
              ref={el => registerRef(conn.id, 'startDot', el)}
              cx={seg.x1}
              cy={seg.y1}
              r={dotRadius}
              fill={BLUE_COLOR}
            />

            {/* End Circular Dot (Scale Invariant) */}
            <circle
              ref={el => registerRef(conn.id, 'endDot', el)}
              cx={seg.x2}
              cy={seg.y2}
              r={dotRadius}
              fill={BLUE_COLOR}
            />
          </g>
        );
      })}
    </svg>
  );
});
