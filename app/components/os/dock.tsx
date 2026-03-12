'use client';

import { useOSStore } from '@/app/store/os-store';
import { Settings, FolderGit2, Terminal, UserCircle, Briefcase, FileText, AppWindow } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/app/utils/cn';

const APP_DATA: Record<string, { label: string, icon: any }> = {
  settings: { label: 'System Settings', icon: Settings },
  terminal: { label: 'Terminal', icon: Terminal },
  projects: { label: 'Projects Archive', icon: FolderGit2 },
  cases: { label: 'Case Studies', icon: Briefcase },
  about: { label: 'About Me', icon: UserCircle },
  resume: { label: 'Resume Viewer', icon: FileText },
  welcome: { label: 'System Explorer', icon: AppWindow }
};

const PINNED_APPS = ['terminal', 'settings']; 

export function Dock() {
  const { windows, openApp, focusApp, minimizeApp, restoreApp } = useOSStore();

  const activeAppIds = Object.keys(windows);
  const dockAppIds = Array.from(new Set([...PINNED_APPS, ...activeAppIds]));

  const handleAppClick = (id: string, label: string) => {
    const win = windows[id];
    if (!win) {
      openApp(id, label);
    } else if (win.isMinimized) {
      restoreApp(id);
    } else if (!win.isFocused) {
      focusApp(id);
    } else {
      minimizeApp(id);
    }
  };

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-2 p-3 rounded-[32px] border border-white/20 shadow-[0_10px_40px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.15)] bg-black/40 backdrop-blur-2xl backdrop-saturate-150">
        
        <AnimatePresence>
          {dockAppIds.map((id, index) => {
            const data = APP_DATA[id] || { label: id, icon: AppWindow };
            const Icon = data.icon;
            const isActive = !!windows[id];
            
            return (
              <motion.div 
                key={id}
                initial={{ opacity: 0, scale: 0.5, width: 0 }}
                animate={{ opacity: 1, scale: 1, width: 'auto' }}
                exit={{ opacity: 0, scale: 0.5, width: 0 }}
                className="flex items-center gap-2"
              >
                <div className="relative flex flex-col items-center group/dockitem">
                  
                  {/* Premium Slide-Up Tooltip */}
                  <div className="absolute -top-14 px-3 py-1.5 bg-black/60 backdrop-blur-xl border border-white/10 text-white/90 text-[11px] font-semibold tracking-wide rounded-xl opacity-0 group-hover/dockitem:opacity-100 transition-all duration-200 translate-y-2 group-hover/dockitem:translate-y-0 whitespace-nowrap shadow-[0_10px_20px_rgba(0,0,0,0.5)] pointer-events-none z-50 flex items-center justify-center">
                    {data.label}
                  </div>

                  <button 
                    onClick={() => handleAppClick(id, data.label)} 
                    className={cn(
                      "p-3 rounded-2xl transition-all",
                      isActive ? "bg-white/10" : "hover:bg-white/10"
                    )}
                  >
                    <Icon className="w-6 h-6 text-white/80 group-hover/dockitem:text-white group-hover/dockitem:scale-110 active:scale-95 transition-transform drop-shadow-md" strokeWidth={2} />
                  </button>
                  
                  {isActive && (
                    <motion.div layoutId={`dot-${id}`} className="absolute -bottom-2 w-1.5 h-1.5 rounded-full bg-white/70 shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                  )}
                </div>
                {index === PINNED_APPS.length - 1 && <div className="w-[1px] h-8 bg-white/15 mx-1" />}
              </motion.div>
            );
          })}
        </AnimatePresence>

      </div>
    </div>
  );
}