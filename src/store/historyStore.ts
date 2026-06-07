import { create } from 'zustand';
import { ReadingRecord } from '../types';
import { loadData, saveData, KEYS } from '../storage/asyncStorage';

interface HistoryState {
  readings: ReadingRecord[];
  loaded: boolean;
  addReading: (reading: ReadingRecord) => void;
  deleteReading: (id: string) => void;
  getReading: (id: string) => ReadingRecord | undefined;
  clearAll: () => void;
  loadFromStorage: () => Promise<void>;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  readings: [],
  loaded: false,

  addReading: (reading) => {
    const updated = [reading, ...get().readings];
    set({ readings: updated });
    saveData(KEYS.HISTORY, updated);
  },

  deleteReading: (id) => {
    const updated = get().readings.filter((r) => r.id !== id);
    set({ readings: updated });
    saveData(KEYS.HISTORY, updated);
  },

  getReading: (id) => {
    return get().readings.find((r) => r.id === id);
  },

  clearAll: () => {
    set({ readings: [] });
    saveData(KEYS.HISTORY, []);
  },

  loadFromStorage: async () => {
    const stored = await loadData<ReadingRecord[]>(KEYS.HISTORY);
    if (stored) {
      set({ readings: stored, loaded: true });
    } else {
      set({ loaded: true });
    }
  },
}));
