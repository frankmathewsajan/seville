'use client';

import { useState } from 'react';
import { useOSStore, WALLPAPERS } from './store/os-store';
import { WindowController } from './components/os/window-controller';
import { MorphingWidget } from './components/os/morphing-widget';

import { TerminalApp } from './components/os/apps/terminal';
import { WelcomeApp } from './components/os/apps/welcome';
import { ProjectsApp } from './components/os/apps/projects';
import { DocumentViewerApp } from './components/os/apps/doc-viewer';


import { ResumeApp } from './components/os/apps/resume';
import { LockScreen } from './components/os/lock-screen';
import { DesktopIcon } from './components/os/desktop-icon';
import { Dock } from './components/os/dock';
import { FolderGit2, Award, UserCircle, FileText, Briefcase, Terminal, RefreshCw, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './utils/cn';


export default function Home() {
  // Added setWallpaper to the destructured store
  const { isBooted, windows, openApp, refreshUI, wallpaperIndex, setWallpaper } = useOSStore();
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0 });

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isBooted) return;
    const x = e.pageX + 220 > window.innerWidth ? window.innerWidth - 230 : e.pageX;
    // Adjusted Y offset to accommodate the slightly taller context menu
    const y = e.pageY + 200 > window.innerHeight ? window.innerHeight - 210 : e.pageY;
    setContextMenu({ show: true, x, y });
  };

  return (
    <main 
      className="relative h-screen w-full overflow-hidden bg-[#0d0a0b]" 
      onContextMenu={handleContextMenu} 
      onClick={() => contextMenu.show && setContextMenu({ ...contextMenu, show: false })}
    >
      <AnimatePresence>
        {!isBooted && <LockScreen key="lock" />}
      </AnimatePresence>

      {isBooted && (
        <motion.div initial={{ opacity: 0, scale: 1.02 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="absolute inset-0">
          
          <img src={WALLPAPERS[wallpaperIndex]} alt="OS Background" className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none transition-opacity duration-500" />
          
          <MorphingWidget />
          <Dock />

          <div className="absolute top-8 left-8 flex flex-col gap-6 z-0">
            <DesktopIcon icon={FolderGit2} label="Projects" onClick={() => openApp('projects', 'Archive ◦ Projects')} />
            <DesktopIcon icon={Award} label="Certificates" onClick={() => openApp('certs', 'Archive ◦ Certificates')} />
            <DesktopIcon icon={Briefcase} label="Case Studies" onClick={() => openApp('cases', 'Archive ◦ Case Studies')} />
            <DesktopIcon icon={UserCircle} label="About Me" onClick={() => openApp('about', 'User ◦ About')} />
            <DesktopIcon icon={FileText} label="Resume.pdf" onClick={() => openApp('resume', 'System ◦ Resume Viewer')} />
          </div>

          <div className="absolute inset-0 z-10 pointer-events-none">
            {Object.values(windows).map((win) => (
              <div key={win.id} className="pointer-events-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <WindowController id={win.id} title={win.title}>
                  {win.id === 'welcome' && <WelcomeApp />}
                  {win.id === 'terminal' && <TerminalApp />}
                  {win.id === 'projects' && <ProjectsApp />}
                  {win.id === 'resume' && <ResumeApp />}

                  {win.id.startsWith('docViewer-') && (
                    <DocumentViewerApp repoName={win.id.replace('docViewer-', '')} />
                  )}
                </WindowController>
              </div>
            ))}
          </div>

          {/* THE NEW CONTEXT MENU */}
          {contextMenu.show && (
            <div style={{ top: contextMenu.y, left: contextMenu.x }} className="absolute z-9999 w-64 rounded-2xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15)] bg-black/60 backdrop-blur-2xl backdrop-saturate-150 flex flex-col p-1.5 overflow-hidden">
              
              <button 
                onClick={() => { localStorage.clear(); refreshUI(); }} 
                className="flex items-center gap-3 w-full px-3 py-2 text-sm text-white/90 hover:bg-white/15 rounded-xl transition-colors font-medium text-left"
              >
                <RefreshCw size={16} className="text-white/60" /> Refresh Interface
              </button>
              
              <button 
                onClick={() => openApp('terminal', 'System ◦ Terminal')} 
                className="flex items-center gap-3 w-full px-3 py-2 text-sm text-white/90 hover:bg-white/15 rounded-xl transition-colors font-medium text-left"
              >
                <Terminal size={16} className="text-white/60" /> Open Terminal
              </button>

              <div className="h-px bg-white/10 my-1.5 mx-2" />

              {/* Wallpaper Visual Selector */}
              <div className="px-3 py-2">
                <div className="flex items-center gap-2 mb-3">
                  <Monitor size={14} className="text-white/40" />
                  <span className="text-[10px] font-bold text-white/40 tracking-widest uppercase">Appearance</span>
                </div>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  {WALLPAPERS.map((bg, idx) => (
                    <button
                      key={bg}
                      onClick={() => setWallpaper(idx)}
                      className={cn(
                        "flex-1 h-12 rounded-lg bg-cover bg-center border-2 transition-all",
                        wallpaperIndex === idx 
                          ? "border-white shadow-[0_0_15px_rgba(255,255,255,0.3)] scale-105 z-10" 
                          : "border-transparent opacity-50 hover:opacity-100 hover:scale-105"
                      )}
                      style={{ backgroundImage: `url(${bg})` }}
                      title={`Wallpaper ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

            </div>
          )}

        </motion.div>
      )}
    </main>
  );
}