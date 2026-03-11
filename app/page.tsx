'use client';

import { useState } from 'react';
import { useOSStore, WALLPAPERS } from './store/os-store';
import { WindowController } from './components/os/window-controller';
import { MorphingWidget } from './components/os/morphing-widget';

import { TerminalApp } from './components/os/apps/terminal';
import { WelcomeApp } from './components/os/apps/welcome';
import { ProjectsApp } from './components/os/apps/projects';
import { LockScreen } from './components/os/lock-screen';
import { DesktopIcon } from './components/os/desktop-icon';
import { Dock } from './components/os/dock';
import { FolderGit2, Award, UserCircle, FileText, Briefcase, Terminal, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Home() {
  const { isBooted, windows, openApp, refreshUI, cycleWallpaper, wallpaperIndex } = useOSStore();
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0 });

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isBooted) return;
    const x = e.pageX + 220 > window.innerWidth ? window.innerWidth - 230 : e.pageX;
    const y = e.pageY + 160 > window.innerHeight ? window.innerHeight - 170 : e.pageY;
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
          
          {/* Background */}
          <img src={WALLPAPERS[wallpaperIndex]} alt="OS Background" className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none transition-opacity duration-500" />
          
          <MorphingWidget />
          <Dock />

          <div className="absolute top-8 left-8 flex flex-col gap-6 z-0">
            <DesktopIcon icon={FolderGit2} label="Projects" onClick={() => openApp('projects', 'Archive // Projects')} />
            <DesktopIcon icon={Award} label="Certificates" onClick={() => openApp('certs', 'Archive // Certificates')} />
            <DesktopIcon icon={Briefcase} label="Case Studies" onClick={() => openApp('cases', 'Archive // Case Studies')} />
            <DesktopIcon icon={UserCircle} label="About Me" onClick={() => openApp('about', 'User // About')} />
            <DesktopIcon icon={FileText} label="Resume.pdf" onClick={() => openApp('resume', 'System // Resume Viewer')} />
          </div>

          <div className="absolute inset-0 z-10 pointer-events-none">
            {Object.values(windows).map((win) => (
              <div key={win.id} className="pointer-events-auto">
                <WindowController id={win.id} title={win.title}>
                  
                  {/* Clean, modular app injection */}
                  {win.id === 'welcome' && <WelcomeApp />}
                  {win.id === 'terminal' && <TerminalApp />}
                  {win.id === 'projects' && <ProjectsApp/>}
                  
                  {win.id === 'projects' && (
                    <div className="p-10 h-full w-full flex items-center justify-center">
                      <span className="text-white/50 tracking-widest uppercase text-sm font-bold">Projects Grid Pending...</span>
                    </div>
                  )}
                  
                </WindowController>
              </div>
            ))}
          </div>

          {contextMenu.show && (
            <div style={{ top: contextMenu.y, left: contextMenu.x }} className="absolute z-[9999] w-56 rounded-2xl border border-white/20 shadow-[0_10px_40px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15)] bg-black/60 backdrop-blur-xl backdrop-saturate-150 flex flex-col p-1.5 overflow-hidden">
              <button onClick={refreshUI} className="flex items-center gap-3 w-full px-3 py-2 text-sm text-white/90 hover:bg-white/15 rounded-lg transition-colors font-medium text-left"><RefreshCw size={16} /> Refresh Interface</button>
              <div className="h-[1px] bg-white/10 my-1 mx-2" />
              <button onClick={() => openApp('terminal', 'System // Terminal')} className="flex items-center gap-3 w-full px-3 py-2 text-sm text-white/90 hover:bg-white/15 rounded-lg transition-colors font-medium text-left"><Terminal size={16} /> Open Terminal</button>
              <button onClick={cycleWallpaper} className="flex items-center gap-3 w-full px-3 py-2 text-sm text-white/90 hover:bg-white/15 rounded-lg transition-colors font-medium text-left"><ImageIcon size={16} /> Change Wallpaper</button>
            </div>
          )}

        </motion.div>
      )}
    </main>
  );
}