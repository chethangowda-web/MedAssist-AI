import { create } from 'zustand';
import type { DashboardStats, ActivityItem } from '@typings/index';

interface AppStore {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  dashboardStats: DashboardStats | null;
  setDashboardStats: (stats: DashboardStats) => void;
  activities: ActivityItem[];
  setActivities: (activities: ActivityItem[]) => void;
  isEmergencyMode: boolean;
  setEmergencyMode: (mode: boolean) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  dashboardStats: null,
  setDashboardStats: (dashboardStats) => set({ dashboardStats }),
  activities: [],
  setActivities: (activities) => set({ activities }),
  isEmergencyMode: false,
  setEmergencyMode: (isEmergencyMode) => set({ isEmergencyMode }),
}));
