import { useState, useCallback } from 'react';
import { drawCards } from '../data/cardDeck';
import { DrawnCard, ReadingRecord } from '../types';
import { buildInterpretation } from '../utils/interpretation';
import { useSettingsStore } from '../store/settingsStore';
import { useHistoryStore } from '../store/historyStore';

export function useCardDraw(question: string) {
  const [loading, setLoading] = useState(false);
  const drawCount = useSettingsStore((s) => s.settings.drawCount);
  const addReading = useHistoryStore((s) => s.addReading);

  const draw = useCallback((): ReadingRecord => {
    setLoading(true);
    const cards = drawCards(drawCount);
    const drawn: DrawnCard[] = cards.map((dc, i) => ({
      cardId: dc.card.id,
      position: i + 1,
      nameZh: dc.card.nameZh,
      strengthState: dc.strength,
    }));
    const interp = buildInterpretation(drawn);
    const reading: ReadingRecord = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      timestamp: Date.now(),
      question,
      cards: drawn,
      interpretation: interp.aspects.overall,
      aspectBreakdown: interp.aspects,
      sihuaEffects: interp.sihua,
      sihuaYear: `${interp.sihuaDate.yearGan}${interp.sihuaDate.yearZhi}`,
      sihuaMonth: `${interp.sihuaDate.monthGan}${interp.sihuaDate.monthZhi}`,
    };
    addReading(reading);
    setLoading(false);
    return reading;
  }, [question, drawCount, addReading]);

  return { draw, loading };
}
