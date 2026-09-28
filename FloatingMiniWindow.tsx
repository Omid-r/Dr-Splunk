import React, { useState, useEffect, useRef } from 'react';
import { 
  Maximize2, 
  Minimize2, 
  X, 
  GripHorizontal, 
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface FloatingMiniWindowProps {
  id: string;
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  isFa: boolean;
  onClose: () => void;
  onMaximize: () => void;
  initialPosition?: { x: number; y: number };
  children: React.ReactNode;
}

export const FloatingMiniWindow: React.FC<FloatingMiniWindowProps> = ({
  id,
  title,
  icon: IconComp,
  isFa,
  onClose,
  onMaximize,
  initialPosition,
  children
}) => {
  // Window position state
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    if (initialPosition) return initialPosition;
    // Default to bottom right (or bottom left for RTL)
    const defaultWidth = 460;
    const defaultHeight = 360;
    const padding = 24;
    const x = isFa 
      ? padding 
      : Math.max(padding, (typeof window !== 'undefined' ? window.innerWidth : 1200) - defaultWidth - padding);
    const y = Math.max(padding, (typeof window !== 'undefined' ? window.innerHeight : 800) - defaultHeight - padding);
    return { x, y };
  });

  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragRef = useRef<{ startX: number; startY: number; initX: number; initY: number }>({
    startX: 0,
    startY: 0,
    initX: position.x,
    initY: position.y
  });

  const windowRef = useRef<HTMLDivElement>(null);

  // Handle Dragging
  const handlePointerDown = (e: React.PointerEvent) => {
    // Only drag from header elements, not buttons
    if ((e.target as HTMLElement).closest('button')) return;

    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: position.x,
      initY: position.y
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;

    const newX = dragRef.current.initX + deltaX;
    const newY = dragRef.current.initY + deltaY;

    // Bounds checking
    const maxX = Math.max(0, window.innerWidth - (windowRef.current?.offsetWidth || 400));
    const maxY = Math.max(0, window.innerHeight - (windowRef.current?.offsetHeight || 60));

    setPosition({
      x: Math.min(Math.max(10, newX), maxX - 10),
      y: Math.min(Math.max(10, newY), maxY - 10)
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (_) {}
    }
  };

  // Adjust on screen resize
  useEffect(() => {
    const handleResize = () => {
      setPosition(prev => {
        const maxX = Math.max(0, window.innerWidth - (windowRef.current?.offsetWidth || 400));
        const maxY = Math.max(0, window.innerHeight - (windowRef.current?.offsetHeight || 60));
        return {
          x: Math.min(Math.max(10, prev.x), maxX - 10),
          y: Math.min(Math.max(10, prev.y), maxY - 10)
        };
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      ref={windowRef}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999
      }}
      className={`w-[480px] max-w-[calc(100vw-24px)] rounded-2xl overflow-hidden border border-violet-500/40 bg-[#090d18]/95 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.85),0_0_35px_rgba(139,92,246,0.3)] transition-shadow duration-200 ${
        isDragging ? 'shadow-[0_25px_70px_rgba(0,0,0,0.95),0_0_50px_rgba(139,92,246,0.5)] cursor-grabbing' : ''
      }`}
      dir={isFa ? 'rtl' : 'ltr'}
    >
      {/* YouTube-Style Mini Player Header (Draggable) */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="px-3.5 py-2.5 bg-gradient-to-r from-violet-950/80 via-[#0e1424] to-indigo-950/80 border-b border-white/[0.08] flex items-center justify-between gap-2 select-none cursor-grab active:cursor-grabbing"
      >
        {/* Title & Icon & Drag Handle */}
        <div className="flex items-center gap-2 min-w-0">
          <GripHorizontal className="w-4 h-4 text-violet-400/60 shrink-0" />
          {IconComp ? (
            <IconComp className="w-4 h-4 text-violet-400 shrink-0" />
          ) : (
            <Sparkles className="w-4 h-4 text-violet-400 shrink-0" />
          )}
          <span className="font-extrabold text-white text-xs truncate max-w-[200px]" title={title}>
            {title}
          </span>
          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 font-bold shrink-0">
            {isFa ? 'شناور (PiP)' : 'Mini PiP'}
          </span>
        </div>

        {/* Window Controls */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Collapse/Expand content button */}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
            title={isMinimized ? (isFa ? 'گسترش پنجره' : 'Expand window') : (isFa ? 'کوچک‌سازی به نوار' : 'Collapse to bar')}
          >
            {isMinimized ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {/* Maximize to Main Full View */}
          <button
            onClick={onMaximize}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-emerald-400 transition cursor-pointer"
            title={isFa ? 'بازگردانی به صفحه اصلی کامل' : 'Restore to full page'}
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          {/* Close Floating Window */}
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition cursor-pointer"
            title={isFa ? 'بستن پنجره شناور' : 'Close mini window'}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Mini Window Content (Scrollable & Responsive) */}
      {!isMinimized && (
        <div className="max-h-[380px] overflow-y-auto overflow-x-hidden p-2.5 bg-[#06080f]/90 scrollbar-thin text-xs">
          {children}
        </div>
      )}
    </div>
  );
};

export default FloatingMiniWindow;
