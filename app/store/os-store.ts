import { create } from 'zustand';

interface WindowInstance {
  id: string;
  title: string;
  isOpen: boolean;
  isFocused: boolean;
  zIndex: number;
}

export const WALLPAPERS = [
  '/image.jpg',
  '/image-1.jpg',
  '/image-2.jpg'
];

interface OSState {
  isBooted: boolean;
  windows: Record<string, WindowInstance>;
  maxZ: number;
  wallpaperIndex: number;
  
  bootSystem: () => void;
  shutdown: () => void;
  openApp: (id: string, title: string) => void;
  focusApp: (id: string) => void;
  closeApp: (id: string) => void;
  refreshUI: () => void;
  cycleWallpaper: () => void;
}

export const useOSStore = create<OSState>((set) => ({
  isBooted: false,
  windows: {},
  maxZ: 10,
  wallpaperIndex: 0,

  bootSystem: () => set({ isBooted: true }),
  
  shutdown: () => {
    // Exit fullscreen if active
    if (typeof document !== 'undefined' && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    set({ isBooted: false, windows: {}, maxZ: 10 });
  },

  openApp: (id, title) => set((state) => {
    const newZ = state.maxZ + 1;
    return {
      windows: { ...state.windows, [id]: { id, title, isOpen: true, isFocused: true, zIndex: newZ } },
      maxZ: newZ
    };
  }),
  
  focusApp: (id) => set((state) => {
    const newZ = state.maxZ + 1;
    return {
      windows: { ...state.windows, [id]: { ...state.windows[id], isFocused: true, zIndex: newZ } },
      maxZ: newZ
    };
  }),
  
  closeApp: (id) => set((state) => {
    const newWindows = { ...state.windows };
    delete newWindows[id];
    return { windows: newWindows };
  }),
  
  refreshUI: () => set({ windows: {}, maxZ: 10 }),
  
  cycleWallpaper: () => set((state) => ({ 
    wallpaperIndex: (state.wallpaperIndex + 1) % WALLPAPERS.length 
  }))
}));