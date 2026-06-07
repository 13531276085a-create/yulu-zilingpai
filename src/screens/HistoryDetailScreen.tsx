import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, SiHuaType } from '../types';
import ScreenContainer from '../components/layout/ScreenContainer';
import BackHeader from '../components/layout/BackHeader';
import ChineseText from '../components/ui/ChineseText';
import Divider from '../components/ui/Divider';
import InterpretationCard from '../components/results/InterpretationCard';
import AspectBreakdown from '../components/results/AspectBreakdown';
import { Colors } from '../constants/theme';

type Props = { route: RouteProp<RootStackParamList, 'HistoryDetail'> };

const SIHUA_COLORS: Record<SiHuaType, string> = {
  '化祿': '#4CAF50', '化權': '#FF9800', '化科': '#2196F3', '化忌': '#F44336',
};

export default function HistoryDetailScreen({ route }: Props) {
  const { reading } = route.params;
  const d = new Date(reading.timestamp);
  const dateStr = `${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`;

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <BackHeader title="過往紀錄" />
        <ChineseText style={styles.question}>「{reading.question}」</ChineseText>
        <ChineseText variant="caption" style={styles.date}>{dateStr}</ChineseText>
        <Divider />

        {reading.sihuaEffects && reading.sihuaEffects.length > 0 && (
          <>
            <View style={styles.sihuaBox}>
              <ChineseText variant="headingSmall" style={styles.sihuaTitle}>四化提示</ChineseText>
              <ChineseText style={styles.sihuaDate}>{reading.sihuaYear}年 · {reading.sihuaMonth}月</ChineseText>
              {reading.sihuaEffects.map((eff, i) => (
                <View key={i} style={[styles.sihuaRow, { borderLeftColor: SIHUA_COLORS[eff.transformation] }]}>
                  <View style={styles.sihuaHeader}>
                    <ChineseText style={styles.sihuaStar}>{eff.starName}</ChineseText>
                    <View style={[styles.sihuaBadge, { backgroundColor: SIHUA_COLORS[eff.transformation] }]}>
                      <ChineseText style={styles.sihuaBadgeText}>{eff.transformation}</ChineseText>
                    </View>
                    <ChineseText variant="caption" style={styles.sihuaSource}>{eff.source}</ChineseText>
                  </View>
                  <ChineseText style={styles.sihuaMeaning}>{eff.meaning}</ChineseText>
                </View>
              ))}
            </View>
            <Divider />
          </>
        )}

        <ChineseText variant="headingSmall" style={styles.sectionTitle}>抽出之牌</ChineseText>
        {reading.cards.map(dc => <InterpretationCard key={`${dc.cardId}-${dc.position}`} drawnCard={dc} />)}
        <Divider />
        <ChineseText variant="headingSmall" style={styles.sectionTitle}>綜合解讀</ChineseText>
        <AspectBreakdown aspects={reading.aspectBreakdown} />
        <Divider />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 40 },
  title: { textAlign: 'center', color: Colors.textPrimary },
  question: { textAlign: 'center', color: Colors.textSecondary, marginTop: 8 },
  date: { textAlign: 'center', color: Colors.textMuted, marginTop: 4 },
  sectionTitle: { color: Colors.textPrimary, marginBottom: 8 },
  sihuaBox: { backgroundColor: Colors.backgroundAlt, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: Colors.cardBorder, marginBottom: 4 },
  sihuaTitle: { color: Colors.primaryDark, textAlign: 'center' },
  sihuaDate: { textAlign: 'center', color: Colors.textSecondary, marginTop: 4, marginBottom: 12, fontSize: 13 },
  sihuaRow: { borderLeftWidth: 3, paddingLeft: 12, marginBottom: 10, backgroundColor: Colors.surfaceCard, borderRadius: 8, padding: 10 },
  sihuaHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  sihuaStar: { fontWeight: '700', fontSize: 15, color: Colors.textPrimary },
  sihuaBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  sihuaBadgeText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  sihuaSource: { color: Colors.textMuted },
  sihuaMeaning: { color: Colors.textSecondary, fontSize: 13, lineHeight: 20 },
});
