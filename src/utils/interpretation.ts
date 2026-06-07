import { DrawnCard, AspectInterpretation } from '../types';
import { getCardInterpretation, getStrengthDescription } from '../constants/interpretations';
import { getCurrentSiHua, checkDrawnStarsSiHua, SiHuaEffect } from './sihua';
import { getCardById } from '../data/cardDeck';

function getAspectText(cardId: string, aspect: keyof AspectInterpretation): string {
  const interp = getCardInterpretation(cardId);
  if (interp) return interp.aspects[aspect];
  const fallbacks: Record<string, string> = {
    overall: '此星當值，影響當前局勢。須細察其五行生剋與所在宮位，方可明瞭其用。',
    career: '事業發展需參考此星所主之象，順應其性而為。',
    love: '感情之事與此星息息相關，隨其旺衰而變化。',
    wealth: '財運受此星影響，理財須契合其性。',
    health: '身體狀況由此星所主，養生當順其道。',
  };
  return fallbacks[aspect] ?? fallbacks.overall;
}

export function buildInterpretation(cards: DrawnCard[]): { aspects: AspectInterpretation; sihua: SiHuaEffect[]; sihuaDate: ReturnType<typeof getCurrentSiHua> } {
  const aspects: (keyof AspectInterpretation)[] = ['overall', 'career', 'love', 'wealth', 'health'];
  const result: AspectInterpretation = { overall: '', career: '', love: '', wealth: '', health: '' };

  for (const aspect of aspects) {
    const parts: string[] = [];
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const positionLabel = cards.length > 1 ? `第${i + 1}張牌` : '';
      const prefix = positionLabel ? `${positionLabel}【${card.nameZh}】` : `【${card.nameZh}】`;
      const aspectText = getAspectText(card.cardId, aspect);
      const strengthNote = aspect === 'overall'
        ? `（${card.strengthState}位：${getStrengthDescription(card.strengthState)}）`
        : '';
      parts.push(`${prefix}${strengthNote}\n${aspectText}`);
    }
    if (cards.length > 1 && aspect === 'overall') {
      parts.push('\n【綜合提示】多張牌同時出現，表示當下局勢複雜多變。各星之力交織影響，請綜合參看各方面解讀，以得全貌。');
    }
    result[aspect] = parts.join('\n\n');
  }

  // 四化分析
  const sihuaDate = getCurrentSiHua(new Date());
  const drawnIds = cards.map((c) => c.cardId);
  const sihua = checkDrawnStarsSiHua(drawnIds, sihuaDate);
  // Fill star names
  for (const s of sihua) {
    const card = getCardById(s.starId);
    if (card) s.starName = card.nameZh;
  }

  // Add 四化 context to overall interpretation
  if (sihua.length > 0) {
    const sihuaText = sihua.map((s) =>
      `【${s.starName}·${s.transformation}（${s.source}）】${s.meaning}`
    ).join('\n');
    result.overall += `\n\n═══ 流年流月四化提示 ═══\n當前：${sihuaDate.yearGan}${sihuaDate.yearZhi}年 · ${sihuaDate.monthGan}${sihuaDate.monthZhi}月\n${sihuaText}`;
  }

  return { aspects: result, sihua, sihuaDate };
}
