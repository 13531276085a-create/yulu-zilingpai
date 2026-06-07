import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, TextInput } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import ScreenContainer from '../components/layout/ScreenContainer';
import BackHeader from '../components/layout/BackHeader';
import ChineseText from '../components/ui/ChineseText';
import Divider from '../components/ui/Divider';
import { useSettingsStore } from '../store/settingsStore';
import { useHistoryStore } from '../store/historyStore';
import { Colors } from '../constants/theme';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Settings'> };

export default function SettingsScreen({ navigation }: Props) {
  const { settings, updateSettings } = useSettingsStore();
  const clearAll = useHistoryStore(s => s.clearAll);

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <BackHeader title="設定" />
        <Divider />

        {/* Draw count */}
        <View style={styles.row}>
          <View style={styles.label}>
            <ChineseText>抽牌數量</ChineseText>
            <ChineseText variant="caption" style={styles.hint}>每次抽取的牌數</ChineseText>
          </View>
          <View style={styles.opts}>
            {([3, 5] as const).map(n => (
              <TouchableOpacity key={n} onPress={() => updateSettings({ drawCount: n })} style={[styles.opt, settings.drawCount === n && styles.optActive]}>
                <ChineseText style={[styles.optText, settings.drawCount === n && styles.optTextActive]}>{n}張</ChineseText>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <Divider />

        <View style={styles.row}>
          <View style={styles.label}>
            <ChineseText>震動回饋</ChineseText>
            <ChineseText variant="caption" style={styles.hint}>抽牌時的觸覺回饋</ChineseText>
          </View>
          <Switch value={settings.enableVibration} onValueChange={v => updateSettings({ enableVibration: v })} trackColor={{ false: Colors.cardBorder, true: Colors.primary }} thumbColor="#FFF" />
        </View>
        <Divider />

        <View style={styles.row}>
          <View style={styles.label}>
            <ChineseText>字體大小</ChineseText>
          </View>
          <View style={styles.opts}>
            {(['medium', 'large'] as const).map(s => (
              <TouchableOpacity key={s} onPress={() => updateSettings({ fontSize: s })} style={[styles.opt, settings.fontSize === s && styles.optActive]}>
                <ChineseText style={[styles.optText, settings.fontSize === s && styles.optTextActive]}>{s === 'medium' ? '標準' : '較大'}</ChineseText>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <Divider />

        <Divider />

        {/* AI API Key */}
        <View style={styles.apiRow}>
          <ChineseText>AI 解讀 API Key</ChineseText>
          <ChineseText variant="caption" style={styles.hint}>輸入 Anthropic API Key 解鎖 AI 命理報告</ChineseText>
          <TextInput
            style={styles.apiInput}
            value={settings.aiApiKey}
            onChangeText={(v) => updateSettings({ aiApiKey: v })}
            placeholder="sk-ant-..."
            placeholderTextColor={Colors.textMuted}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>

        <Divider />

        <TouchableOpacity style={styles.dangerRow} onPress={() => {
          Alert.alert('清除歷史紀錄', '確定要清除所有占卜紀錄嗎？此操作無法復原。', [{ text: '取消', style: 'cancel' }, { text: '清除', style: 'destructive', onPress: clearAll }]);
        }}>
          <ChineseText style={styles.dangerText}>清除歷史紀錄</ChineseText>
        </TouchableOpacity>
        <Divider />

        <View style={styles.about}>
          <ChineseText style={styles.aboutText}>紫靈牌 紫微斗數靈牌占卜</ChineseText>
          <ChineseText variant="caption" style={styles.version}>版本 1.0.0  ·  作者 雨露</ChineseText>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingVertical: 16 },
  title: { textAlign: 'center', color: Colors.textPrimary },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  label: { flex: 1 },
  hint: { color: Colors.textMuted, marginTop: 2 },
  opts: { flexDirection: 'row', gap: 8 },
  opt: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1.5, borderColor: Colors.primaryLight },
  optActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  optText: { color: Colors.textSecondary },
  optTextActive: { color: '#FFF' },
  dangerRow: { alignItems: 'center', paddingVertical: 16 },
  dangerText: { color: Colors.btnDanger },
  about: { alignItems: 'center', paddingVertical: 16 },
  aboutText: { color: Colors.textMuted },
  version: { color: Colors.textMuted, marginTop: 4 },
  apiRow: { paddingVertical: 12 },
  apiInput: { backgroundColor: Colors.surfaceCard, borderRadius: 10, padding: 12, fontSize: 14, color: Colors.textPrimary, borderWidth: 1, borderColor: Colors.cardBorder, marginTop: 8, fontFamily: 'monospace' },
});
