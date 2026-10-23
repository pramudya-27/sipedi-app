import { create } from 'zustand';

interface UIState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
 
  isSidebarOpen: (() => {
    const saved = localStorage.getItem('sipedi_sidebar_open');
    return saved !== null ? JSON.parse(saved) : true;
  })(),

  toggleSidebar: () =>
    set((state) => {
      const nextState = !state.isSidebarOpen;
      localStorage.setItem('sipedi_sidebar_open', JSON.stringify(nextState));
      return { isSidebarOpen: nextState };
    }),

  setSidebarOpen: (isOpen: boolean) => {
    localStorage.setItem('sipedi_sidebar_open', JSON.stringify(isOpen));
    set({ isSidebarOpen: isOpen });
  },
}));