import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  View, StyleSheet, TouchableOpacity, Dimensions, Vibration, Platform,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  Easing,
  interpolate,
  SharedValue,
} from 'react-native-reanimated';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, ReadingRecord, CardDefinition } from '../types';
import MagicCircle from '../components/effects/MagicCircle';
import ParticleField from '../components/effects/ParticleField';
import CardBack from '../components/cards/CardBack';
import CardFace from '../components/cards/CardFace';
import ShuffleOverlay from '../components/cards/ShuffleOverlay';
import ChineseText from '../components/ui/ChineseText';
import { ALL_CARDS } from '../constants/cards';
import { randomStrength } from '../data/cardDeck';
import { buildInterpretation } from '../utils/interpretation';
import { playCardPickSound, playShuffleSound } from '../utils/sound';

const { width: W, height: H } = Dimensions.get('window');
const SPREAD = 9;
const FAN_RADIUS = 180;
const FAN_ARC = 130; // degrees
const FAN_CENTER_Y = H * 0.57;

function shuffledDeck(): CardDefinition[] {
  const deck = [...ALL_CARDS];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck.slice(0, SPREAD);
}

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Draw'>;
  route: RouteProp<RootStackParamList, 'Draw'>;
};

export default function DrawScreen({ navigation, route }: Props) {
  const { question } = route.params;
  const [stage, setStage] = useState<'shuffle' | 'select' | 'done'>('shuffle');
  const [spread, setSpread] = useState<CardDefinition[]>([]);
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [burstPos, setBurstPos] = useState<{ x: number; y: number } | null>(null);

  const selCount = Object.keys(selected).length;
  const fanRotation = useSharedValue(0);
  const fanContextStart = useSharedValue(0);

  // Individual card highlight animations
  const cardScales = useMemo(() => Array.from({ length: SPREAD }, () => useSharedValue(1)), []);
  const cardFlyUps = useMemo(() => Array.from({ length: SPREAD }, () => useSharedValue(0)), []);

  const handleShuffleComplete = useCallback(() => {
    playShuffleSound();
    const cards = shuffledDeck();
    setSpread(cards);
    setSelected({});
    setStage('select');
    fanRotation.value = 0;
    cardScales.forEach((s) => { s.value = 1; });
    cardFlyUps.forEach((f) => { f.value = 0; });
  }, []);

  const goToResult = useCallback(
    (next: Record<number, boolean>) => {
      const pickedCards = Object.keys(next).map((k, i) => {
        const card = spread[Number(k)];
        return { cardId: card.id, position: i + 1, nameZh: card.nameZh, strengthState: randomStrength() };
      });
      const interp = buildInterpretation(pickedCards);
      const reading: ReadingRecord = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2),
        timestamp: Date.now(),
        question,
        cards: pickedCards,
        interpretation: interp.aspects.overall,
        aspectBreakdown: interp.aspects,
        sihuaEffects: interp.sihua,
        sihuaYear: `${interp.sihuaDate.yearGan}${interp.sihuaDate.yearZhi}`,
        sihuaMonth: `${interp.sihuaDate.monthGan}${interp.sihuaDate.monthZhi}`,
      };
      setTimeout(() => navigation.replace('Result', { reading }), 1300);
    },
    [spread, question, navigation],
  );

  const handlePick = useCallback(
    (idx: number) => {
      playCardPickSound();
      if (Platform.OS !== 'web') Vibration.vibrate(12);

      setSelected((prev) => {
        if (prev[idx]) return prev;
        const next = { ...prev, [idx]: true };

        // Animate the picked card
        cardScales[idx].value = withSpring(1.1);
        cardFlyUps[idx].value = withTiming(-30, { duration: 300 });

        if (Object.keys(next).length >= 3) {
          setStage('done');
          runOnJS(goToResult)(next);
        }
        return next;
      });

      // Trigger burst at card position
      const angle = getCardAngle(idx, fanRotation.value);
      const bx = W / 2 + FAN_RADIUS * Math.cos(angle);
      const by = FAN_CENTER_Y + FAN_RADIUS * Math.sin(angle);
      setBurstPos({ x: bx, y: by });
    },
    [cardScales, cardFlyUps, goToResult, fanRotation],
  );

  // Pan gesture for rotating the fan
  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .onStart(() => {
          fanContextStart.value = fanRotation.value;
        })
        .onUpdate((e) => {
          // Convert horizontal movement to fan rotation
          const sensitivity = 0.3;
          fanRotation.value = fanContextStart.value + e.translationX * sensitivity * (Math.PI / 180);
        })
        .onEnd((e) => {
          // Check if it was a vertical swipe (potential card pick)
          const absDx = Math.abs(e.translationX);
          const absDy = Math.abs(e.translationY);

          if (absDy > absDx * 1.5 && e.velocityY < -300) {
            // Vertical swipe up — find nearest card
            const nearestIdx = findNearestCard(e.absoluteX, e.absoluteY, fanRotation.value);
            if (nearestIdx >= 0) {
              runOnJS(handlePick)(nearestIdx);
            }
          }

          // Inertia
          fanRotation.value = withTiming(fanRotation.value + e.velocityX * 0.0003, {
            duration: 400,
            easing: Easing.out(Easing.cubic),
          });
        }),
    [handlePick],
  );

  const picked = spread.filter((_, i) => selected[i]);

  return (
    <View style={S.root}>
      {/* Deep cosmic background */}
      <View style={S.bgGradTop} />
      <View style={S.bgGradBot} />

      {/* Magic circle */}
      <View style={S.magicCircleWrap}>
        <MagicCircle size={320} speed={60} pulse={selCount > 0} />
      </View>

      {/* Particles */}
      <ParticleField count={30} burst={burstPos !== null} burstX={burstPos?.x} burstY={burstPos?.y} />

      <View style={S.safe}>
        {/* Header */}
        <View style={S.head}>
          <ChineseText style={S.brand}>幸运星紫灵牌</ChineseText>
          <View style={S.qPill}>
            <ChineseText style={S.qTxt}>「{question}」</ChineseText>
          </View>
        </View>

        {/* Shuffle stage */}
        {stage === 'shuffle' && (
          <>
            <ShuffleOverlay visible onComplete={handleShuffleComplete} />
            <View style={S.centered}>
              <ChineseText style={S.wait}>✦ 星光汇聚 ✦</ChineseText>
            </View>
          </>
        )}

        {/* Select / Done stages */}
        {(stage === 'select' || stage === 'done') && (
          <View style={S.body}>
            {/* Selected cards preview */}
            <View style={S.previewRow}>
              {[0, 1, 2].map((i) => {
                const c = picked[i];
                return (
                  <View key={i} style={S.prevSlot}>
                    {c ? (
                      <View style={S.prevCardGold}>
                        <View style={S.prevCardInner}>
                          <CardFace card={c} />
                        </View>
                      </View>
                    ) : (
                      <View style={S.prevEmpty}>
                        <ChineseText style={S.prevNum}>{i + 1}</ChineseText>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>

            {/* Counter + progress */}
            <View style={S.counter}>
              <View style={S.progTrack}>
                <View style={[S.progFill, { width: `${(selCount / 3) * 100}%` }]} />
              </View>
              <ChineseText style={S.counterTxt}>凭直觉选择三张牌 · {selCount}/3</ChineseText>
            </View>

            {/* Fan card spread — gesture area */}
            <GestureDetector gesture={panGesture}>
              <View style={S.fanArea}>
                {spread.map((card, idx) => (
                  <FanCard
                    key={idx}
                    card={card}
                    idx={idx}
                    total={SPREAD}
                    isSelected={!!selected[idx]}
                    fanRotation={fanRotation}
                    scale={cardScales[idx]}
                    flyUp={cardFlyUps[idx]}
                    onPick={() => handlePick(idx)}
                  />
                ))}
              </View>
            </GestureDetector>

            {/* Hint */}
            <View style={S.hintWrap}>
              <ChineseText style={S.hintTxt}>滑动旋转 · 点击或上滑选牌</ChineseText>
            </View>
          </View>
        )}

        {stage === 'done' && (
          <View style={S.doneWrap}>
            <ChineseText style={S.doneTxt}>✦ 星光指引 · 解读中 ✦</ChineseText>
          </View>
        )}
      </View>
    </View>
  );
}

// =======================================================
// FanCard — single card in the fan spread
// =======================================================
function getCardAngle(idx: number, rotation: number): number {
  const total = SPREAD;
  const step = (FAN_ARC * Math.PI) / 180 / (total - 1);
  const baseAngle = Math.PI / 2; // bottom of circle
  const offset = (idx - (total - 1) / 2) * step;
  return baseAngle + offset + rotation;
}

function findNearestCard(absX: number, absY: number, rotation: number): number {
  let bestIdx = -1;
  let bestDist = Infinity;
  for (let i = 0; i < SPREAD; i++) {
    const angle = getCardAngle(i, rotation);
    const cx = W / 2 + FAN_RADIUS * Math.cos(angle);
    const cy = FAN_CENTER_Y + FAN_RADIUS * Math.sin(angle);
    const dist = Math.hypot(absX - cx, absY - cy);
    if (dist < bestDist) {
      bestDist = dist;
      bestIdx = i;
    }
  }
  return bestDist < 80 ? bestIdx : -1;
}

function FanCard({
  card, idx, total, isSelected, fanRotation, scale, flyUp, onPick,
}: {
  card: CardDefinition;
  idx: number;
  total: number;
  isSelected: boolean;
  fanRotation: SharedValue<number>;
  scale: SharedValue<number>;
  flyUp: SharedValue<number>;
  onPick: () => void;
}) {
  const step = (FAN_ARC * Math.PI) / 180 / (total - 1);
  const baseAngle = Math.PI / 2;
  const offset = (idx - (total - 1) / 2) * step;

  const animStyle = useAnimatedStyle(() => {
    const angle = baseAngle + offset + fanRotation.value;
    const tx = FAN_RADIUS * Math.cos(angle) - 65;
    const ty = FAN_RADIUS * Math.sin(angle) - 97.5 + flyUp.value;
    const rotDeg = (offset + fanRotation.value) * (180 / Math.PI) * 0.15;

    return {
      transform: [
        { translateX: tx },
        { translateY: ty },
        { rotate: `${rotDeg}deg` },
        { scale: scale.value },
      ],
      opacity: interpolate(flyUp.value, [-40, 0], [0.6, 1]),
    };
  });

  return (
    <Animated.View style={[S.fanCardSlot, animStyle]}>
      <TouchableOpacity
        onPress={onPick}
        disabled={isSelected}
        activeOpacity={0.85}
      >
        {isSelected ? (
          <View style={S.fanCardSelected}>
            <ChineseText style={S.fanCheck}>✦</ChineseText>
          </View>
        ) : (
          <CardBack />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

// =======================================================
// Styles
// =======================================================
const G = 'rgba(201,169,110,';

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#080515' },
  bgGradTop: { position: 'absolute', top: 0, left: 0, right: 0, height: '45%', backgroundColor: '#0A0518' },
  bgGradBot: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%', backgroundColor: '#0D0825' },
  magicCircleWrap: {
    position: 'absolute',
    top: FAN_CENTER_Y - 160,
    left: W / 2 - 160,
    zIndex: 0,
  },
  safe: { flex: 1, paddingTop: 48, paddingBottom: 16, paddingHorizontal: 16 },

  // Header
  head: { alignItems: 'center', marginBottom: 4, zIndex: 2 },
  brand: {
    color: '#E8D5A0', fontSize: 22, fontFamily: 'serif', fontWeight: '700',
    letterSpacing: 8, textShadowColor: 'rgba(201,169,110,0.25)',
    textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 14,
  },
  qPill: {
    marginTop: 8, paddingHorizontal: 18, paddingVertical: 5,
    backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20,
    borderWidth: 1, borderColor: G + '0.3)',
  },
  qTxt: { color: G + '0.9)', fontSize: 13, textAlign: 'center' },

  // Shuffle wait
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  wait: {
    color: G + '0.7)', fontSize: 16, letterSpacing: 4,
    textShadowColor: 'rgba(201,169,110,0.2)',
    textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10,
  },

  body: { flex: 1, justifyContent: 'flex-end' },

  // Preview row
  previewRow: {
    flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 8, zIndex: 2,
  },
  prevSlot: { width: 90, height: 115, alignItems: 'center', justifyContent: 'center' },
  prevCardGold: {
    borderRadius: 12, borderWidth: 1.5, borderColor: G + '0.5)',
    padding: 3, backgroundColor: G + '0.08)',
    shadowColor: '#C9A96E', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  prevCardInner: { transform: [{ scale: 0.52 }], marginTop: -8 },
  prevEmpty: {
    width: 64, height: 90, borderRadius: 12, borderWidth: 1,
    borderColor: G + '0.2)', borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  prevNum: { color: G + '0.35)', fontSize: 24, fontWeight: '300' },

  // Counter
  counter: { alignItems: 'center', marginBottom: 6, zIndex: 2 },
  progTrack: {
    width: '50%', height: 3, backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 2, marginBottom: 6,
  },
  progFill: {
    height: 3, backgroundColor: G + '0.7)', borderRadius: 2,
    shadowColor: '#C9A96E', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4, shadowRadius: 6,
  },
  counterTxt: {
    color: G + '0.7)', fontSize: 13, letterSpacing: 2,
    backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 12, paddingVertical: 3, borderRadius: 10,
  },

  // Fan area
  fanArea: {
    flex: 1, position: 'relative', alignItems: 'center', justifyContent: 'center',
    zIndex: 1,
  },
  fanCardSlot: {
    position: 'absolute',
  },
  fanCardSelected: {
    width: 130, height: 195, borderRadius: 14,
    backgroundColor: 'rgba(8,4,20,0.5)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: G + '0.6)',
    shadowColor: '#C9A96E', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5, shadowRadius: 16, elevation: 8,
  },
  fanCheck: { color: G + '0.9)', fontSize: 30 },

  // Hint
  hintWrap: { alignItems: 'center', paddingBottom: 8, zIndex: 2 },
  hintTxt: { color: G + '0.35)', fontSize: 12, letterSpacing: 3 },

  // Done
  doneWrap: { alignItems: 'center', paddingTop: 2, zIndex: 2 },
  doneTxt: {
    color: '#E8D5A0', fontSize: 15, letterSpacing: 4,
    textShadowColor: 'rgba(201,169,110,0.4)',
    textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10,
  },
});
