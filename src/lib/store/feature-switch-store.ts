import { create } from "zustand";

interface FeatureSwitchState {
  values: Record<string, boolean>;
  fields: any[];
  isReady: boolean;
  setFeatures: (values: Record<string, boolean>, fields?: any[]) => void;
  getFeature: (apiName: string, defaultValue?: boolean) => boolean;
}

export const useFeatureSwitchStore = create<FeatureSwitchState>((set, get) => ({
  values: {},
  fields: [],
  isReady: false,
  setFeatures: (values, fields = []) => set({ values, fields, isReady: true }),
  getFeature: (apiName, defaultValue = false) => {
    const state = get();
    if (apiName in state.values) {
      return state.values[apiName];
    }
    return defaultValue;
  },
}));
