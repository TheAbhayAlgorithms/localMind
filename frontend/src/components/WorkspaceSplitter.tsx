import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

interface WorkspaceSplitterProps {
  containerRef: React.RefObject<HTMLDivElement>;
}

export const WorkspaceSplitter: React.FC<WorkspaceSplitterProps> = ({ containerRef }) => {
  const setSplitRatio = useAppStore((state) => state.setSplitRatio);
  const resetSplitRatio = useAppStore((state) => state.resetSplitRatio);

  const [isSliding, setIsSliding] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Mouse slide drag handler
  useEffect(() => {
    if (!isSliding) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const rawX = e.clientX - rect.left;
      const newPercent = (rawX / rect.width) * 100;
      setSplitRatio(newPercent);
    };

    const handleMouseUp = () => {
      setIsSliding(false);
      window.dispatchEvent(new Event('resize'));
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isSliding, containerRef, setSplitRatio]);

  // Touch slide handler (for tablets/touchscreens)
  useEffect(() => {
    if (!isSliding) return;

    const handleTouchMove = (e: TouchEvent) => {
      if (!containerRef.current || e.touches.length === 0) return;
      const rect = containerRef.current.getBoundingClientRect();
      const rawX = e.touches[0].clientX - rect.left;
      const newPercent = (rawX / rect.width) * 100;
      setSplitRatio(newPercent);
    };

    const handleTouchEnd = () => {
      setIsSliding(false);
      window.dispatchEvent(new Event('resize'));
    };

    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isSliding, containerRef, setSplitRatio]);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={() => setIsSliding(true)}
      onTouchStart={() => setIsSliding(true)}
      onDoubleClick={resetSplitRatio}
      className="hidden lg:flex relative items-center justify-center shrink-0 w-2 mx-0.5 cursor-col-resize select-none group z-20 h-full"
      title="Slide left or right to adjust window widths (Double-click to reset 50:50)"
    >
      {/* Slim Vertical Divider Line */}
      <div
        className={`w-[2px] h-full transition-colors duration-150 rounded-full ${
          isSliding
            ? 'bg-[#007AFF]'
            : isHovered
            ? 'bg-[#007AFF]/60'
            : 'bg-black/[0.08]'
        }`}
      />

      {/* Sleek Minimalist Sliding Grip Bar */}
      <div
        className={`absolute top-1/2 -translate-y-1/2 w-1.5 h-10 rounded-full transition-all duration-150 flex flex-col items-center justify-center gap-1 ${
          isSliding
            ? 'h-12 w-2 bg-[#007AFF] shadow-[0_0_8px_rgba(0,122,255,0.6)]'
            : isHovered
            ? 'h-11 w-1.5 bg-[#007AFF] shadow-xs'
            : 'bg-[#C7C7CC] group-hover:bg-[#007AFF]'
        }`}
      >
        <span className="w-0.5 h-0.5 rounded-full bg-white opacity-90" />
        <span className="w-0.5 h-0.5 rounded-full bg-white opacity-90" />
        <span className="w-0.5 h-0.5 rounded-full bg-white opacity-90" />
      </div>

      {/* Global Transparent Drag Overlay to prevent iframe/Monaco event capturing */}
      {isSliding && (
        <div className="fixed inset-0 z-50 cursor-col-resize select-none bg-transparent" />
      )}
    </div>
  );
};
