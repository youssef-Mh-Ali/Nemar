import { create } from "zustand";
import { UnitFilters } from "../types";

interface AppState {
  // PWA Install
  installPromptEvent: BeforeInstallPromptEvent | null;
  isInstallable: boolean;
  showInstallBanner: boolean;
  setInstallPrompt: (event: BeforeInstallPromptEvent | null) => void;
  setShowInstallBanner: (show: boolean) => void;
  dismissInstallBanner: () => void;

  // Search Filters
  filters: UnitFilters;
  setFilters: (filters: UnitFilters) => void;
  clearFilters: () => void;

  // UI State
  isFilterDrawerOpen: boolean;
  setFilterDrawerOpen: (open: boolean) => void;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export const useAppStore = create<AppState>((set) => ({
  // PWA Install
  installPromptEvent: null,
  isInstallable: false,
  showInstallBanner: true,
  setInstallPrompt: (event) =>
    set({ installPromptEvent: event, isInstallable: event !== null }),
  setShowInstallBanner: (show) => set({ showInstallBanner: show }),
  dismissInstallBanner: () => set({ showInstallBanner: false }),

  // Search Filters
  filters: {},
  setFilters: (filters) => set({ filters }),
  clearFilters: () => set({ filters: {} }),

  // UI State
  isFilterDrawerOpen: false,
  setFilterDrawerOpen: (open) => set({ isFilterDrawerOpen: open }),
}));

