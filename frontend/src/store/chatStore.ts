import { create } from 'zustand';

interface ChatStore {
  isOpen: boolean;
  isMinimized: boolean;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  minimizeChat: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  isOpen: false,
  isMinimized: false,
  openChat: () => set({ isOpen: true, isMinimized: false }),
  closeChat: () => set({ isOpen: false, isMinimized: false }),
  toggleChat: () => set((state) => ({ isOpen: !state.isOpen, isMinimized: false })),
  minimizeChat: () => set((state) => ({ isMinimized: !state.isMinimized })),
}));
