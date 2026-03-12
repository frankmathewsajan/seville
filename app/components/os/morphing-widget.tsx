'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useSpring, AnimatePresence } from 'motion/react';
import { Settings2, Maximize, Minimize, Power, Layout, X } from 'lucide-react';
import { useOSStore } from '@/app/store/os-store';
import { cn } from '@/app/utils/cn';

export function MorphingWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Added closeApp to act as the task killer
  const { windows, focusApp, shutdown, closeApp } = useOSStore();
  const widgetRef = useRef<HTMLDivElement>(null);

  const SPRING_CONFIG = { stiffness: 350, damping: 30, mass: 1 };
  const width = useSpring(140, SPRING_CONFIG);
  const height = useSpring(48, SPRING_CONFIG);
  const borderRadius = useSpring(24, SPRING_CONFIG);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Click Outside Handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      width.set(320);
      // Adjusted height multiplier slightly to accommodate the kill buttons gracefully
      height.set(260 + Math.min(Object.keys(windows).length * 45, 120));
      borderRadius.set(32);
    } else {
      width.set(140);
      height.set(48);
      borderRadius.set(24);
    }
  }, [isOpen, width, height, borderRadius, windows]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="absolute top-8 right-8 z-[100]" ref={widgetRef}>
      <motion.div 
        style={{ 
          width, height, borderRadius,
          boxShadow: isOpen 
            ? "inset 2px 2px 1px rgba(255, 255, 255, 0.4), inset -1px -1px 1px 1px rgba(255, 255, 255, 0.2), 0 30px 60px -12px rgba(0,0,0,0.6)"
            : "inset 1px 1px 1px rgba(255, 255, 255, 0.2), inset -1px -1px 1px rgba(255, 255, 255, 0.1), 0 15px 30px -10px rgba(0,0,0,0.4)"
        }} 
        className={cn(
          "relative cursor-pointer overflow-hidden backdrop-blur-[30px] backdrop-saturate-[180%] transition-colors duration-500 border border-white/20",
          isOpen ? "bg-black/60" : "bg-black/40 hover:bg-black/50"
        )}
      >
        <div 
          className={cn("absolute inset-0 flex items-center justify-center gap-2 transition-opacity duration-300", isOpen ? "opacity-0 pointer-events-none" : "opacity-100")}
          onClick={() => !isOpen && setIsOpen(true)}
        >
          <Settings2 className="w-4 h-4 text-white drop-shadow-md" />
          <span className="text-xs font-semibold text-white drop-shadow-md tracking-wide">Control</span>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, filter: 'blur(10px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, filter: 'blur(5px)' }}
              className="absolute inset-0 p-5 flex flex-col"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-white/50 tracking-widest uppercase drop-shadow-md">System Hub</span>
                <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white/90 shadow-inner z-50">✕</button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <button onClick={toggleFullscreen} className="rounded-2xl bg-white/5 border border-white/10 hover:bg-white/15 transition-all flex flex-col items-center justify-center p-4 gap-2 active:scale-95 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                  {isFullscreen ? <Minimize className="w-5 h-5 text-white/80" /> : <Maximize className="w-5 h-5 text-white/80" />}
                  <span className="text-xs font-medium text-white/80">{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
                </button>
                <button onClick={() => { setIsOpen(false); shutdown(); }} className="rounded-2xl bg-white/5 border border-white/10 hover:bg-white/15 transition-all flex flex-col items-center justify-center p-4 gap-2 active:scale-95 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                  <Power className="w-5 h-5 text-white/80" />
                  <span className="text-xs font-medium text-white/80">Lock OS</span>
                </button>
              </div>

              <span className="text-[10px] font-bold text-white/30 tracking-widest uppercase mb-2 px-1">Active Tasks</span>
              <div className="flex-1 overflow-y-auto space-y-2 pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {Object.values(windows).length === 0 ? (
                  <div className="text-xs text-white/40 italic px-1">No windows active</div>
                ) : (
                  Object.values(windows).map(win => (
                    // The Task Container: Flex row to hold both the focus button and the kill switch
                    <div 
                      key={win.id} 
                      className="group flex items-center w-full px-2 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all gap-2"
                    >
                      {/* Left Side: Focus App */}
                      <button 
                        onClick={(e) => { e.stopPropagation(); focusApp(win.id); setIsOpen(false); }}
                        className="flex-1 flex items-center gap-3 text-left p-1.5"
                      >
                        <Layout className="w-4 h-4 text-white/50" />
                        <span className="text-sm font-medium text-white/90 truncate">{win.title}</span>
                      </button>
                      
                      {/* Right Side: The Kill Switch */}
                      <button 
                        onClick={(e) => { e.stopPropagation(); closeApp(win.id); }}
                        className="w-7 h-7 rounded-full bg-white/10 hover:bg-[#ff5f57] border border-white/10 hover:border-[#ff5f57] flex items-center justify-center transition-colors group/kill shadow-inner"
                        title="Kill Task"
                      >
                        <X className="w-3.5 h-3.5 text-white/70 group-hover/kill:text-white" strokeWidth={2.5} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}