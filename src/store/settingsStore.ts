import { create } from 'zustand';
import { AppSettings } from '../types';
import { loadData, saveData, KEYS } from '../storage/asyncStorage';

interface SettingsState {
  settings: AppSettings;
  loaded: boolean;
  updateSettings: (partial: Partial<AppSettings>) => void;
  loadFromStorage: () => Promise<void>;
}

const DEFAULT_SETTINGS: AppSettings = {
  drawCount: 3,
  enableVibration: true,
  showPalaceContext: false,
  fontSize: 'medium',
  aiApiKey: '',
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: { ...DEFAULT_SETTINGS },
  loaded: false,

  updateSettings: (partial) => {
    const updated = { ...get().settings, ...partial };
    set({ settings: updated });
    saveData(KEYS.SETTINGS, updated);
  },

  loadFromStorage: async () => {
    const stored = await loadData<AppSettings>(KEYS.SETTINGS);
    if (stored) {
      set({ settings: { ...DEFAULT_SETTINGS, ...stored }, loaded: true });
    } else {
      set({ loaded: true });
    }
  },
}));
