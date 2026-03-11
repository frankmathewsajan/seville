'use client';

import { useEffect, useState } from 'react';
import { useOSStore, WALLPAPERS } from './store/os-store';
import { WindowController } from './components/os/window-controller';
import { LiquidGlass } from './components/liquid/liquid-glass';
import { TerminalApp } from './components/os/apps/terminal';
import { 
  FolderGit2, Award, UserCircle, FileText, Briefcase, PenTool, 
  Settings, Terminal, RefreshCw, Image as ImageIcon 
} from 'lucide-react';

// Upgraded: Icons are now made of physical Liquid Glass
const DesktopIcon = ({ icon: Icon, label, onClick }: { icon: any, label: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="group flex flex-col items-center gap-2 w-24 p-2 rounded-xl focus:outline-none"
  >
    {/* Micro-Glass Settings for Icons */}
    <LiquidGlass
      glassThickness={20}
      bezelWidth={5}
      refractiveIndex={1.2}
      blur={0.2}
      dpr={1} // CRITICAL for performance with many icons
      className="w-14 h-14 rounded-2xl border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.3)] bg-white/5 flex items-center justify-center group-hover:scale-105 group-active:scale-95 transition-transform"
    >
      <Icon className="w-7 h-7 text-white drop-shadow-md" strokeWidth={1.5} />
    </LiquidGlass>
    <span className="text-xs font-medium text-white tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-center leading-tight">
      {label}
    </span>
  </button>
);

export default function Desktop() {
  const { windows, openApp, refreshUI, cycleWallpaper, wallpaperIndex } = useOSStore();
  
  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{ show: boolean, x: number, y: number }>({ show: false, x: 0, y: 0 });

  useEffect(() => {
    openApp('welcome', 'System 26 // Neural Explorer');
  }, []);

  // 1. Hijack the Right-Click
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault(); // Kills the browser default menu
    
    // Prevent menu from bleeding off the bottom/right edges
    const menuWidth = 220;
    const menuHeight = 160;
    const x = e.pageX + menuWidth > window.innerWidth ? window.innerWidth - menuWidth - 10 : e.pageX;
    const y = e.pageY + menuHeight > window.innerHeight ? window.innerHeight - menuHeight - 10 : e.pageY;

    setContextMenu({ show: true, x, y });
  };

  // 2. Click anywhere else to close the menu
  const handleClickAway = () => {
    if (contextMenu.show) setContextMenu({ ...contextMenu, show: false });
  };

  return (
    <main 
      className="relative h-screen w-full overflow-hidden bg-[#0d0a0b]"
      onContextMenu={handleContextMenu}
      onClick={handleClickAway}
    >
      {/* Dynamic Wallpaper */}
      <img 
        src={WALLPAPERS[wallpaperIndex]} 
        alt="OS Background" 
        className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none transition-opacity duration-500"
      />

      {/* Desktop Icons */}
      <div className="absolute top-8 left-8 flex flex-col gap-6 z-0">
        <DesktopIcon icon={FolderGit2} label="Projects" onClick={() => openApp('projects', 'Archive // Projects')} />
        <DesktopIcon icon={Award} label="Certificates" onClick={() => openApp('certs', 'Archive // Certificates')} />
        <DesktopIcon icon={Briefcase} label="Case Studies" onClick={() => openApp('cases', 'Archive // Case Studies')} />
        <DesktopIcon icon={UserCircle} label="About Me" onClick={() => openApp('about', 'User // About')} />
        <DesktopIcon icon={FileText} label="Resume.pdf" onClick={() => openApp('resume', 'System // Resume Viewer')} />
        <DesktopIcon icon={PenTool} label="Blog" onClick={() => openApp('blog', 'Network // Blog')} />
      </div>

      {/* Window Management Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {Object.values(windows).map((win) => (
          <div key={win.id} className="pointer-events-auto">
            <WindowController id={win.id} title={win.title}>
              {win.id === 'welcome' && (
                <div className="space-y-6">
                  <h1 className="text-5xl font-black tracking-tighter drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
                    Liquid Architecture.
                  </h1>
                  <p className="text-white/80 text-lg max-w-md drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] font-medium">
                    Right-click anywhere on the desktop to access system controls, refresh the UI, or change the wallpaper.
                  </p>
                </div>
              )}
              {win.id === 'terminal' && <TerminalApp />}
            </WindowController>
          </div>
        ))}
      </div>

      {/* The Context Menu */}
      {contextMenu.show && (
        <div 
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="absolute z-[9999]" // Highest possible Z-index
        >
          <LiquidGlass
            glassThickness={30}
            bezelWidth={6}
            refractiveIndex={1.4}
            blur={0.5}
            dpr={1}
            className="w-56 rounded-2xl border border-white/20 shadow-[0_10px_40px_rgba(0,0,0,0.8)] bg-white/10 flex flex-col p-1.5 overflow-hidden"
          >
            <button 
              onClick={refreshUI}
              className="flex items-center gap-3 w-full px-3 py-2 text-sm text-white/90 hover:bg-white/15 rounded-lg transition-colors font-medium text-left"
            >
              <RefreshCw size={16} /> Refresh Interface
            </button>
            
            <div className="h-[1px] bg-white/10 my-1 mx-2" />
            
            <button 
              onClick={() => openApp('terminal', 'System // Terminal')}
              className="flex items-center gap-3 w-full px-3 py-2 text-sm text-white/90 hover:bg-white/15 rounded-lg transition-colors font-medium text-left"
            >
              <Terminal size={16} /> Open Terminal
            </button>
            <button 
              onClick={cycleWallpaper}
              className="flex items-center gap-3 w-full px-3 py-2 text-sm text-white/90 hover:bg-white/15 rounded-lg transition-colors font-medium text-left"
            >
              <ImageIcon size={16} /> Change Wallpaper
            </button>
          </LiquidGlass>
        </div>
      )}

      {/* The Liquid Dock */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50">
        <LiquidGlass 
          glassThickness={40}
          bezelWidth={8} 
          refractiveIndex={1.3} 
          blur={0.4}
          dpr={1}
          className="flex items-center gap-2 p-3 rounded-[32px] border border-white/20 shadow-[0_10px_40px_rgba(0,0,0,0.5)] bg-white/5"
        >
          <button onClick={() => openApp('settings', 'System // Settings')} className="p-3 rounded-2xl hover:bg-white/10 hover:scale-110 active:scale-95 transition-all group">
            <Settings className="w-6 h-6 text-white/80 group-hover:text-white drop-shadow-md" strokeWidth={2} />
          </button>
          <div className="w-[1px] h-8 bg-white/15 mx-1" />
          <button onClick={() => openApp('projects', 'Archive // Projects')} className="p-3 rounded-2xl hover:bg-white/10 hover:scale-110 active:scale-95 transition-all group">
            <FolderGit2 className="w-6 h-6 text-white/80 group-hover:text-white drop-shadow-md" strokeWidth={2} />
          </button>
          <button onClick={() => openApp('terminal', 'System // Terminal')} className="p-3 rounded-2xl hover:bg-white/10 hover:scale-110 active:scale-95 transition-all group">
            <Terminal className="w-6 h-6 text-white/80 group-hover:text-white drop-shadow-md" strokeWidth={2} />
          </button>
        </LiquidGlass>
      </div>
    </main>
  );
}