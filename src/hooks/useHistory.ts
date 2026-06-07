import { useCallback } from 'react';
import { useHistoryStore } from '../store/historyStore';
import { ReadingRecord } from '../types';

export function useHistory() {
  const readings = useHistoryStore((s) => s.readings);
  const addReading = useHistoryStore((s) => s.addReading);
  const deleteReading = useHistoryStore((s) => s.deleteReading);
  const clearAll = useHistoryStore((s) => s.clearAll);

  const getReading = useCallback(
    (id: string): ReadingRecord | undefined => {
      return readings.find((r) => r.id === id);
    },
    [readings],
  );

  return {
    readings,
    addReading,
    deleteReading,
    clearAll,
    getReading,
    count: readings.length,
  };
}
