'use client';

import { Canvas, useThree } from '@react-three/fiber';
import { Image, Environment, RoundedBox, Text } from '@react-three/drei';
import { useDrag } from '@use-gesture/react';
import { a, useSpring } from '@react-spring/three';

function DraggableGlassSlab() {
  const { viewport } = useThree();
  
  // High-performance kinematics running directly on 3D coordinates
  const [{ x, y, rotX, rotY }, api] = useSpring(() => ({ 
    x: 0, 
    y: 0, 
    rotX: 0,
    rotY: 0,
    config: { mass: 1, tension: 400, friction: 30 } 
  }));

  const bind = useDrag(({ offset: [ox, oy], velocity: [vx, vy], active }) => {
    // Map screen pixels to WebGL 3D world units
    const aspectX = viewport.width / window.innerWidth;
    const aspectY = viewport.height / window.innerHeight;
    
    api.start({ 
      x: ox * aspectX, 
      y: -oy * aspectY,
      // Add a cool 3D tilt based on drag velocity
      rotX: active ? (vy * 0.05) : 0,
      rotY: active ? (vx * 0.05) : 0,
    });
  });

  return (
    <a.group 
      position-x={x} 
      position-y={y} 
      rotation-x={rotX}
      rotation-y={rotY}
      {...bind() as any}
    >
      {/* A perfectly rounded 3D slab, impossible to draw this cheaply in CSS */}
      <RoundedBox args={[5, 3, 0.2]} radius={0.2} smoothness={16}>
        <meshPhysicalMaterial 
          transmission={1}       // 100% glass-like transparency
          transparent={true}
          opacity={1}
          ior={1.4}              // Index of Refraction (Water/Glass)
          thickness={1.5}        // Volumetric depth for the refraction math
          roughness={0.05}       // Microscopic frost
          clearcoat={1}          // Extremely glossy surface
          clearcoatRoughness={0.1}
          color="#ffffff"
        />
      </RoundedBox>

      {/* Text rendered in WebGL, NOT the DOM */}
      <Text 
        position={[0, 0, 0.15]} // Floating just above the glass surface
        fontSize={0.3}
        // REMOVED: font="..."
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        PURE GPU RENDER
      </Text>
    </a.group>
  );
}

export default function PureGPUPlayground() {
  return (
    <div className="h-screen w-full bg-black cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        {/* We need environment lighting for the glass to reflect anything */}
        <Environment preset="city" />
        
        {/* Background Image rendered in WebGL space */}
        <Image 
          url="/image.jpg" // Ensure this image exists in your public folder
          scale={[16, 10]} 
          position={[0, 0, -3]} 
        />
        
        {/* A light source to create specular glints on the glass */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />

        <DraggableGlassSlab />
      </Canvas>
    </div>
  );
}