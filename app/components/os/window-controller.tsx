'use client';

import { useState } from 'react';
import { motion, useMotionValue } from 'motion/react';
import { LiquidGlass } from '../liquid/liquid-glass'; 
import { useOSStore } from '@/app/store/os-store';
import { cn } from '@/app/utils/cn';

interface WindowControllerProps {
  id: string;
  title: string;
  children: React.ReactNode;
  defaultPos?: { x: number; y: number };
}

export function WindowController({ id, title, children, defaultPos = { x: 100, y: 100 } }: WindowControllerProps) {
  const { windows, focusApp, closeApp } = useOSStore();
  const windowData = windows[id];

  const x = useMotionValue(defaultPos.x);
  const y = useMotionValue(defaultPos.y);
  
  // OS Optimization: Track dragging state to disable physics during motion
  const [isDragging, setIsDragging] = useState(false);

  if (!windowData) return null;

  return (
    <motion.div
      drag
      dragMomentum={false}
      onDragStart={() => {
        focusApp(id);
        setIsDragging(true); // Downgrade rendering
      }}
      onDragEnd={() => setIsDragging(false)} // Restore physics
      onMouseDown={() => focusApp(id)}
      style={{ 
        x, 
        y, 
        zIndex: windowData.zIndex,
        position: 'absolute',
        // Force hardware acceleration on the GPU
        willChange: 'transform'
      }}
      className={cn(
        "active:cursor-grabbing cursor-grab rounded-[40px]",
        // If dragging, apply a fast, cheap CSS blur. Otherwise, no background.
        isDragging ? "bg-white/5 backdrop-blur-2xl shadow-xl" : ""
      )}
    >
      {/* We use a wrapper to toggle the LiquidGlass visibility. 
        We hide it using opacity instead of unmounting it so the canvas 
        doesn't have to recalculate the math from scratch on every drop.
      */}
      <div className={cn("transition-opacity duration-150", isDragging ? "opacity-0" : "opacity-100")}>
        <LiquidGlass 
          glassThickness={60}
          bezelWidth={12}
          refractiveIndex={1.2}
          blur={0.3}
          dpr={1} // CRITICAL: Cuts CPU math by 400%+
          className={cn(
            "w-[700px] h-[500px] rounded-[40px] p-0 border border-white/10 shadow-2xl overflow-hidden",
            windowData.isFocused ? "border-white/30" : "border-white/5"
          )}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5">
            <div className="flex space-x-2">
              <button 
                onClick={(e) => { e.stopPropagation(); closeApp(id); }}
                className="w-3 h-3 rounded-full bg-[#ff5f57] border border-black/10 hover:brightness-125 transition-all" 
              />
              <div className="w-3 h-3 rounded-full bg-[#febc2e] border border-black/10" />
              <div className="w-3 h-3 rounded-full bg-[#28c840] border border-black/10" />
            </div>
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/30">
              {title}
            </span>
            <div className="w-10" />
          </div>

          {/* Body Content */}
          <div className="flex-1 p-8 overflow-y-auto text-white custom-scrollbar">
            {children}
          </div>
        </LiquidGlass>
      </div>

      {/* The Phantom Drag Window (Shows ONLY when dragging) */}
      {isDragging && (
        <div className="absolute inset-0 w-[700px] h-[500px] rounded-[40px] border border-white/30 pointer-events-none flex flex-col overflow-hidden">
          {/* Faked Header for visual continuity */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]/50" />
              <div className="w-3 h-3 rounded-full bg-[#febc2e]/50" />
              <div className="w-3 h-3 rounded-full bg-[#28c840]/50" />
            </div>
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/30">
              {title}
            </span>
            <div className="w-10" />
          </div>
          <div className="flex-1 p-8 text-white opacity-50">
             {children}
          </div>
        </div>
      )}
    </motion.div>
  );
}