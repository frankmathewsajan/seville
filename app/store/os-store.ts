import { create } from 'zustand';

interface WindowInstance {
  id: string;
  title: string;
  isOpen: boolean;
  isFocused: boolean;
  zIndex: number;
}

const WALLPAPERS = [
  '/image.jpg',
  '/image-1.jpg', // Abstract liquid
  '/image-2.jpg'  // Dark tech
];

interface OSState {
  windows: Record<string, WindowInstance>;
  maxZ: number;
  wallpaperIndex: number;
  
  openApp: (id: string, title: string) => void;
  focusApp: (id: string) => void;
  closeApp: (id: string) => void;
  
  // New OS Commands
  refreshUI: () => void;
  cycleWallpaper: () => void;
}

export const useOSStore = create<OSState>((set) => ({
  windows: {},
  maxZ: 10,
  wallpaperIndex: 0,

  openApp: (id, title) => set((state) => {
    const newZ = state.maxZ + 1;
    return {
      windows: {
        ...state.windows,
        [id]: { id, title, isOpen: true, isFocused: true, zIndex: newZ }
      },
      maxZ: newZ
    };
  }),
  focusApp: (id) => set((state) => {
    const newZ = state.maxZ + 1;
    return {
      windows: {
        ...state.windows,
        [id]: { ...state.windows[id], isFocused: true, zIndex: newZ }
      },
      maxZ: newZ
    };
  }),
  closeApp: (id) => set((state) => {
    const newWindows = { ...state.windows };
    delete newWindows[id];
    return { windows: newWindows };
  }),
  
  // The Kill Switch: Wipes all open windows and resets Z-index
  refreshUI: () => set({ windows: {}, maxZ: 10 }),
  
  // Cycles to the next wallpaper in the array
  cycleWallpaper: () => set((state) => ({ 
    wallpaperIndex: (state.wallpaperIndex + 1) % WALLPAPERS.length 
  }))
}));

export { WALLPAPERS };