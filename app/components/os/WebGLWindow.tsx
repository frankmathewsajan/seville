'use client';

import { useThree } from '@react-three/fiber';
import { RoundedBox, Html } from '@react-three/drei';
import { useDrag } from '@use-gesture/react';
import { a, useSpring } from '@react-spring/three';
import { useOSStore } from '@/app/store/os-store';

interface WebGLWindowProps {
  id: string;
  title: string;
  children: React.ReactNode;
  defaultPos?: { x: number; y: number };
}

export function WebGLWindow({ id, title, children, defaultPos = { x: 0, y: 0 } }: WebGLWindowProps) {
  const { windows, focusApp, closeApp } = useOSStore();
  const windowData = windows[id];
  const { viewport } = useThree();

  // 3D Kinematics
  const [{ x, y, rotX, rotY }, api] = useSpring(() => ({ 
    x: defaultPos.x, 
    y: defaultPos.y, 
    rotX: 0,
    rotY: 0,
    config: { mass: 1.2, tension: 400, friction: 30 } 
  }));

  const bind = useDrag(({ offset: [ox, oy], velocity: [vx, vy], active }) => {
    if (active) focusApp(id);
    
    // Map screen pixels to 3D world units
    const aspectX = viewport.width / window.innerWidth;
    const aspectY = viewport.height / window.innerHeight;
    
    api.start({ 
      x: ox * aspectX, 
      y: -oy * aspectY,
      // The Tilt Physics: Only tilt when actively dragging
      rotX: active ? (vy * 0.04) : 0,
      rotY: active ? (vx * 0.04) : 0,
    });
  }, { filterTaps: true });

  if (!windowData) return null;

  // Calculate Z-position based on OS state so focused windows render in front
  const zPos = windowData.zIndex * 0.1;

  return (
    <a.group 
      position-x={x} 
      position-y={y} 
      position-z={zPos}
      rotation-x={rotX}
      rotation-y={rotY}
    >
      {/* 1. THE 3D GLASS SLAB (Running on GPU) */}
      <RoundedBox 
        args={[5.5, 3.5, 0.1]} // Width, Height, Depth
        radius={0.15} 
        smoothness={16}
        {...bind() as any}
      >
        <meshPhysicalMaterial 
          transmission={1}
          transparent={true}
          opacity={1}
          ior={1.3} // Soft refraction
          thickness={1.5}
          roughness={0.1}
          clearcoat={1}
          color={windowData.isFocused ? "#ffffff" : "#cccccc"}
        />
      </RoundedBox>

      {/* 2. THE UI LAYER (Synced to the 3D Slab) */}
      <Html 
        transform 
        position={[0, 0, 0.06]} // Floats exactly on the front face of the 3D slab
        scale={0.1} // Scale down DOM pixels to WebGL units
        className="pointer-events-none" // Let drags pass through to the 3D mesh
      >
        <div 
          className="w-[800px] h-[500px] flex flex-col pointer-events-auto rounded-[24px] overflow-hidden bg-black/10"
          onMouseDown={() => focusApp(id)}
        >
          {/* Mac Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-b border-white/10 backdrop-blur-sm cursor-grab active:cursor-grabbing" {...bind() as any}>
            <div className="flex space-x-2">
              <button onClick={() => closeApp(id)} className="w-3.5 h-3.5 rounded-full bg-[#ff5f57] hover:brightness-125" />
              <div className="w-3.5 h-3.5 rounded-full bg-[#febc2e]" />
              <div className="w-3.5 h-3.5 rounded-full bg-[#28c840]" />
            </div>
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-white/50 drop-shadow-md">
              {title}
            </span>
            <div className="w-10" />
          </div>

          {/* App Content */}
          <div className="flex-1 w-full h-full relative">
            {children}
          </div>
        </div>
      </Html>
    </a.group>
  );
}