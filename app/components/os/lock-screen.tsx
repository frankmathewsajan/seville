'use client';

import { useEffect, useState, useRef } from 'react';
import { useOSStore, WALLPAPERS } from '@/app/store/os-store';
import { ArrowRight, User, Terminal } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'motion/react';
import { cn } from '@/app/utils/cn';

export function LockScreen() {
  const { bootSystem, openApp, wallpaperIndex } = useOSStore();
  const [password, setPassword] = useState('');
  const [problem, setProblem] = useState({ a: 0, b: 0 });
  const [isError, setIsError] = useState(false);
  
  // New Boot State Management
  const [authSuccess, setAuthSuccess] = useState(false);
  const [progress, setProgress] = useState(0);
  
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

  useEffect(() => {
    setProblem({
      a: Math.floor(100 + Math.random() * 900),
      b: Math.floor(100 + Math.random() * 900)
    });
    setTimeout(() => inputRef.current?.focus(), 500);
  }, []);

  const executeBoot = () => {
    bootSystem();
    openApp('welcome', 'System 26 // Neural Explorer');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(password) === problem.a + problem.b) {
      // 1. Lock the form and trigger transition
      setAuthSuccess(true);
      
      // 2. Request fullscreen silently in the background
      document.documentElement.requestFullscreen().catch(() => console.log("Fullscreen ignored by browser policy"));

      // 3. Simulate Asset & WebGL Loading Pipeline
      let currentProgress = 0;
      const loadInterval = setInterval(() => {
        // Randomize the loading speed for realism
        const chunk = Math.random() * 15 + 5; 
        currentProgress += chunk;
        
        if (currentProgress >= 100) {
          currentProgress = 100;
          clearInterval(loadInterval);
          // The 100ms aesthetic pause at 100% you requested
          setTimeout(() => {
            executeBoot();
          }, 150); 
        }
        setProgress(currentProgress);
      }, 150); // Ticks every 150ms

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
        <AnimatePresence mode="wait">
          {!authSuccess ? (
            <motion.form 
              key="login-form"
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }} // Cinematic blur out
              transition={{ duration: 0.4 }}
              onSubmit={handleLogin} 
              className="flex flex-col items-center gap-6 w-full"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-[0_10px_40px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.3)]">
                  <User className="w-10 h-10 text-white drop-shadow-md" strokeWidth={1.5} />
                </div>
                <span className="text-white font-bold text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  Recruiter Access
                </span>
              </div>

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
          ) : (
            // THE BOOT SEQUENCE UI
            <motion.div 
              key="boot-sequence"
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col items-center gap-8"
            >
              {/* Premium Boot Icon */}
              <div className="w-20 h-20 rounded-[24px] bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-[0_10px_40px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.4)]">
                <Terminal className="w-8 h-8 text-white drop-shadow-md" strokeWidth={1.5} />
              </div>
              
              {/* Loading Bar Container */}
              <div className="w-56 h-1.5 bg-black/40 rounded-full overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] border border-white/10">
                <motion.div 
                  className="h-full bg-white rounded-full relative"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "linear", duration: 0.15 }}
                >
                  {/* Subtle edge glow on the loading bar itself */}
                  <div className="absolute right-0 top-0 bottom-0 w-4 bg-white shadow-[0_0_10px_2px_rgba(255,255,255,0.8)] rounded-full blur-[2px]" />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}