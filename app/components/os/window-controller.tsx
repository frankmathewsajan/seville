'use client';

import { useState, useRef } from 'react';
import { motion, useMotionValue, useVelocity, useTransform, useSpring, useDragControls } from 'motion/react';
import { useOSStore } from '@/app/store/os-store';
import { cn } from '@/app/utils/cn';

interface WindowControllerProps {
  id: string;
  title: string;
  children: React.ReactNode;
  defaultPos?: { x: number; y: number };
}

export function WindowController({ id, title, children, defaultPos = { x: 100, y: 100 } }: WindowControllerProps) {
  const { windows, focusApp, closeApp, minimizeApp } = useOSStore();
  const windowData = windows[id];

  const [isMaximized, setIsMaximized] = useState(false);
  const dragControls = useDragControls();

  const x = useMotionValue(defaultPos.x);
  const y = useMotionValue(defaultPos.y);
  const width = useMotionValue(800);
  const height = useMotionValue(550);

  const prevBounds = useRef({ x: defaultPos.x, y: defaultPos.y, w: 800, h: 550 });

  const velocityX = useVelocity(x);
  const velocityY = useVelocity(y);
  const rawRotateX = useTransform(velocityY, [-800, 800], [6, -6]);
  const rawRotateY = useTransform(velocityX, [-800, 800], [-6, 6]);
  const rotateX = useSpring(rawRotateX, { stiffness: 400, damping: 40 });
  const rotateY = useSpring(rawRotateY, { stiffness: 400, damping: 40 });

  if (!windowData) return null;

  const handleMaximize = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isMaximized) {
      prevBounds.current = { x: x.get(), y: y.get(), w: width.get(), h: height.get() };
      x.set(0); y.set(0);
      width.set(window.innerWidth); height.set(window.innerHeight);
    } else {
      x.set(prevBounds.current.x); y.set(prevBounds.current.y);
      width.set(prevBounds.current.w); height.set(prevBounds.current.h);
    }
    setIsMaximized(!isMaximized);
  };

  return (
    <motion.div
      drag={!isMaximized}
      dragMomentum={false}
      dragControls={dragControls}
      dragListener={false} 
      // FIX: Absolute Edge Clamping Physics
      onDrag={(e, info) => {
        // Ceiling Bounce
        if (y.get() < 0) y.set(0);
        // Left Wall Bounce (leaves 100px of header visible)
        if (x.get() < -width.get() + 100) x.set(-width.get() + 100);
        // Right Wall Bounce (leaves 100px of header visible)
        if (x.get() > window.innerWidth - 100) x.set(window.innerWidth - 100);
      }}
      style={{ x, y, zIndex: windowData.zIndex, position: 'absolute', perspective: 1200 }}
      className="pointer-events-auto"
    >
      <motion.div
        animate={{ 
          scale: windowData.isMinimized ? 0.6 : 1, 
          opacity: windowData.isMinimized ? 0 : 1
        }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        style={{ width, height, rotateX, rotateY }}
        className={cn(
          "flex flex-col overflow-hidden origin-bottom",
          !isMaximized && "rounded-[40px] shadow-2xl",
          windowData.isMinimized && "pointer-events-none",
          "backdrop-blur-[30px] backdrop-saturate-[180%] bg-[#ffffff1a] border border-white/20"
        )}
      >
        <div 
          className="w-full h-full flex flex-col relative"
          onMouseDown={() => focusApp(id)}
          style={{
            boxShadow: windowData.isFocused && !isMaximized
              ? "inset 2px 2px 1px rgba(255, 255, 255, 0.4), inset -1px -1px 1px 1px rgba(255, 255, 255, 0.2), 0 30px 60px -12px rgba(0,0,0,0.6)"
              : "inset 1px 1px 1px rgba(255, 255, 255, 0.2), inset -1px -1px 1px rgba(255, 255, 255, 0.1), 0 15px 30px -10px rgba(0,0,0,0.4)"
          }}
        >
          <div 
            onPointerDown={(e) => {
              focusApp(id);
              dragControls.start(e);
            }}
            style={{ touchAction: "none" }}
            className={cn("flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/5 relative z-10", !isMaximized && "cursor-grab active:cursor-grabbing")}
          >
            <div className="flex space-x-2 z-20">
              <button onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); closeApp(id); }} className="w-3.5 h-3.5 rounded-full bg-[#ff5f57] border border-black/10 hover:brightness-125" />
              <button onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); minimizeApp(id); }} className="w-3.5 h-3.5 rounded-full bg-[#febc2e] border border-black/10 hover:brightness-125" />
              <button onPointerDown={(e) => e.stopPropagation()} onClick={handleMaximize} className="w-3.5 h-3.5 rounded-full bg-[#28c840] border border-black/10 hover:brightness-125" />
            </div>
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/60 drop-shadow-md z-20 pointer-events-none select-none">{title}</span>
            <div className="w-10" />
          </div>

          <div className="flex-1 overflow-hidden relative z-10 bg-black/10">
            {children}
          </div>

          {!isMaximized && (
            <motion.div 
              drag
              dragMomentum={false}
              onPointerDown={(e) => e.stopPropagation()}
              onDrag={(e, info) => {
                const newW = Math.max(400, width.get() + info.delta.x);
                const newH = Math.max(300, height.get() + info.delta.y);
                width.set(newW); height.set(newH);
              }}
              className="absolute bottom-0 right-0 w-6 h-6 z-50 cursor-se-resize"
            />
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}