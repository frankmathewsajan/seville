'use client';

import { useOSStore } from '@/app/store/os-store';
import { Settings, FolderGit2, Terminal } from 'lucide-react';

export function Dock() {
  const { openApp } = useOSStore();

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-2 p-3 rounded-[32px] border border-white/20 shadow-[0_10px_40px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.15)] bg-black/40 backdrop-blur-2xl backdrop-saturate-150">
        <button onClick={() => openApp('settings', 'System // Settings')} className="p-3 rounded-2xl hover:bg-white/15 hover:scale-110 active:scale-95 transition-all group">
          <Settings className="w-6 h-6 text-white/80 group-hover:text-white drop-shadow-md" strokeWidth={2} />
        </button>
        <div className="w-[1px] h-8 bg-white/15 mx-1" />
        <button onClick={() => openApp('projects', 'Archive // Projects')} className="p-3 rounded-2xl hover:bg-white/15 hover:scale-110 active:scale-95 transition-all group">
          <FolderGit2 className="w-6 h-6 text-white/80 group-hover:text-white drop-shadow-md" strokeWidth={2} />
        </button>
        <button onClick={() => openApp('terminal', 'System // Terminal')} className="p-3 rounded-2xl hover:bg-white/15 hover:scale-110 active:scale-95 transition-all group">
          <Terminal className="w-6 h-6 text-white/80 group-hover:text-white drop-shadow-md" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}