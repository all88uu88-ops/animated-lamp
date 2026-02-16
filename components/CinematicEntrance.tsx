
import React, { useEffect, useState, useRef } from 'react';

interface CinematicEntranceProps {
  children: React.ReactNode;
  active: boolean;
  viewKey: string;
}

/**
 * CinematicEntrance
 * 
 * Provides a studio-grade entrance animation for views.
 * Adheres to strict performance rules: GPU-accelerated (transform/opacity),
 * no layout shifts, no transition:all, will-change optimized.
 */
const CinematicEntrance: React.FC<CinematicEntranceProps> = ({ children, active, viewKey }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const animationTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;

    // Trigger animation state
    setIsAnimating(true);

    // Clear previous timer if view changes rapidly
    if (animationTimerRef.current) {
      window.clearTimeout(animationTimerRef.current);
    }

    // Reset animation state after duration
    animationTimerRef.current = window.setTimeout(() => {
      setIsAnimating(false);
      animationTimerRef.current = null;
    }, 500);

    return () => {
      if (animationTimerRef.current) window.clearTimeout(animationTimerRef.current);
    };
  }, [viewKey, active]);

  if (!active) {
    return <div className="w-full h-full">{children}</div>;
  }

  return (
    <div 
      key={viewKey}
      className={`relative w-full h-full transform-gpu ${isAnimating ? 'animate-cinematic-entrance' : 'opacity-100'}`}
    >
      {/* Light Reveal Sweep Overlay */}
      {isAnimating && (
        <div className="absolute inset-0 z-[100] pointer-events-none overflow-hidden rounded-[2rem]">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent -translate-x-full animate-cinematic-sweep"></div>
        </div>
      )}
      
      {/* View Content */}
      <div className="w-full h-full will-change-[transform,opacity]">
        {children}
      </div>

      <style>{`
        @keyframes cinematic-entrance-frames {
          0% {
            opacity: 0;
            transform: translateY(8px) scale(0.995);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes cinematic-sweep-frames {
          0% {
            transform: translateX(-100%) skewX(-15deg);
          }
          100% {
            transform: translateX(200%) skewX(-15deg);
          }
        }

        .animate-cinematic-entrance {
          animation: cinematic-entrance-frames 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .animate-cinematic-sweep {
          animation: cinematic-sweep-frames 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default CinematicEntrance;
