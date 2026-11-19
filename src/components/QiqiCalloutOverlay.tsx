import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { computeQiqiCalloutPosition } from '../utils/rightClickGesture';

export interface QiqiCalloutState {
  id: number;
  x: number;
  y: number;
}

interface QiqiCalloutOverlayProps {
  callout: QiqiCalloutState | null;
  isDarkMode: boolean;
}

/**
 * Pure kinetic-typography "七七" megaphone callout anchored at the top-right of the user's cursor.
 * Starts moving immediately on trigger with zero pre-pause: two "七" syllables squeeze out
 * sequentially from the narrow nozzle, fan apart in megaphone perspective (smaller near mouth,
 * larger further out), expand dramatically, and softly blur/dissipate into air.
 */
export function QiqiCalloutOverlay({ callout, isDarkMode }: QiqiCalloutOverlayProps) {
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1440;
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 900;

  return (
    <AnimatePresence>
      {callout && (() => {
        const pos = computeQiqiCalloutPosition({
          x: callout.x,
          y: callout.y,
          viewportWidth,
          viewportHeight,
          calloutWidth: 84,
          calloutHeight: 54,
        });
        // Nozzle anchor sits at bottom-left of the callout box (right next to top-right of cursor)
        const nozzleLeft = pos.flippedBelow ? pos.left : Math.max(10, Math.min(callout.x + 8, viewportWidth - 94));
        const nozzleTop = pos.flippedBelow ? pos.top : Math.max(54, Math.min(callout.y - 8, viewportHeight - 16));
        const yDir = pos.flippedBelow ? 1 : -1;

        const textColorClass = isDarkMode ? 'text-[#c084fc]' : 'text-[#8b5cf6]';
        const textShadow = isDarkMode
          ? '0 2px 10px rgba(0, 0, 0, 0.65), 0 0 12px rgba(192, 132, 252, 0.28)'
          : '0 1px 8px rgba(255, 255, 255, 0.95), 0 2px 10px rgba(139, 92, 246, 0.22)';

        return (
          <div
            key={callout.id}
            data-testid="qiqi-callout-overlay"
            data-callout-phase="calling"
            style={{
              left: nozzleLeft,
              top: nozzleTop,
            }}
            className="fixed z-[10000] pointer-events-none select-none overflow-visible"
          >
            {/* Two "七" characters squeeze out sequentially from the nozzle immediately on trigger,
                forming a natural megaphone perspective cone, expanding and dissipating */}
            <span className="relative inline-block overflow-visible">
              {/* Leading "七" (shoots out immediately at t=0 -> travels further top-right & swells bigger) */}
              <motion.span
                key={`call-lead-${callout.id}`}
                initial={{
                  opacity: 0.9,
                  x: 0,
                  y: 0,
                  scaleX: 0.34,
                  scaleY: 0.52,
                  rotate: 18 * yDir,
                  filter: 'blur(0px)',
                }}
                animate={{
                  opacity: [0.95, 1, 1, 0.82, 0],
                  x: [0, 12, 27, 40, 52],
                  y: [0, 10 * yDir, 22 * yDir, 33 * yDir, 44 * yDir],
                  scaleX: [0.34, 1.24, 1.62, 1.98, 2.35],
                  scaleY: [0.52, 0.92, 1.56, 1.94, 2.28],
                  rotate: [18 * yDir, 8 * yDir, 6 * yDir, 4 * yDir, 2 * yDir],
                  filter: ['blur(0px)', 'blur(0px)', 'blur(0px)', 'blur(0.8px)', 'blur(3px)'],
                }}
                transition={{
                  duration: 0.86,
                  times: [0, 0.16, 0.42, 0.72, 1],
                  ease: [0.16, 1, 0.3, 1],
                }}
                style={{
                  transformOrigin: '0% 100%',
                  willChange: 'transform, opacity, filter',
                  textShadow,
                }}
                className={`absolute left-0 bottom-0 inline-block text-[15px] font-black leading-none whitespace-nowrap ${textColorClass}`}
              >
                七
              </motion.span>

              {/* Trailing "七" (squeezes out 80ms later -> stays closer to mouth, slightly smaller, creating megaphone cone depth) */}
              <motion.span
                key={`call-trail-${callout.id}`}
                initial={{
                  opacity: 0,
                  x: -1,
                  y: 1 * -yDir,
                  scaleX: 0.32,
                  scaleY: 0.5,
                  rotate: 20 * yDir,
                  filter: 'blur(0px)',
                }}
                animate={{
                  opacity: [0, 1, 1, 0.78, 0],
                  x: [-1, 5, 11, 17, 23],
                  y: [0, 5 * yDir, 11 * yDir, 17 * yDir, 24 * yDir],
                  scaleX: [0.32, 1.12, 1.26, 1.48, 1.72],
                  scaleY: [0.5, 0.84, 1.24, 1.46, 1.68],
                  rotate: [20 * yDir, 13 * yDir, 11 * yDir, 9 * yDir, 7 * yDir],
                  filter: ['blur(0px)', 'blur(0px)', 'blur(0px)', 'blur(0.7px)', 'blur(2.6px)'],
                }}
                transition={{
                  duration: 0.82,
                  delay: 0.08,
                  times: [0, 0.18, 0.44, 0.74, 1],
                  ease: [0.16, 1, 0.3, 1],
                }}
                style={{
                  transformOrigin: '0% 100%',
                  willChange: 'transform, opacity, filter',
                  textShadow,
                }}
                className={`absolute left-0 bottom-0 inline-block text-[15px] font-black leading-none whitespace-nowrap ${textColorClass}`}
              >
                七
              </motion.span>
            </span>
          </div>
        );
      })()}
    </AnimatePresence>
  );
}
