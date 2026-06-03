import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  SharedValue,
} from 'react-native-reanimated';
import CardBack from './CardBack';
import ChineseText from '../ui/ChineseText';
import MagicCircle from '../effects/MagicCircle';
import { playCardPickSound } from '../../utils/sound';

const { height: H } = Dimensions.get('window');

interface Props {
  visible: boolean;
  onComplete: () => void;
}

const CARD_COUNT = 7;
const RADIUS = 120;

// Separate component to obey Rules of Hooks
function ShuffleCard({
  angle, radius, rotate, scale, index,
}: {
  angle: SharedValue<number>;
  radius: SharedValue<number>;
  rotate: SharedValue<number>;
  scale: SharedValue<number>;
  index: number;
}) {
  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: Math.cos(angle.value) * radius.value },
      { translateY: Math.sin(angle.value) * radius.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
    zIndex: index,
  }));

  return (
    <Animated.View style={[styles.cardStack, animStyle]}>
      <CardBack />
    </Animated.View>
  );
}

export default function ShuffleOverlay({ visible, onComplete }: Props) {
  const [stage, setStage] = useState<'shuffling' | 'text' | 'done'>('shuffling');

  const cardAngles = useMemo(
    () =>
      Array.from({ length: CARD_COUNT }, (_, i) => ({
        angle: useSharedValue((i * 2 * Math.PI) / CARD_COUNT),
        radius: useSharedValue(RADIUS),
        rotate: useSharedValue(0),
        scale: useSharedValue(1),
      })),
    [],
  );

  const flyInDelay = useMemo(
    () => Array.from({ length: CARD_COUNT }, (_, i) => i * 100),
    [],
  );

  useEffect(() => {
    if (!visible) return;
    setStage('shuffling');

    // Stage 1: Cards fly in from edges to form a circle
    cardAngles.forEach((pos, i) => {
      pos.angle.value = (i * 2 * Math.PI) / CARD_COUNT + Math.random() * 1.5;
      pos.radius.value = RADIUS * 2;
      pos.rotate.value = Math.random() * 60 - 30;

      pos.radius.value = withDelay(
        flyInDelay[i],
        withTiming(RADIUS, { duration: 600, easing: Easing.out(Easing.back(1.5)) }),
      );
      pos.rotate.value = withDelay(flyInDelay[i], withTiming(0, { duration: 600 }));
    });

    // Stage 2: Spin the ring
    const spinStart = flyInDelay[CARD_COUNT - 1] + 700;
    cardAngles.forEach((pos) => {
      const targetAngle = pos.angle.value + Math.PI * 2 * 3;
      setTimeout(() => {
        pos.angle.value = withTiming(targetAngle, { duration: 2000, easing: Easing.out(Easing.cubic) });
        pos.radius.value = withSequence(
          withTiming(RADIUS * 0.85, { duration: 400 }),
          withTiming(RADIUS * 1.05, { duration: 400 }),
          withTiming(RADIUS, { duration: 400 }),
        );
      }, spinStart);
    });

    // Stage 3: Cards scatter outward
    const scatterStart = spinStart + 2400;
    cardAngles.forEach((pos) => {
      const exitAngle = pos.angle.value + (Math.random() - 0.5) * 2;
      setTimeout(() => {
        pos.angle.value = exitAngle;
        pos.radius.value = withTiming(RADIUS * 3, { duration: 500, easing: Easing.in(Easing.ease) });
        pos.rotate.value = withTiming((Math.random() - 0.5) * 120, { duration: 500 });
        pos.scale.value = withTiming(0.3, { duration: 400 });
      }, scatterStart);
    });

    // Show text
    const textTime = spinStart + 1200;
    const textTimer = setTimeout(() => {
      setStage('text');
      playCardPickSound();
    }, textTime);

    // Complete
    const doneTime = scatterStart + 600;
    const doneTimer = setTimeout(() => {
      setStage('done');
      playCardPickSound();
      onComplete();
    }, doneTime);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(doneTimer);
    };
  }, [visible]);

  if (!visible || stage === 'done') return null;

  return (
    <View style={styles.overlay}>
      <MagicCircle size={300} speed={30} />

      <View style={styles.cardArea}>
        {cardAngles.map((pos, i) => (
          <ShuffleCard
            key={i}
            angle={pos.angle}
            radius={pos.radius}
            rotate={pos.rotate}
            scale={pos.scale}
            index={i}
          />
        ))}
      </View>

      {stage === 'text' && (
        <View style={styles.textWrap}>
          <ChineseText style={styles.shuffleText}>✦ 星光汇聚 ✦</ChineseText>
          <ChineseText style={styles.shuffleSub}>正在洗牌...</ChineseText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(8,4,20,0.94)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  cardArea: {
    width: 0,
    height: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardStack: {
    position: 'absolute',
    marginLeft: -65,
    marginTop: -97.5,
  },
  textWrap: {
    position: 'absolute',
    bottom: H * 0.15,
    alignItems: 'center',
  },
  shuffleText: {
    color: '#E8D5A0',
    fontSize: 20,
    letterSpacing: 6,
    marginBottom: 8,
  },
  shuffleSub: {
    color: '#C9A96E',
    fontSize: 14,
    letterSpacing: 4,
  },
});
