import React, { useState, useCallback, useMemo } from 'react';
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
import AstrolabeWheel from '../components/effects/AstrolabeWheel';
import ParticleField from '../components/effects/ParticleField';
import CardBack from '../components/cards/CardBack';
import CardFace from '../components/cards/CardFace';
import ShuffleOverlay from '../components/cards/ShuffleOverlay';
import ChineseText from '../components/ui/ChineseText';
import { ALL_CARDS } from '../constants/cards';
import { randomStrength } from '../data/cardDeck';
import { buildInterpretation } from '../utils/interpretation';
import { playCardPickSound } from '../utils/sound';

const { width: W, height: H } = Dimensions.get('window');
const SPREAD = 9;
const WHEEL_RADIUS = 148; // radius of the ring where cards sit
const WHEEL_CX = W / 2;
const WHEEL_CY = H * 0.44;
const WHEEL_SIZE = 320;

// Colors
const MIDNIGHT = '#0b0820';
const VIOLET = 'rgba(180,150,220,';
const LAVENDER = 'rgba(210,190,240,';
const WHITE = 'rgba(245,240,255,';
const WHITE_SOLID = '#f5f0ff';

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

const SLOT_LABELS = ['过去', '当下', '未来'];

export default function DrawScreen({ navigation, route }: Props) {
  const { question } = route.params;
  const [stage, setStage] = useState<'shuffle' | 'select' | 'done'>('shuffle');
  const [spread, setSpread] = useState<CardDefinition[]>([]);
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [burstPos, setBurstPos] = useState<{ x: number; y: number } | null>(null);
  const [highlightIndex, setHighlightIndex] = useState(0);

  const selCount = Object.keys(selected).length;
  const wheelRotation = useSharedValue(0);
  const wheelContextStart = useSharedValue(0);

  const cardScales = useMemo(() => Array.from({ length: SPREAD }, () => useSharedValue(1)), []);
  const cardGlows = useMemo(() => Array.from({ length: SPREAD }, () => useSharedValue(0)), []);
  const cardRadialOffsets = useMemo(() => Array.from({ length: SPREAD }, () => useSharedValue(0)), []);

  const handleShuffleComplete = useCallback(() => {
    const cards = shuffledDeck();
    setSpread(cards);
    setSelected({});
    setHighlightIndex(0);
    setStage('select');
    wheelRotation.value = 0;
    cardScales.forEach((s) => { s.value = 1; });
    cardGlows.forEach((g) => { g.value = 0; });
    cardRadialOffsets.forEach((f) => { f.value = 0; });
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
      setTimeout(() => navigation.replace('Result', { reading }), 1600);
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

        cardScales[idx].value = withSpring(1.2);
        cardGlows[idx].value = withTiming(1, { duration: 400 });
        cardRadialOffsets[idx].value = withTiming(-20, { duration: 350, easing: Easing.out(Easing.back(1.5)) });

        if (Object.keys(next).length >= 3) {
          setStage('done');
          runOnJS(goToResult)(next);
        }
        return next;
      });

      // Burst particles at card position
      const angle = getCardAngle(idx, wheelRotation.value);
      const bx = WHEEL_CX + WHEEL_RADIUS * Math.cos(angle);
      const by = WHEEL_CY + WHEEL_RADIUS * Math.sin(angle);
      setBurstPos({ x: bx, y: by });
    },
    [cardScales, cardGlows, cardRadialOffsets, goToResult, wheelRotation],
  );

  // Determine which card is under the pointer
  const updateHighlight = useCallback(
    (rotation: number) => {
      // Pointer is at 12 o'clock = -PI/2
      const pointerAngle = -Math.PI / 2;
      const step = (2 * Math.PI) / SPREAD;
      let best = 0;
      let bestDist = Infinity;
      for (let i = 0; i < SPREAD; i++) {
        const cardAngle = (pointerAngle - rotation + Math.PI * 2) % (Math.PI * 2);
        const targetAngle = (i * step + Math.PI * 2) % (Math.PI * 2);
        let diff = Math.abs(cardAngle - targetAngle);
        if (diff > Math.PI) diff = 2 * Math.PI - diff;
        if (diff < bestDist) { bestDist = diff; best = i; }
      }
      setHighlightIndex(best);
    },
    [],
  );

  // Pan gesture for rotating the wheel
  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .onStart(() => {
          wheelContextStart.value = wheelRotation.value;
        })
        .onUpdate((e) => {
          const sensitivity = 0.4;
          wheelRotation.value = wheelContextStart.value + e.translationX * sensitivity * (Math.PI / 180);
          runOnJS(updateHighlight)(wheelRotation.value);
        })
        .onEnd((e) => {
          const absDx = Math.abs(e.translationX);
          const absDy = Math.abs(e.translationY);

          // Vertical swipe up on highlighted card = pick
          if (absDy > absDx * 1.3 && e.velocityY < -350) {
            runOnJS(handlePick)(highlightIndex);
          }

          // Snap to nearest card
          const step = (2 * Math.PI) / SPREAD;
          const currentAngle = wheelRotation.value % (2 * Math.PI);
          const snapped = Math.round(currentAngle / step) * step;
          wheelRotation.value = withTiming(snapped, {
            duration: 500, easing: Easing.out(Easing.back(0.8)),
          });
          runOnJS(updateHighlight)(snapped);
        }),
    [handlePick, highlightIndex],
  );

  const picked = spread.filter((_, i) => selected[i]);

  return (
    <View style={S.root}>
      {/* Deep midnight purple background */}
      <View style={S.bgSpace} />
      <View style={S.bgNebula1} />
      <View style={S.bgNebula2} />

      {/* Stardust particles */}
      <ParticleField count={40} burst={burstPos !== null} burstX={burstPos?.x} burstY={burstPos?.y} />

      <View style={S.safe}>
        {/* Header */}
        <View style={S.head}>
          <ChineseText style={S.brand}>雨露紫灵牌</ChineseText>
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

        {/* Select / Done stage */}
        {(stage === 'select' || stage === 'done') && (
          <View style={S.body}>
            {/* Central astrolabe with radial cards */}
            <GestureDetector gesture={panGesture}>
              <View style={S.wheelArea}>
                {/* Astrolabe */}
                <View style={S.astrolabeWrap}>
                  <AstrolabeWheel
                    size={WHEEL_SIZE}
                    speed={75}
                    highlightIndex={highlightIndex}
                    totalSlots={SPREAD}
                  />
                </View>

                {/* Pointer beam at 12 o'clock */}
                <View style={S.pointerWrap}>
                  <View style={S.pointerBeam} />
                  <View style={S.pointerDot} />
                </View>

                {/* Radial cards around the wheel */}
                {spread.map((card, idx) => (
                  <RadialCard
                    key={idx}
                    card={card}
                    idx={idx}
                    total={SPREAD}
                    isSelected={!!selected[idx]}
                    isHighlighted={idx === highlightIndex && selCount < 3}
                    wheelRotation={wheelRotation}
                    scale={cardScales[idx]}
                    glow={cardGlows[idx]}
                    radialOffset={cardRadialOffsets[idx]}
                    onPick={() => handlePick(idx)}
                  />
                ))}
              </View>
            </GestureDetector>

            {/* Glassmorphic card slots */}
            <View style={S.slotsRow}>
              {[0, 1, 2].map((i) => {
                const c = picked[i];
                return (
                  <View key={i} style={S.slotWrap}>
                    <ChineseText style={S.slotLabel}>{SLOT_LABELS[i]}</ChineseText>
                    <View style={S.slotCard}>
                      {c ? (
                        <View style={S.slotFilled}>
                          <View style={{ transform: [{ scale: 0.42 }], marginTop: -10 }}>
                            <CardFace card={c} />
                          </View>
                        </View>
                      ) : (
                        <View style={S.slotEmpty}>
                          <ChineseText style={S.slotNum}>{i + 1}</ChineseText>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Hint */}
            <View style={S.hintWrap}>
              <ChineseText style={S.hintTxt}>旋转星盘选择 · 上滑确认灵牌</ChineseText>
              <ChineseText style={S.hintCount}>已选 {selCount} / 3</ChineseText>
            </View>
          </View>
        )}

        {/* Done transition */}
        {stage === 'done' && (
          <View style={S.doneOverlay}>
            <ChineseText style={S.doneStar}>✦</ChineseText>
            <ChineseText style={S.doneTxt}>星光指引 · 解读中</ChineseText>
          </View>
        )}
      </View>
    </View>
  );
}

// =======================================================
// RadialCard — a card on the outer edge of the wheel
// =======================================================
function getCardAngle(idx: number, rotation: number): number {
  const step = (2 * Math.PI) / SPREAD;
  return idx * step + rotation;
}

function RadialCard({
  card, idx, total, isSelected, isHighlighted,
  wheelRotation, scale, glow, radialOffset, onPick,
}: {
  card: CardDefinition;
  idx: number;
  total: number;
  isSelected: boolean;
  isHighlighted: boolean;
  wheelRotation: SharedValue<number>;
  scale: SharedValue<number>;
  glow: SharedValue<number>;
  radialOffset: SharedValue<number>;
  onPick: () => void;
}) {
  const step = (2 * Math.PI) / total;

  const animStyle = useAnimatedStyle(() => {
    const angle = step * idx + wheelRotation.value;
    // Position cards so their tops point toward center
    // Card center sits on the wheel ring
    const cardAngle = angle - Math.PI / 2; // tops toward center
    const cx = WHEEL_CX + WHEEL_RADIUS * Math.cos(angle);
    const cy = WHEEL_CY + WHEEL_RADIUS * Math.sin(angle);
    const offsetR = radialOffset.value;
    const ox = cx + offsetR * Math.cos(angle);
    const oy = cy + offsetR * Math.sin(angle);

    return {
      transform: [
        { translateX: ox - 65 },
        { translateY: oy - 97.5 },
        { rotate: `${(cardAngle * 180) / Math.PI}deg` },
        { scale: scale.value },
      ],
    };
  });

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
  }));

  return (
    <Animated.View style={[S.radialCard, animStyle]}>
      {/* Highlight glow when card is under pointer */}
      {isHighlighted && (
        <View style={S.highlightGlow} />
      )}

      {/* Selection glow */}
      <Animated.View style={[S.selectedGlow, glowStyle]} />

      <TouchableOpacity onPress={onPick} disabled={isSelected} activeOpacity={0.8}>
        {isSelected ? (
          <View style={S.cardSelected}>
            <ChineseText style={S.cardSelectedIcon}>✦</ChineseText>
          </View>
        ) : (
          <View style={S.cardWrap}>
            <CardBack small />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

// =======================================================
// Styles
// =======================================================
const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: MIDNIGHT },
  bgSpace: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: MIDNIGHT },
  bgNebula1: {
    position: 'absolute', top: '-8%', left: '10%',
    width: 260, height: 260, borderRadius: 130,
    backgroundColor: 'rgba(100,60,180,0.12)', opacity: 0.6,
  },
  bgNebula2: {
    position: 'absolute', bottom: '20%', right: '-5%',
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(60,30,120,0.1)', opacity: 0.5,
  },
  safe: { flex: 1, paddingTop: 46, paddingBottom: 12, paddingHorizontal: 16 },

  // Header
  head: { alignItems: 'center', marginBottom: 2, zIndex: 2 },
  brand: {
    color: WHITE_SOLID, fontSize: 20, fontFamily: 'serif', fontWeight: '700',
    letterSpacing: 8, textShadowColor: 'rgba(200,170,240,0.4)',
    textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 14,
  },
  qPill: {
    marginTop: 8, paddingHorizontal: 18, paddingVertical: 5,
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 20,
    borderWidth: 1, borderColor: WHITE + '0.2)',
  },
  qTxt: { color: WHITE + '0.8)', fontSize: 13, textAlign: 'center' },

  // Shuffle
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  wait: { color: WHITE + '0.6)', fontSize: 16, letterSpacing: 4 },

  body: { flex: 1, justifyContent: 'flex-end' },

  // Wheel area
  wheelArea: {
    flex: 1, position: 'relative',
    alignItems: 'center', justifyContent: 'center',
  },
  astrolabeWrap: {
    position: 'absolute',
    top: WHEEL_CY - WHEEL_SIZE / 2,
    left: WHEEL_CX - WHEEL_SIZE / 2,
    width: WHEEL_SIZE, height: WHEEL_SIZE,
  },

  // Pointer beam at top of wheel
  pointerWrap: {
    position: 'absolute',
    top: WHEEL_CY - WHEEL_SIZE / 2 - 18,
    left: WHEEL_CX - 3,
    alignItems: 'center',
    zIndex: 30,
  },
  pointerBeam: {
    width: 6, height: 28,
    backgroundColor: WHITE + '0.35)',
    borderRadius: 3,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  pointerDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: WHITE + '0.8)',
    marginTop: -4,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 10,
  },

  // Radial card
  radialCard: { position: 'absolute' },
  highlightGlow: {
    position: 'absolute', top: -10, left: -10,
    width: 150, height: 215,
    borderRadius: 18,
    backgroundColor: 'rgba(200,180,240,0.06)',
    borderWidth: 1.5, borderColor: WHITE + '0.3)',
    shadowColor: '#d4c4f0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 6,
  },
  selectedGlow: {
    position: 'absolute', top: -6, left: -6,
    width: 142, height: 207,
    borderRadius: 16,
    backgroundColor: 'rgba(200,170,240,0.08)',
    borderWidth: 2, borderColor: WHITE + '0.6)',
    shadowColor: '#d4c4f0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4, shadowRadius: 20, elevation: 8,
  },
  cardWrap: {
    borderRadius: 4,
    shadowColor: 'rgba(200,170,240,0.3)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15, shadowRadius: 8, elevation: 3,
  },
  cardSelected: {
    width: 130, height: 195, borderRadius: 14,
    backgroundColor: 'rgba(15,10,30,0.5)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: WHITE + '0.5)',
    shadowColor: '#d4c4f0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4, shadowRadius: 18, elevation: 8,
  },
  cardSelectedIcon: { color: WHITE_SOLID, fontSize: 32 },

  // Glassmorphic slots
  slotsRow: {
    flexDirection: 'row', justifyContent: 'center', gap: 12,
    marginBottom: 6, zIndex: 2,
  },
  slotWrap: { alignItems: 'center', gap: 6 },
  slotLabel: {
    color: WHITE + '0.5)', fontSize: 10, letterSpacing: 4,
    fontFamily: 'serif', fontWeight: '300',
  },
  slotCard: { width: 90, height: 120, alignItems: 'center', justifyContent: 'center' },
  slotFilled: {
    width: 90, height: 120, borderRadius: 14,
    borderWidth: 1, borderColor: WHITE + '0.3)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: 'rgba(200,170,240,0.2)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 4,
  },
  slotEmpty: {
    width: 90, height: 120, borderRadius: 14,
    borderWidth: 1, borderColor: WHITE + '0.12)',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(255,255,255,0.02)',
    alignItems: 'center', justifyContent: 'center',
  },
  slotNum: { color: WHITE + '0.25)', fontSize: 22, fontWeight: '200' },

  // Hint
  hintWrap: { alignItems: 'center', paddingBottom: 6, zIndex: 2 },
  hintTxt: { color: WHITE + '0.35)', fontSize: 12, letterSpacing: 3 },
  hintCount: { color: WHITE + '0.5)', fontSize: 11, letterSpacing: 2, marginTop: 4 },

  // Done
  doneOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0, top: 0,
    backgroundColor: 'rgba(8,3,25,0.88)',
    justifyContent: 'center', alignItems: 'center', zIndex: 50,
  },
  doneStar: { color: WHITE_SOLID, fontSize: 36, marginBottom: 12 },
  doneTxt: { color: WHITE + '0.8)', fontSize: 16, letterSpacing: 6 },
});
