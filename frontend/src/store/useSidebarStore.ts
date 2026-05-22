import { create } from 'zustand';

interface SidebarState {
  isOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: true, // Mặc định mở trên desktop
  toggleSidebar: () => set((state) => ({ isOpen: !state.isOpen })),
  setSidebarOpen: (isOpen) => set({ isOpen }),
}));
