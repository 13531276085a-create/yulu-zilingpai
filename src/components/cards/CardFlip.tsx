import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import CardBack from './CardBack';
import CardFace from './CardFace';
import { CardDefinition } from '../../types';

interface Props {
  card: CardDefinition;
  flipped: boolean;
  onFlip?: () => void;
  disabled?: boolean;
  width?: number;
  height?: number;
}

export default function CardFlip({ card, flipped, onFlip, disabled, width = 140, height = 210 }: Props) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withTiming(flipped ? 180 : 0, { duration: 500 });
  }, [flipped]);

  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${rotation.value}deg` }],
    opacity: interpolate(rotation.value, [0, 90], [1, 0]),
    zIndex: rotation.value > 90 ? -1 : 1,
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${rotation.value - 180}deg` }],
    opacity: interpolate(rotation.value, [90, 180], [0, 1]),
    zIndex: rotation.value > 90 ? 1 : -1,
  }));

  return (
    <TouchableWithoutFeedback onPress={onFlip} disabled={disabled || flipped}>
      <View style={[styles.container, { width, height }]}>
        <Animated.View style={[styles.face, { width, height }, frontStyle]}>
          <CardBack />
        </Animated.View>
        <Animated.View style={[styles.face, { width, height }, backStyle]}>
          <CardFace card={card} />
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  face: {
    position: 'absolute',
    backfaceVisibility: 'hidden',
  },
});
