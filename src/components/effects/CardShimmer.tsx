import React, { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface Props {
  width?: number;
  height?: number;
  interval?: number; // ms between sweeps
}

export default function CardShimmer({ width = 154, height = 234, interval = 3000 }: Props) {
  const sweepX = useSharedValue(-width);
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    // Diagonal light sweep from top-left to bottom-right
    sweepX.value = withRepeat(
      withTiming(width * 2, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      false,
    );
    opacity.value = withRepeat(
      withTiming(0.6, { duration: 400, easing: Easing.ease }),
      -1,
      true,
    );

    const intervalId = setInterval(() => {
      sweepX.value = -width;
      sweepX.value = withTiming(width * 2, { duration: 800, easing: Easing.inOut(Easing.ease) });
    }, interval);

    return () => clearInterval(intervalId);
  }, [interval]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: sweepX.value }, { translateY: sweepX.value * 0.5 }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.shimmer,
        { width: width * 0.3, height: height * 0.3 },
        shimmerStyle,
      ]}
      pointerEvents="none"
    />
  );
}

const styles = StyleSheet.create({
  shimmer: {
    position: 'absolute',
    top: -50,
    left: -50,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.15)',
    transform: [{ rotate: '35deg' }],
  },
});
