import { ALL_CARDS, MAJOR_STARS, AUXILIARY_STARS, MISCELLANEOUS_STARS } from '../constants/cards';
import { CardDefinition, StrengthState } from '../types';

export function getAllCards(): CardDefinition[] {
  return ALL_CARDS;
}

export function getCardsByCategory(): {
  major: CardDefinition[];
  auxiliary: CardDefinition[];
  misc: CardDefinition[];
} {
  return {
    major: MAJOR_STARS,
    auxiliary: AUXILIARY_STARS,
    misc: MISCELLANEOUS_STARS,
  };
}

export function getCardById(id: string): CardDefinition | undefined {
  return ALL_CARDS.find((c) => c.id === id);
}

const STRENGTH_POOL: StrengthState[] = ['廟', '旺', '旺', '利', '利', '利', '陷', '陷'];

export function randomStrength(): StrengthState {
  return STRENGTH_POOL[Math.floor(Math.random() * STRENGTH_POOL.length)];
}

// 灾煞/劫煞极低概率（权重1），其余卡牌均等（权重100）
const LOW_WEIGHT_IDS = new Set(['star_zaisha', 'star_jiesha']);
const NORMAL_WEIGHT = 100;
const LOW_WEIGHT = 1;

export function drawCards(count: number): { card: CardDefinition; strength: StrengthState }[] {
  const pool = ALL_CARDS.map((card) => ({
    card,
    weight: LOW_WEIGHT_IDS.has(card.id) ? LOW_WEIGHT : NORMAL_WEIGHT,
  }));

  const result: { card: CardDefinition; strength: StrengthState }[] = [];
  const available = [...pool];

  for (let k = 0; k < count && available.length > 0; k++) {
    const totalWeight = available.reduce((sum, item) => sum + item.weight, 0);
    let rand = Math.random() * totalWeight;
    let idx = 0;
    for (let i = 0; i < available.length; i++) {
      rand -= available[i].weight;
      if (rand <= 0) {
        idx = i;
        break;
      }
    }
    const chosen = available[idx];
    result.push({ card: chosen.card, strength: randomStrength() });
    available.splice(idx, 1);
  }

  return result;
}
