import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

interface WorkspaceSplitterProps {
  containerRef: React.RefObject<HTMLDivElement>;
}

export const WorkspaceSplitter: React.FC<WorkspaceSplitterProps> = ({ containerRef }) => {
  const splitRatio = useAppStore((state) => state.splitRatio);
  const setSplitRatio = useAppStore((state) => state.setSplitRatio);
  const adjustSplitRatio = useAppStore((state) => state.adjustSplitRatio);
  const resetSplitRatio = useAppStore((state) => state.resetSplitRatio);

  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Dragging interaction logic across both windows
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const rawX = e.clientX - rect.left;
      const newPercent = (rawX / rect.width) * 100;
      setSplitRatio(newPercent);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
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
  }, [isDragging, containerRef, setSplitRatio]);

  // Touch drag support
  useEffect(() => {
    if (!isDragging) return;

    const handleTouchMove = (e: TouchEvent) => {
      if (!containerRef.current || e.touches.length === 0) return;
      const rect = containerRef.current.getBoundingClientRect();
      const rawX = e.touches[0].clientX - rect.left;
      const newPercent = (rawX / rect.width) * 100;
      setSplitRatio(newPercent);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      window.dispatchEvent(new Event('resize'));
    };

    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, containerRef, setSplitRatio]);

  // Preset toggle cycle on clicking the center pill: 50/50 -> 70/30 -> 30/70 -> 50/50
  const handleTogglePresets = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (Math.abs(splitRatio - 50) < 4) {
      setSplitRatio(70); // Code focus
    } else if (splitRatio >= 65) {
      setSplitRatio(30); // Terminal focus
    } else {
      setSplitRatio(50); // Balanced 50/50
    }
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={() => setIsDragging(true)}
      onTouchStart={() => setIsDragging(true)}
      onDoubleClick={resetSplitRatio}
      className={`hidden lg:flex relative items-center justify-center shrink-0 w-3.5 mx-0.5 cursor-col-resize select-none transition-colors group z-20 ${
        isDragging ? 'bg-[#007AFF]/10' : 'hover:bg-black/[0.04]'
      }`}
      title="Drag to resize windows, or click toggle buttons to increase/decrease width"
    >
      {/* Subtle Divider Track */}
      <div
        className={`w-[2px] h-full transition-all duration-150 rounded-full ${
          isDragging
            ? 'bg-[#007AFF] shadow-[0_0_10px_rgba(0,122,255,0.7)]'
            : isHovered
            ? 'bg-[#007AFF]/60'
            : 'bg-black/[0.08]'
        }`}
      />

      {/* Floating Center Toggle Pill */}
      <div
        className={`absolute top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 p-1 bg-[#FFFFFF] border rounded-2xl shadow-md transition-all duration-200 cursor-default ${
          isDragging || isHovered
            ? 'scale-105 border-[#007AFF]/60 shadow-xl'
            : 'border-black/[0.08] opacity-85 hover:opacity-100'
        }`}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Toggle Left Button (Shrink Code, Expand Terminal) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            adjustSplitRatio(-10);
          }}
          disabled={splitRatio <= 20}
          aria-label="Decrease Code Width / Increase Terminal Width"
          title="Decrease Code / Increase Terminal width (-10%)"
          className="p-1 rounded-lg text-[#4B5563] hover:text-[#007AFF] hover:bg-[#F5F5F7] disabled:opacity-25 disabled:hover:bg-transparent disabled:cursor-not-allowed transition"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Center Toggle Preset & Ratio Indicator */}
        <button
          onClick={handleTogglePresets}
          onDoubleClick={(e) => {
            e.stopPropagation();
            resetSplitRatio();
          }}
          aria-label="Toggle Width Presets"
          title="Click to cycle width presets: 50:50, 70:30, 30:70. Double-click to reset."
          className="px-1.5 py-1 text-[10px] font-mono font-bold rounded-lg text-[#1D1D1F] hover:text-[#007AFF] bg-[#F5F5F7] hover:bg-[#E5E5EA] border border-black/[0.05] transition flex flex-col items-center leading-none gap-0.5"
        >
          <span>{Math.round(splitRatio)}</span>
          <span className="text-[8px] text-[#86868B] font-normal">/</span>
          <span>{Math.round(100 - splitRatio)}</span>
        </button>

        {/* Toggle Right Button (Expand Code, Shrink Terminal) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            adjustSplitRatio(10);
          }}
          disabled={splitRatio >= 80}
          aria-label="Increase Code Width / Decrease Terminal Width"
          title="Increase Code / Decrease Terminal width (+10%)"
          className="p-1 rounded-lg text-[#4B5563] hover:text-[#007AFF] hover:bg-[#F5F5F7] disabled:opacity-25 disabled:hover:bg-transparent disabled:cursor-not-allowed transition"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Global Transparent Overlay during drag to prevent iframe / Monaco event hijacking */}
      {isDragging && (
        <div className="fixed inset-0 z-50 cursor-col-resize select-none bg-transparent" />
      )}
    </div>
  );
};
