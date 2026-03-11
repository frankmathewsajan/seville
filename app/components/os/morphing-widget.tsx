'use client';

import { useState, useEffect } from 'react';
import { motion, useSpring, AnimatePresence } from 'motion/react';
import { LiquidGlass } from '../liquid/liquid-glass';
import { Settings2, Wifi, Bluetooth, Monitor, Volume2, Moon, X } from 'lucide-react';
import { cn } from '@/app/utils/cn';

export function MorphingWidget() {
  const [isOpen, setIsOpen] = useState(false);

  // 1. The Kinematic Springs (Apple's fluid motion signature)
  const SPRING_CONFIG = { stiffness: 350, damping: 30, mass: 1 };
  
  const width = useSpring(140, SPRING_CONFIG);
  const height = useSpring(48, SPRING_CONFIG);
  const borderRadius = useSpring(24, SPRING_CONFIG); // Perfect pill shape when closed

  // 2. Trigger the Morph
  useEffect(() => {
    if (isOpen) {
      width.set(340);
      height.set(400);
      borderRadius.set(40); // Matches standard OS window radius
    } else {
      width.set(140);
      height.set(48);
      borderRadius.set(24);
    }
  }, [isOpen, width, height, borderRadius]);

  return (
    <div className="absolute top-8 right-8 z-[100]">
      <motion.div
        style={{ width, height, borderRadius }}
        className="relative shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
      >
        <LiquidGlass
          // We feed the exact Spring values directly into the WebGL math
          width={width as any}
          height={height as any}
          borderRadius={borderRadius as any}
          glassThickness={40}
          bezelWidth={10}
          refractiveIndex={1.25}
          blur={0.4}
          dpr={1} // Keep performant
          style={{ borderRadius }}
          className={cn(
            "absolute inset-0 border border-white/20 bg-white/5 overflow-hidden transition-colors duration-500",
            isOpen ? "bg-black/10" : "hover:bg-white/10 cursor-pointer"
          )}
        >
          {/* CLOSED STATE: The Pill */}
          <div 
            className={cn(
              "absolute inset-0 flex items-center justify-center gap-2 transition-opacity duration-300",
              isOpen ? "opacity-0 pointer-events-none" : "opacity-100"
            )}
            onClick={() => !isOpen && setIsOpen(true)}
          >
            <Settings2 className="w-4 h-4 text-white drop-shadow-md" />
            <span className="text-xs font-semibold text-white drop-shadow-md tracking-wide">Control</span>
          </div>

          {/* OPEN STATE: The Control Panel */}
          <AnimatePresence>
            {isOpen && (
              <motion.div 
                initial={{ opacity: 0, filter: 'blur(10px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, filter: 'blur(5px)', transition: { duration: 0.2 } }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="absolute inset-0 p-4 flex flex-col" // p-4 = 16px padding
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-4 px-2">
                  <span className="text-sm font-bold text-white tracking-widest uppercase drop-shadow-md">
                    System Hub
                  </span>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-full hover:bg-white/20 transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>

                {/* Grid of Controls */}
                <div className="grid grid-cols-2 gap-3 flex-1">
                  
                  {/* Concentric Radii Rule: Outer(40) - Padding(16) = Inner(24px) -> rounded-[24px] */}
                  {/* Intelligent Translucency: mix-blend-overlay samples the BG color */}
                  <button className="col-span-2 rounded-[24px] bg-white/10 mix-blend-overlay border border-white/10 hover:bg-white/20 transition-all flex items-center p-4 gap-4 active:scale-95">
                    <div className="w-10 h-10 rounded-full bg-blue-500/80 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                      <Wifi className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-bold text-white">Wi-Fi</span>
                      <span className="text-xs text-white/70">Connected</span>
                    </div>
                  </button>

                  <button className="rounded-[24px] bg-white/10 mix-blend-overlay border border-white/10 hover:bg-white/20 transition-all flex flex-col items-center justify-center p-4 gap-2 active:scale-95">
                    <Bluetooth className="w-6 h-6 text-white drop-shadow-md" />
                    <span className="text-xs font-medium text-white">Bluetooth</span>
                  </button>

                  <button className="rounded-[24px] bg-white/10 mix-blend-overlay border border-white/10 hover:bg-white/20 transition-all flex flex-col items-center justify-center p-4 gap-2 active:scale-95">
                    <Moon className="w-6 h-6 text-white drop-shadow-md" />
                    <span className="text-xs font-medium text-white">Focus</span>
                  </button>

                </div>

                {/* Sliders Area */}
                <div className="mt-3 space-y-3">
                  <div className="h-12 rounded-[20px] bg-white/10 mix-blend-overlay border border-white/10 flex items-center px-4 gap-3">
                    <Monitor className="w-4 h-4 text-white/70" />
                    <div className="h-1.5 flex-1 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-white rounded-full shadow-[0_0_10px_white]"></div>
                    </div>
                  </div>
                  <div className="h-12 rounded-[20px] bg-white/10 mix-blend-overlay border border-white/10 flex items-center px-4 gap-3">
                    <Volume2 className="w-4 h-4 text-white/70" />
                    <div className="h-1.5 flex-1 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full w-1/2 bg-white rounded-full shadow-[0_0_10px_white]"></div>
                    </div>
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </LiquidGlass>
      </motion.div>
    </div>
  );
}