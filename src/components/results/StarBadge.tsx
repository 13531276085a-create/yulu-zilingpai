import React from 'react';
import { View, StyleSheet } from 'react-native';
import ChineseText from '../ui/ChineseText';
import { ELEMENT_COLORS } from '../../constants/fiveElements';
import { FiveElement, StrengthState } from '../../types';
import { Colors } from '../../constants/theme';

interface Props { name: string; element: FiveElement; strength: StrengthState }

export default function StarBadge({ name, element, strength }: Props) {
  const color = ELEMENT_COLORS[element];
  return (
    <View style={styles.container}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <ChineseText variant="headingSmall" style={styles.name}>{name}</ChineseText>
      <View style={[styles.strength, { backgroundColor: color + '15', borderColor: color + '40' }]}>
        <View style={[styles.sDot, { backgroundColor: color }]} />
        <ChineseText variant="caption" style={[styles.strengthText, { color }]}>{strength}</ChineseText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  name: { color: Colors.textPrimary },
  strength: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  sDot: { width: 5, height: 5, borderRadius: 3 },
  strengthText: { fontWeight: '600' },
});
