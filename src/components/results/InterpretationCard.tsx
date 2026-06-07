import React from 'react';
import { View, StyleSheet } from 'react-native';
import ChineseText from '../ui/ChineseText';
import StarBadge from './StarBadge';
import { DrawnCard } from '../../types';
import { getCardById } from '../../data/cardDeck';
import { getStrengthDescription } from '../../constants/interpretations';
import { Colors, Shadows, BorderRadius } from '../../constants/theme';

interface Props { drawnCard: DrawnCard }

export default function InterpretationCard({ drawnCard }: Props) {
  const card = getCardById(drawnCard.cardId);
  if (!card) return null;

  return (
    <View style={[styles.container, Shadows.sm]}>
      {/* Header with star badge */}
      <StarBadge name={card.nameZh} element={card.fiveElement} strength={drawnCard.strengthState} />

      {/* Strength */}
      <View style={styles.strengthRow}>
        <ChineseText variant="caption" style={styles.strengthLabel}>狀態</ChineseText>
        <ChineseText style={styles.strengthDesc}>
          {getStrengthDescription(drawnCard.strengthState)}
        </ChineseText>
      </View>

      {/* Description */}
      <ChineseText style={styles.desc}>{card.description}</ChineseText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: BorderRadius.lg,
    padding: 16,
    marginVertical: 7,
    borderWidth: 1,
    borderColor: Colors.cardBorderLight,
  },
  strengthRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 10,
    gap: 6,
    backgroundColor: Colors.primaryPale,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  strengthLabel: {
    color: Colors.primary,
    flexShrink: 0,
    fontWeight: '600',
  },
  strengthDesc: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  desc: {
    marginTop: 10,
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
});
