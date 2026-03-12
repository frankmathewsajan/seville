import { create } from 'zustand';

interface WindowInstance {
  id: string;
  title: string;
  isOpen: boolean;
  isFocused: boolean;
  isMinimized: boolean; // Added for Dock integration
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

  setWallpaper: (index: number) => void;
  bootSystem: () => void;
  shutdown: () => void;
  openApp: (id: string, title: string) => void;
  focusApp: (id: string) => void;
  minimizeApp: (id: string) => void; // Added
  restoreApp: (id: string) => void;  // Added
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
    set({ isBooted: false, windows: {}, maxZ: 10 });
  },

  openApp: (id, title) => set((state) => {
    const newZ = state.maxZ + 1;
    
    // Remove focus from all other windows
    const updatedWindows = Object.keys(state.windows).reduce((acc, key) => {
      acc[key] = { ...state.windows[key], isFocused: false };
      return acc;
    }, {} as Record<string, WindowInstance>);

    return {
      windows: { 
        ...updatedWindows, 
        [id]: { id, title, isOpen: true, isFocused: true, isMinimized: false, zIndex: newZ } 
      },
      maxZ: newZ
    };
  }),
  
  focusApp: (id) => set((state) => {
    if (!state.windows[id]) return state;
    const newZ = state.maxZ + 1;
    
    // Set clicked window to focused, unfocus all others
    const updatedWindows = Object.keys(state.windows).reduce((acc, key) => {
      acc[key] = { ...state.windows[key], isFocused: key === id };
      return acc;
    }, {} as Record<string, WindowInstance>);

    updatedWindows[id].zIndex = newZ;
    // If it was minimized, interacting with it directly un-minimizes it
    updatedWindows[id].isMinimized = false;

    return {
      windows: updatedWindows,
      maxZ: newZ
    };
  }),

  minimizeApp: (id) => set((state) => {
    if (!state.windows[id]) return state;
    return {
      windows: {
        ...state.windows,
        [id]: { ...state.windows[id], isMinimized: true, isFocused: false }
      }
    };
  }),

  restoreApp: (id) => set((state) => {
    if (!state.windows[id]) return state;
    const newZ = state.maxZ + 1;
    
    // Focus the restored window, unfocus others
    const updatedWindows = Object.keys(state.windows).reduce((acc, key) => {
      acc[key] = { ...state.windows[key], isFocused: key === id };
      return acc;
    }, {} as Record<string, WindowInstance>);

    updatedWindows[id].isMinimized = false;
    updatedWindows[id].zIndex = newZ;

    return { 
      windows: updatedWindows,
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
  })),

  setWallpaper: (index) => set({ wallpaperIndex: index })
}));