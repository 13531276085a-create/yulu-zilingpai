import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TextInput, Animated, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import ScreenContainer from '../components/layout/ScreenContainer';
import ChineseText from '../components/ui/ChineseText';
import ChineseButton from '../components/ui/ChineseButton';
import { Colors, Shadows, BorderRadius } from '../constants/theme';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Home'> };

export default function HomeScreen({ navigation }: Props) {
  const [question, setQuestion] = useState('');
  const spin = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(Animated.timing(spin, { toValue: 1, duration: 40000, useNativeDriver: true })).start();
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1.03, duration: 2500, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1, duration: 2500, useNativeDriver: true }),
    ])).start();
  }, []);

  const rot = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <ScreenContainer>
      <KeyboardAvoidingView style={S.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={S.bgTop} />
        <View style={S.bgMid} />

        <View style={S.content}>
          {/* Hero */}
          <View style={S.hero}>
            <Animated.View style={[S.lotus, Shadows.glow, { transform: [{ scale: pulse }] }]}>
              <Animated.Text style={[S.lotusIcon, { transform: [{ rotate: rot }] }]}>☯</Animated.Text>
            </Animated.View>
            <ChineseText style={S.title}>雨露紫灵牌</ChineseText>
            <ChineseText style={S.sub}>紫微斗數 · 靈牌占卜</ChineseText>
          </View>

          {/* Question input card */}
          <View style={[S.inputCard, Shadows.md]}>
            <ChineseText style={S.inputLabel}>写下你的问题</ChineseText>
            <TextInput
              style={S.input}
              value={question}
              onChangeText={setQuestion}
              placeholder="例如：我目前的感情状况如何发展？"
              placeholderTextColor={Colors.textMuted}
              multiline
              maxLength={200}
              textAlignVertical="top"
            />
            <View style={S.inputFooter}>
              <ChineseText style={S.charCount}>{question.length}/200</ChineseText>
            </View>
          </View>

          {/* CTA */}
          <Animated.View style={{ transform: [{ scale: pulse }] }}>
            <ChineseButton
              title="静心抽牌"
              onPress={() => navigation.navigate('Draw', { question: question || '未寫下問題' })}
              variant="primary"
            />
          </Animated.View>

          {/* Bottom nav */}
          <View style={S.nav}>
            <ChineseButton title="历史纪录" onPress={() => navigation.navigate('History')} variant="outline" style={S.navBtn} />
            <ChineseButton title="星曜图鉴" onPress={() => navigation.navigate('Encyclopedia')} variant="outline" style={S.navBtn} />
            <ChineseButton title="设定" onPress={() => navigation.navigate('Settings')} variant="outline" style={S.navBtn} />
          </View>

          <ChineseText style={S.author}>—— 雨露 · 作者陈国禧 ——</ChineseText>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const S = StyleSheet.create({
  root: { flex: 1 },
  bgTop: { position: 'absolute', top: -120, right: -80, width: 300, height: 300, borderRadius: 150, backgroundColor: Colors.primaryPale, opacity: 0.35 },
  bgMid: { position: 'absolute', bottom: -80, left: -60, width: 220, height: 220, borderRadius: 110, backgroundColor: Colors.primaryPale, opacity: 0.25 },
  content: { flex: 1, paddingHorizontal: 28, justifyContent: 'center' },
  hero: { alignItems: 'center', marginBottom: 20 },
  lotus: { width: 76, height: 76, borderRadius: 38, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', marginBottom: 14, borderWidth: 1, borderColor: Colors.cardBorder },
  lotusIcon: { fontSize: 30, color: Colors.primary },
  title: { color: Colors.primaryDark, letterSpacing: 8, fontSize: 30 },
  sub: { color: Colors.textMuted, marginTop: 6, fontSize: 13, letterSpacing: 5 },
  inputCard: { backgroundColor: '#FFF', borderRadius: BorderRadius.lg, padding: 20, marginBottom: 18, borderWidth: 1, borderColor: Colors.cardBorder },
  inputLabel: { color: Colors.textSecondary, fontSize: 14, fontWeight: '600', marginBottom: 10 },
  input: { fontSize: 16, fontFamily: 'serif', color: Colors.textPrimary, minHeight: 80, lineHeight: 24 },
  inputFooter: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 },
  charCount: { color: Colors.textMuted, fontSize: 12 },
  nav: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 16 },
  navBtn: { flex: 1, paddingVertical: 12, paddingHorizontal: 6, borderRadius: BorderRadius.md },
  author: { textAlign: 'center', color: Colors.textMuted, marginTop: 20, fontSize: 11, letterSpacing: 3 },
});
