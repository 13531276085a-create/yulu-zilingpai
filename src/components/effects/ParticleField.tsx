import React, { useEffect, useRef, useMemo } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  Easing,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
  drift: number;
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * width * 1.2 - width * 0.1,
    y: Math.random() * height * 0.6 - 20,
    size: 1.5 + Math.random() * 3,
    delay: Math.random() * 8000,
    duration: 4000 + Math.random() * 6000,
    opacity: 0.2 + Math.random() * 0.5,
    drift: -10 + Math.random() * 20,
  }));
}

interface Props {
  count?: number;
  burst?: boolean; // triggers burst of particles
  burstX?: number;
  burstY?: number;
}

function Particle({ p, burst, burstX, burstY }: { p: Particle; burst?: boolean; burstX?: number; burstY?: number }) {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(p.opacity);
  const burstOpacity = useSharedValue(0);
  const bx = useSharedValue(0);
  const by = useSharedValue(0);

  useEffect(() => {
    // Ambient float
    const delay = p.delay;
    setTimeout(() => {
      translateY.value = withRepeat(
        withTiming(height * 0.7, { duration: p.duration, easing: Easing.linear }),
        -1,
        false,
      );
      translateX.value = withRepeat(
        withTiming(p.drift, { duration: p.duration * 0.3 }),
        -1,
        true,
      );
      opacity.value = withRepeat(
        withTiming(p.opacity * 0.3, { duration: p.duration * 0.4 }),
        -1,
        true,
      );
    }, delay);
  }, []);

  useEffect(() => {
    if (burst && burstX !== undefined && burstY !== undefined) {
      // Calculate burst trajectory
      const angle = Math.random() * Math.PI * 2;
      const dist = 40 + Math.random() * 80;
      bx.value = withTiming(Math.cos(angle) * dist, { duration: 800, easing: Easing.out(Easing.cubic) });
      by.value = withTiming(Math.sin(angle) * dist, { duration: 800, easing: Easing.out(Easing.cubic) });
      burstOpacity.value = withTiming(0.8, { duration: 150 });
      setTimeout(() => {
        burstOpacity.value = withTiming(0, { duration: 600 });
      }, 200);
    }
  }, [burst]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value + (burst ? bx.value : 0) },
      { translateY: translateY.value + (burst ? by.value : 0) },
    ],
    opacity: burst ? burstOpacity.value : opacity.value,
  }));

  const isBurstParticle = burst && burstX !== undefined;

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: isBurstParticle ? burstX! : p.x,
          top: isBurstParticle ? burstY! : p.y,
          width: p.size,
          height: p.size,
          borderRadius: p.size / 2,
          backgroundColor: isBurstParticle
            ? '#E8D5A0'
            : p.size > 2.5 ? '#E8D5A0' : '#C9A96E',
        },
        style,
      ]}
    />
  );
}

// Generate burst particles on demand
function BurstParticles({ x, y, count = 15 }: { x: number; y: number; count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <Particle
          key={`burst-${i}`}
          p={{ id: i, x, y, size: 2 + Math.random() * 3, delay: 0, duration: 0, opacity: 0, drift: 0 }}
          burst
          burstX={x}
          burstY={y}
        />
      ))}
    </>
  );
}

export default function ParticleField({ count = 30, burst, burstX, burstY }: Props) {
  const particles = useMemo(() => generateParticles(count), [count]);

  return (
    <>
      {particles.map((p) => (
        <Particle key={p.id} p={p} />
      ))}
      {burst && burstX !== undefined && burstY !== undefined && (
        <BurstParticles x={burstX} y={burstY} count={12} />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
  },
});
