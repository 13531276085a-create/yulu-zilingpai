import React from 'react';
import { View, StyleSheet } from 'react-native';
import CardFlip from './CardFlip';
import { CardDefinition } from '../../types';

interface DrawnCardData {
  card: CardDefinition;
  strength: import('../../types').StrengthState;
}

interface Props {
  cards: DrawnCardData[];
  flippedCards: Record<number, boolean>;
  onCardFlip: (index: number) => void;
}

export default function CardSpread({ cards, flippedCards, onCardFlip }: Props) {
  return (
    <View style={styles.spread}>
      {cards.map((dc, i) => (
        <View
          key={`${dc.card.id}-${i}`}
          style={[
            styles.cardSlot,
            {
              transform: [
                { rotate: `${(i - (cards.length - 1) / 2) * 6}deg` },
                { translateY: Math.abs(i - (cards.length - 1) / 2) * 8 },
              ],
              zIndex: i,
            },
          ]}
        >
          <CardFlip
            card={dc.card}
            flipped={flippedCards[i] ?? false}
            onFlip={() => onCardFlip(i)}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  spread: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    gap: 4,
  },
  cardSlot: {},
});
