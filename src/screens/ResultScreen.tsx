import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, SiHuaType } from '../types';
import ScreenContainer from '../components/layout/ScreenContainer';
import ChineseText from '../components/ui/ChineseText';
import ChineseButton from '../components/ui/ChineseButton';
import Divider from '../components/ui/Divider';
import InterpretationCard from '../components/results/InterpretationCard';
import AspectBreakdown from '../components/results/AspectBreakdown';
import { useHistoryStore } from '../store/historyStore';
import { useSettingsStore } from '../store/settingsStore';
import { generateAIReport, generateFallbackReport } from '../utils/aiReport';
import { Colors, Shadows, BorderRadius } from '../constants/theme';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Result'>;
  route: RouteProp<RootStackParamList, 'Result'>;
};

const SIHUA: Record<SiHuaType, { color: string; bg: string }> = {
  '化祿': { color: '#4CAF50', bg: '#E8F5E9' },
  '化權': { color: '#FF9800', bg: '#FFF3E0' },
  '化科': { color: '#2196F3', bg: '#E3F2FD' },
  '化忌': { color: '#EF5350', bg: '#FFEBEE' },
};

export default function ResultScreen({ navigation, route }: Props) {
  const { reading } = route.params;
  const addReading = useHistoryStore((s) => s.addReading);
  const apiKey = useSettingsStore((s) => s.settings.aiApiKey);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const handleGenerateAI = async () => {
    setAiLoading(true);
    try {
      setAiReport(apiKey ? await generateAIReport(reading, apiKey) : generateFallbackReport(reading));
    } catch {
      setAiReport(generateFallbackReport(reading));
    }
    setAiLoading(false);
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={S.container} showsVerticalScrollIndicator={false}>
        <ChineseText style={S.title}>占卜结果</ChineseText>
        <ChineseText style={S.q}>「{reading.question}」</ChineseText>
        <Divider />

        {/* 四化 */}
        {reading.sihuaEffects && reading.sihuaEffects.length > 0 && (
          <View style={S.sihuaBox}>
            <ChineseText style={S.sihuaHead}>流年流月四化 · {reading.sihuaYear}年 {reading.sihuaMonth}月</ChineseText>
            {reading.sihuaEffects.map((eff, i) => (
              <View key={i} style={[S.sihuaItem, { borderLeftColor: SIHUA[eff.transformation].color, backgroundColor: SIHUA[eff.transformation].bg }]}>
                <View style={S.sihuaNameRow}>
                  <ChineseText style={S.sihuaStar}>{eff.starName}</ChineseText>
                  <View style={[S.sihuaBadge, { backgroundColor: SIHUA[eff.transformation].color }]}>
                    <ChineseText style={S.sihuaBadgeTxt}>{eff.transformation}</ChineseText>
                  </View>
                  <ChineseText style={S.sihuaSrc}>{eff.source}</ChineseText>
                </View>
                <ChineseText style={S.sihuaDesc}>{eff.meaning}</ChineseText>
              </View>
            ))}
          </View>
        )}

        <ChineseText style={S.secTitle}>抽出的牌</ChineseText>
        {reading.cards.map((dc) => (
          <InterpretationCard key={`${dc.cardId}-${dc.position}`} drawnCard={dc} />
        ))}

        <Divider />
        <ChineseText style={S.secTitle}>综合解读</ChineseText>
        <AspectBreakdown aspects={reading.aspectBreakdown} />
        <Divider />

        {/* AI */}
        <View style={S.aiSection}>
          <ChineseText style={S.aiTitle}>AI 解读报告</ChineseText>
          {!aiReport && !aiLoading && (
            <ChineseButton title="生成 AI 解读报告" onPress={handleGenerateAI} variant="secondary" />
          )}
          {aiLoading && (
            <View style={S.aiLoading}><ActivityIndicator color={Colors.primary} /><ChineseText style={S.aiLoadTxt}>AI 正在解读...</ChineseText></View>
          )}
          {aiReport && (
            <View style={S.aiBox}><ChineseText style={S.aiTxt}>{aiReport}</ChineseText></View>
          )}
        </View>

        {!apiKey && !aiReport && (
          <ChineseText style={S.apiHint}>设定 API Key 解锁专属 AI 解读 → 前往设定页</ChineseText>
        )}

        <View style={S.actions}>
          <ChineseButton title="储存结果" onPress={() => addReading(reading)} variant="primary" style={S.actBtn} />
          <ChineseButton title="重新抽牌" onPress={() => navigation.popToTop()} variant="outline" style={S.actBtn} />
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const S = StyleSheet.create({
  container: { paddingHorizontal: 22, paddingVertical: 18 },
  title: { textAlign: 'center', color: Colors.textPrimary, fontSize: 26, fontFamily: 'serif', fontWeight: '700', letterSpacing: 4 },
  q: { textAlign: 'center', color: Colors.textSecondary, marginTop: 6, fontSize: 14 },
  secTitle: { color: Colors.textPrimary, marginBottom: 10, fontSize: 18, fontFamily: 'serif', fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 12, justifyContent: 'center', marginTop: 8 },
  actBtn: { flex: 1 },
  // 四化
  sihuaBox: { marginBottom: 12, backgroundColor: '#FFF', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: Colors.cardBorder, ...Shadows.sm },
  sihuaHead: { color: Colors.primaryDark, textAlign: 'center', fontSize: 14, fontWeight: '700', marginBottom: 10 },
  sihuaItem: { borderLeftWidth: 3, paddingLeft: 10, padding: 10, borderRadius: 8, marginBottom: 6 },
  sihuaNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  sihuaStar: { fontWeight: '700', fontSize: 15, color: Colors.textPrimary },
  sihuaBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  sihuaBadgeTxt: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  sihuaSrc: { color: Colors.textMuted, fontSize: 11 },
  sihuaDesc: { color: Colors.textSecondary, fontSize: 12, lineHeight: 18 },
  // AI
  aiSection: { marginVertical: 8, alignItems: 'center' },
  aiTitle: { color: Colors.primaryDark, fontSize: 18, fontFamily: 'serif', fontWeight: '700', marginBottom: 14 },
  aiLoading: { alignItems: 'center', paddingVertical: 20 },
  aiLoadTxt: { color: Colors.textSecondary, marginTop: 10 },
  aiBox: { backgroundColor: '#FFFBF5', borderRadius: 14, padding: 18, borderWidth: 1, borderColor: '#E8D8C0', width: '100%' },
  aiTxt: { color: Colors.textPrimary, fontSize: 14, lineHeight: 24 },
  apiHint: { textAlign: 'center', color: Colors.textMuted, fontSize: 11, marginBottom: 10 },
});
