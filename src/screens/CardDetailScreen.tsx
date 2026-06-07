import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import ScreenContainer from '../components/layout/ScreenContainer';
import BackHeader from '../components/layout/BackHeader';
import ChineseText from '../components/ui/ChineseText';
import Divider from '../components/ui/Divider';
import { ELEMENT_COLORS } from '../constants/fiveElements';
import { getCardInterpretation } from '../constants/interpretations';
import { Colors } from '../constants/theme';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CardDetail'>;
  route: RouteProp<RootStackParamList, 'CardDetail'>;
};

export default function CardDetailScreen({ route }: Props) {
  const { card } = route.params;
  const interp = getCardInterpretation(card.id);
  const elemColor = ELEMENT_COLORS[card.fiveElement];

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <BackHeader title={card.nameZh} />
        {/* Card preview */}
        <View style={styles.previewBox}>
          <View style={styles.nameRow}>
            <View style={[styles.elemDot, { backgroundColor: elemColor }]} />
            <ChineseText variant="headingLarge" style={styles.name}>{card.nameZh}</ChineseText>
          </View>
          <View style={styles.metaRow}>
            <View style={[styles.metaPill, { backgroundColor: elemColor + '15', borderColor: elemColor }]}>
              <ChineseText variant="caption" style={{ color: elemColor }}>{card.fiveElement}</ChineseText>
            </View>
            <View style={styles.metaPill}>
              <ChineseText variant="caption">{card.yinYang === '陽' ? '⚊ 陽' : '⚋ 陰'}</ChineseText>
            </View>
            <View style={styles.metaPill}>
              <ChineseText variant="caption">{card.direction}方</ChineseText>
            </View>
            <View style={[styles.metaPill, { borderColor: Colors.primary }]}>
              <ChineseText variant="caption" style={{ color: Colors.primary }}>
                {card.defaultStrength}
              </ChineseText>
            </View>
          </View>
        </View>

        <Divider />

        <ChineseText variant="headingSmall" style={styles.sectionTitle}>星曜簡介</ChineseText>
        <ChineseText style={styles.desc}>{card.description}</ChineseText>

        <Divider />
        <ChineseText variant="headingSmall" style={styles.sectionTitle}>關鍵詞</ChineseText>
        <View style={styles.keywordsRow}>
          {card.keywords.map(kw => (
            <View key={kw} style={[styles.kwPill, { borderColor: elemColor }]}>
              <ChineseText variant="bodySmall" style={{ color: elemColor }}>{kw}</ChineseText>
            </View>
          ))}
        </View>

        {interp && (
          <>
            <Divider />
            <ChineseText variant="headingSmall" style={styles.sectionTitle}>詳解</ChineseText>
            <View style={styles.interpBox}>
              {(['overall', 'career', 'love', 'wealth', 'health'] as const).map(aspect => (
                <View key={aspect} style={styles.interpItem}>
                  <ChineseText variant="bodySmall" style={styles.interpLabel}>
                    {{ overall: '綜合', career: '事業', love: '感情', wealth: '財運', health: '健康' }[aspect]}
                  </ChineseText>
                  <ChineseText style={styles.interpText}>{interp.aspects[aspect]}</ChineseText>
                </View>
              ))}
            </View>
          </>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingVertical: 16 },
  previewBox: { alignItems: 'center', paddingVertical: 20, backgroundColor: Colors.backgroundAlt, borderRadius: 16, borderWidth: 1, borderColor: Colors.cardBorder },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  elemDot: { width: 14, height: 14, borderRadius: 7 },
  name: { color: Colors.textPrimary, letterSpacing: 4 },
  metaRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  metaPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: Colors.primaryPale, borderWidth: 1, borderColor: Colors.cardBorder },
  sectionTitle: { color: Colors.textPrimary, marginBottom: 10 },
  desc: { color: Colors.textSecondary, lineHeight: 24 },
  keywordsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  kwPill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, borderWidth: 1.5 },
  interpBox: { backgroundColor: Colors.backgroundAlt, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: Colors.cardBorder, gap: 14 },
  interpItem: {},
  interpLabel: { color: Colors.primary, marginBottom: 2, fontWeight: '600' },
  interpText: { color: Colors.textSecondary, lineHeight: 22 },
});
