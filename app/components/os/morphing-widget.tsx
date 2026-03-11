'use client';

import { useState, useEffect } from 'react';
import { motion, useSpring, AnimatePresence } from 'motion/react';
import { LiquidGlass } from '../liquid/liquid-glass';
import { Settings2, Maximize, Power, Layout } from 'lucide-react';
import { useOSStore } from '@/app/store/os-store';
import { cn } from '@/app/utils/cn';

export function MorphingWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { windows, focusApp, shutdown } = useOSStore();

  const SPRING_CONFIG = { stiffness: 350, damping: 30, mass: 1 };
  const width = useSpring(140, SPRING_CONFIG);
  const height = useSpring(48, SPRING_CONFIG);
  const borderRadius = useSpring(24, SPRING_CONFIG);

  useEffect(() => {
    if (isOpen) {
      width.set(320);
      // Dynamic height based on how many windows are open (capped)
      height.set(260 + Math.min(Object.keys(windows).length * 40, 120));
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

  const handleShutdown = () => {
    setIsOpen(false);
    shutdown();
  };

  return (
    <div className="absolute top-8 right-8 z-[100]">
      <motion.div style={{ width, height, borderRadius }} className="relative shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
        <LiquidGlass
          glassThickness={40} bezelWidth={10} refractiveIndex={1.25} blur={15} dpr={1}
          style={{ 
            borderRadius: borderRadius as any,
            // THE BEVEL: Injecting your custom physical depth CSS
            boxShadow: isOpen 
              ? "rgba(255, 255, 255, 0.4) 2px 2px 1px inset, rgba(255, 255, 255, 0.2) -1px -1px 1px 1px inset, 0 25px 50px -12px rgba(0,0,0,0.5)"
              : "rgba(255, 255, 255, 0.4) 1px 1px 1px inset, rgba(255, 255, 255, 0.1) -1px -1px 1px inset"
          }}
          className={cn(
            "absolute inset-0 overflow-hidden transition-colors duration-500 backdrop-saturate-150 border border-white/20",
            isOpen ? "bg-black/60" : "bg-black/40 hover:bg-black/50 cursor-pointer"
          )}
        >
          {/* Closed State */}
          <div 
            className={cn("absolute inset-0 flex items-center justify-center gap-2 transition-opacity duration-300", isOpen ? "opacity-0 pointer-events-none" : "opacity-100")}
            onClick={() => !isOpen && setIsOpen(true)}
          >
            <Settings2 className="w-4 h-4 text-white drop-shadow-md" />
            <span className="text-xs font-semibold text-white drop-shadow-md tracking-wide">Control</span>
          </div>

          {/* Open State */}
          <AnimatePresence>
            {isOpen && (
              <motion.div 
                initial={{ opacity: 0, filter: 'blur(10px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, filter: 'blur(5px)' }}
                className="absolute inset-0 p-5 flex flex-col"
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold text-white/50 tracking-widest uppercase">System Hub</span>
                  <button onClick={() => setIsOpen(false)} className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70">✕</button>
                </div>

                {/* System Controls */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button onClick={toggleFullscreen} className="rounded-2xl bg-white/5 border border-white/10 hover:bg-white/15 transition-all flex flex-col items-center justify-center p-4 gap-2 active:scale-95 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                    <Maximize className="w-5 h-5 text-white/80" />
                    <span className="text-xs font-medium text-white/80">Fullscreen</span>
                  </button>
                  <button onClick={handleShutdown} className="rounded-2xl bg-white/5 border border-white/10 hover:bg-white/15 transition-all flex flex-col items-center justify-center p-4 gap-2 active:scale-95 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                    <Power className="w-5 h-5 text-white/80" />
                    <span className="text-xs font-medium text-white/80">Lock OS</span>
                  </button>
                </div>

                {/* Window Manager */}
                <span className="text-[10px] font-bold text-white/30 tracking-widest uppercase mb-2 px-1">Active Tasks</span>
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                  {Object.values(windows).length === 0 ? (
                    <div className="text-xs text-white/40 italic px-1">No windows active</div>
                  ) : (
                    Object.values(windows).map(win => (
                      <button 
                        key={win.id} 
                        onClick={() => focusApp(win.id)}
                        className="w-full text-left px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all flex items-center gap-3"
                      >
                        <Layout className="w-4 h-4 text-white/50" />
                        <span className="text-sm font-medium text-white/90 truncate">{win.title}</span>
                      </button>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </LiquidGlass>
      </motion.div>
    </div>
  );
}