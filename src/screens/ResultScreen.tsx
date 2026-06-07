import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import ScreenContainer from '../components/layout/ScreenContainer';
import ChineseText from '../components/ui/ChineseText';
import ChineseButton from '../components/ui/ChineseButton';
import Divider from '../components/ui/Divider';
import InterpretationCard from '../components/results/InterpretationCard';
import { useHistoryStore } from '../store/historyStore';
import { useSettingsStore } from '../store/settingsStore';
import { generateAIReport, generateFallbackReport } from '../utils/aiReport';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Result'>;
  route: RouteProp<RootStackParamList, 'Result'>;
};

// New theme colors matching draw screen
const VIOLET_DARK = '#2E1A4E';
const VIOLET = '#7C5CBF';
const VIOLET_LIGHT = '#B8A0D8';
const LAVENDER = '#EDE4F7';
const GOLD = '#C9A96E';
const WHITE = '#FFFFFF';
const BG_CARD = '#FFFBF8';
const BG_REPORT = '#FDF9F5';
const BORDER = '#E0D5CC';

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

  const renderReportContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (!line.trim()) return <View key={i} style={{ height: 6 }} />;
      if (line.startsWith('✦ ')) return <ChineseText key={i} style={S.sectionHead}>{line}</ChineseText>;
      if (line.startsWith('★ ')) return <ChineseText key={i} style={S.critical}>{line}</ChineseText>;
      if (line.startsWith('⚠ ')) return <ChineseText key={i} style={S.warning}>{line}</ChineseText>;
      if (line.startsWith('│') || line.startsWith('┌') || line.startsWith('└')) {
        return <ChineseText key={i} style={S.tableLine}>{line}</ChineseText>;
      }
      if (line.startsWith('推演')) return <ChineseText key={i} style={S.scenarioTitle}>{line}</ChineseText>;
      if (/^\d\./.test(line)) return <ChineseText key={i} style={S.advice}>{line}</ChineseText>;
      return <ChineseText key={i} style={S.body}>{line}</ChineseText>;
    });
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={S.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <ChineseText style={S.title}>占卜结果</ChineseText>
        <ChineseText style={S.q}>「{reading.question}」</ChineseText>
        <Divider />

        {/* Cards drawn */}
        <ChineseText style={S.secTitle}>抽出的靈牌</ChineseText>
        {reading.cards.map((dc) => (
          <InterpretationCard key={`${dc.cardId}-${dc.position}`} drawnCard={dc} />
        ))}

        <Divider />

        {/* AI / Fallback Report */}
        <View style={S.reportSection}>
          <ChineseText style={S.reportTitle}>AI 解读报告</ChineseText>
          <ChineseText style={S.reportSub}>发散性思维 · 整体观分析</ChineseText>

          {!aiReport && !aiLoading && (
            <ChineseButton title="生成解读报告" onPress={handleGenerateAI} variant="secondary" />
          )}

          {aiLoading && (
            <View style={S.loading}>
              <ActivityIndicator color={VIOLET} />
              <ChineseText style={S.loadTxt}>AI 正在运用发散性思维解读...</ChineseText>
            </View>
          )}

          {aiReport && (
            <View style={S.reportBox}>
              {renderReportContent(aiReport)}
            </View>
          )}
        </View>

        {!apiKey && !aiReport && (
          <ChineseText style={S.apiHint}>設定 API Key 解鎖 AI 運算 → 設定頁</ChineseText>
        )}

        {/* Actions */}
        <View style={S.actions}>
          <ChineseButton title="儲存結果" onPress={() => addReading(reading)} variant="primary" style={S.actBtn} />
          <ChineseButton title="重新抽牌" onPress={() => navigation.popToTop()} variant="outline" style={S.actBtn} />
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const S = StyleSheet.create({
  container: { paddingHorizontal: 22, paddingVertical: 18 },
  title: {
    textAlign: 'center', color: VIOLET_DARK, fontSize: 26,
    fontFamily: 'serif', fontWeight: '700', letterSpacing: 4,
  },
  q: { textAlign: 'center', color: VIOLET, marginTop: 6, fontSize: 14 },
  secTitle: {
    color: VIOLET_DARK, marginBottom: 10, fontSize: 18,
    fontFamily: 'serif', fontWeight: '700', letterSpacing: 2,
  },

  // Report section
  reportSection: { marginVertical: 8, alignItems: 'center' },
  reportTitle: {
    color: VIOLET_DARK, fontSize: 20, fontFamily: 'serif',
    fontWeight: '700', letterSpacing: 3, marginBottom: 4,
  },
  reportSub: {
    color: VIOLET_LIGHT, fontSize: 12, letterSpacing: 2, marginBottom: 14,
  },
  reportBox: {
    backgroundColor: BG_REPORT, borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: BORDER, width: '100%',
  },

  // Report text styles
  sectionHead: {
    color: VIOLET_DARK, fontSize: 15, fontWeight: '700',
    fontFamily: 'serif', letterSpacing: 2, marginTop: 12, marginBottom: 6,
  },
  body: {
    color: '#3D2A6E', fontSize: 13, lineHeight: 22,
    fontFamily: 'serif',
  },
  tableLine: {
    color: '#5A3A8E', fontSize: 11, lineHeight: 18,
    fontFamily: 'monospace',
  },
  scenarioTitle: {
    color: VIOLET, fontSize: 14, fontWeight: '700',
    fontFamily: 'serif', letterSpacing: 1, marginTop: 8, marginBottom: 4,
  },
  advice: {
    color: '#3D2A6E', fontSize: 13, lineHeight: 22,
    fontFamily: 'serif', paddingLeft: 4,
  },
  critical: {
    color: '#B5453C', fontSize: 13, fontWeight: '700',
    fontFamily: 'serif', lineHeight: 22,
  },
  warning: {
    color: '#E67E22', fontSize: 13, fontWeight: '700',
    fontFamily: 'serif', lineHeight: 22,
  },

  // Loading
  loading: { alignItems: 'center', paddingVertical: 24 },
  loadTxt: { color: VIOLET_LIGHT, marginTop: 12, fontSize: 13, letterSpacing: 2 },

  // Actions
  actions: { flexDirection: 'row', gap: 12, justifyContent: 'center', marginTop: 16 },
  actBtn: { flex: 1 },

  apiHint: { textAlign: 'center', color: VIOLET_LIGHT, fontSize: 11, marginBottom: 10 },
});
