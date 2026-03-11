'use client';

import { useEffect, useState, useRef } from 'react';
import { useOSStore, WALLPAPERS } from '@/app/store/os-store';
import { ArrowRight, User } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'motion/react';
import { cn } from '@/app/utils/cn';

export function LockScreen() {
  const { bootSystem, openApp, wallpaperIndex } = useOSStore();
  const [password, setPassword] = useState('');
  const [problem, setProblem] = useState({ a: 0, b: 0 });
  const [isError, setIsError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const [windowSize, setWindowSize] = useState({ w: 1000, h: 800 });
  
  useEffect(() => {
    setWindowSize({ w: window.innerWidth, h: window.innerHeight });
    const handleResize = () => setWindowSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const rotateX = useTransform(mouseY, [0, windowSize.h], [5, -5]);
  const rotateY = useTransform(mouseX, [0, windowSize.w], [-5, 5]);
  const smoothRotateX = useSpring(rotateX, { damping: 30, stiffness: 100, mass: 1 });
  const smoothRotateY = useSpring(rotateY, { damping: 30, stiffness: 100, mass: 1 });

  const handleMouseMove = (e: React.MouseEvent) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  };

  // Generate 4-digit + 4-digit addition problem
  useEffect(() => {
    setProblem({
      a: Math.floor(1000 + Math.random() * 9000),
      b: Math.floor(1000 + Math.random() * 9000)
    });
    setTimeout(() => inputRef.current?.focus(), 500);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(password) === problem.a + problem.b) {
      document.documentElement.requestFullscreen().catch(() => {});
      bootSystem();
      openApp('welcome', 'System 26 // Neural Explorer');
    } else {
      setIsError(true);
      setPassword('');
      setTimeout(() => setIsError(false), 500);
      inputRef.current?.focus();
    }
  };

  return (
    <div onMouseMove={handleMouseMove} style={{ perspective: 1000 }} className="absolute inset-0 z-[99999] flex flex-col items-center justify-center overflow-hidden">
      <img src={WALLPAPERS[wallpaperIndex]} className="absolute inset-0 w-full h-full object-cover scale-105" alt="Login Background" />
      <div className="absolute inset-0 backdrop-blur-[60px] backdrop-saturate-[180%] bg-black/20" />
      
      <motion.div style={{ rotateX: smoothRotateX, rotateY: smoothRotateY }} className="relative z-10 flex flex-col items-center w-full max-w-2xl">
        <motion.form 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
          onSubmit={handleLogin} 
          className="flex flex-col items-center gap-6 w-full"
        >
          {/* User Avatar */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-[0_10px_40px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.3)]">
              <User className="w-10 h-10 text-white drop-shadow-md" strokeWidth={1.5} />
            </div>
          </div>

          {/* Input Field */}
          <motion.div animate={isError ? { x: [-10, 10, -10, 10, 0] } : {}} transition={{ duration: 0.4 }} className="relative flex items-center mt-2 group">
            <input
              ref={inputRef}
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value.replace(/\D/g, ''))}
              placeholder={`Verify: ${problem.a} + ${problem.b} = ?`}
              className={cn(
                "w-64 h-10 rounded-full pl-5 pr-10 text-white text-sm font-medium outline-none transition-all backdrop-blur-md placeholder-white/50 text-center",
                isError ? "bg-red-500/30 border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.5)]" 
                        : "bg-white/10 border border-white/20 focus:border-white/50 focus:bg-white/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.3),0_2px_10px_rgba(0,0,0,0.2)]"
              )}
            />
            <button 
              type="submit" 
              className="absolute right-1 w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-all"
            >
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </motion.div>

        </motion.form>
      </motion.div>
    </div>
  );
}