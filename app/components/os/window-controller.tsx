'use client';

import { motion, useMotionValue } from 'motion/react';
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

  if (!windowData) return null;

  return (
    <motion.div
      drag
      dragMomentum={false}
      onDragStart={() => focusApp(id)}
      onMouseDown={() => focusApp(id)}
      style={{ x, y, zIndex: windowData.zIndex, position: 'absolute', willChange: 'transform' }}
      className="active:cursor-grabbing cursor-grab"
    >
      <div 
        className={cn(
          "w-[800px] h-[550px] rounded-[40px] flex flex-col overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.175,0.885,0.32,1.2)]",
          // The Base Glass Filter (Matching your .liquid-glass-effect)
          "backdrop-blur-[30px] backdrop-saturate-[180%]",
          // The Tint (Matching your .liquid-glass-tint)
          "bg-[#ffffff1a]" 
        )}
        style={{
          // The Shine (Matching your .liquid-glass-shine exactly)
          boxShadow: windowData.isFocused 
            ? "inset 2px 2px 1px rgba(255, 255, 255, 0.5), inset -1px -1px 1px 1px rgba(255, 255, 255, 0.5), 0 25px 50px -12px rgba(0,0,0,0.5)"
            : "inset 1px 1px 1px rgba(255, 255, 255, 0.2), inset -1px -1px 1px rgba(255, 255, 255, 0.2), 0 15px 30px -10px rgba(0,0,0,0.3)"
        }}
      >
        {/* Mac Header - Made more transparent to let the main glass shine through */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/5 relative z-10">
          <div className="flex space-x-2">
            <button onClick={(e) => { e.stopPropagation(); closeApp(id); }} className="w-3.5 h-3.5 rounded-full bg-[#ff5f57] border border-black/10 hover:brightness-125 transition-all" />
            <div className="w-3.5 h-3.5 rounded-full bg-[#febc2e] border border-black/10" />
            <div className="w-3.5 h-3.5 rounded-full bg-[#28c840] border border-black/10" />
          </div>
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/60 drop-shadow-md">
            {title}
          </span>
          <div className="w-10" />
        </div>

        {/* Content Container - Slightly darker for text contrast, mimicking your CSS structure */}
        <div className="flex-1 overflow-hidden relative z-10 bg-black/10">
          {children}
        </div>
      </div>
    </motion.div>
  );
}