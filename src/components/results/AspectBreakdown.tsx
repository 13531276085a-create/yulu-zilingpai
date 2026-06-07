import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import ChineseText from '../ui/ChineseText';
import { AspectInterpretation } from '../../types';
import { Colors } from '../../constants/theme';

interface Props { aspects: AspectInterpretation }
type Tab = 'overall' | 'career' | 'love' | 'wealth' | 'health';
const TABS: { key: Tab; label: string }[] = [
  { key: 'overall', label: '綜合' }, { key: 'career', label: '事業' }, { key: 'love', label: '感情' }, { key: 'wealth', label: '財運' }, { key: 'health', label: '健康' },
];

export default function AspectBreakdown({ aspects }: Props) {
  const [active, setActive] = useState<Tab>('overall');
  return (
    <View style={styles.container}>
      <View style={styles.tabRow}>
        {TABS.map(t => (
          <TouchableOpacity key={t.key} onPress={() => setActive(t.key)} style={[styles.tab, active === t.key && styles.tabActive]}>
            <ChineseText variant="caption" style={[styles.tabText, active === t.key && styles.tabTextActive]}>{t.label}</ChineseText>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.content}>
        <ChineseText style={styles.text}>{aspects[active]}</ChineseText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 12 },
  tabRow: { flexDirection: 'row', gap: 2, paddingHorizontal: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: Colors.primary },
  tabText: { color: Colors.textMuted },
  tabTextActive: { color: Colors.primary, fontWeight: '600' },
  content: { padding: 16, backgroundColor: Colors.backgroundAlt, borderRadius: 12, marginTop: 12, borderWidth: 1, borderColor: Colors.cardBorder },
  text: { color: Colors.textSecondary, fontSize: 14, lineHeight: 24 },
});
