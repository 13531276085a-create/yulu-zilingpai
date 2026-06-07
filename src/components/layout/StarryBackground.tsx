import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Generate pseudo-random star positions
const STARS = Array.from({ length: 80 }, (_, i) => ({
  x: (i * 137 + 50) % width,
  y: (i * 97 + 30) % (height * 0.7),
  size: 1 + (i % 3),
  opacity: 0.3 + (i % 5) * 0.14,
  delay: i * 173,
  duration: 2000 + (i % 3) * 1500,
}));

function TwinklingStar({ x, y, size, opacity, delay, duration }: typeof STARS[0]) {
  const anim = useRef(new Animated.Value(opacity)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: opacity * 2.5, duration, useNativeDriver: true }),
        Animated.timing(anim, { toValue: opacity, duration, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={[styles.star, {
        left: x, top: y, width: size, height: size, borderRadius: size / 2,
        opacity: anim, backgroundColor: size > 2 ? '#E8D5F5' : '#D4C8F0',
      }]}
    />
  );
}

const NEBULA = [
  { x: width * 0.2, y: 60, w: 180, h: 120, color: 'rgba(100,60,180,0.06)', delay: 0 },
  { x: width * 0.55, y: 200, w: 200, h: 140, color: 'rgba(60,40,140,0.05)', delay: 2000 },
  { x: width * 0.15, y: 350, w: 160, h: 100, color: 'rgba(80,50,160,0.04)', delay: 4000 },
];

function NebulaPatch({ x, y, w, h, color, delay }: typeof NEBULA[0]) {
  const anim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 4000, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.6, duration: 4000, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={[styles.nebula, {
        left: x, top: y, width: w, height: h, borderRadius: w / 2,
        backgroundColor: color, opacity: anim,
      }]}
    />
  );
}

export default function StarryBackground() {
  return (
    <View style={styles.container}>
      {/* Deep space gradient */}
      <View style={styles.grad1} />
      <View style={styles.grad2} />
      {/* Nebula patches */}
      {NEBULA.map((n, i) => <NebulaPatch key={i} {...n} />)}
      {/* Stars */}
      {STARS.map((s, i) => <TwinklingStar key={i} {...s} />)}
      {/* Subtle floating particles */}
      <AnimatedParticle top={height * 0.15} left={width * 0.1} delay={0} size={3} />
      <AnimatedParticle top={height * 0.25} left={width * 0.75} delay={3000} size={2} />
      <AnimatedParticle top={height * 0.55} left={width * 0.85} delay={6000} size={3} />
      <AnimatedParticle top={height * 0.4} left={width * 0.2} delay={4000} size={2} />
    </View>
  );
}

function AnimatedParticle({ top, left, delay, size }: { top: number; left: number; delay: number; size: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 7000, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);
  const translateY = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -40, 0] });
  const opacity = anim.interpolate({ inputRange: [0, 0.3, 0.7, 1], outputRange: [0, 0.6, 0.3, 0] });

  return (
    <Animated.View style={{
      position: 'absolute',
      width: size, height: size, borderRadius: size / 2,
      top, left,
      transform: [{ translateY }], opacity,
    }} />
  );
}

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFill, overflow: 'hidden' },
  grad1: { position: 'absolute', top: 0, left: 0, right: 0, height: '50%', backgroundColor: '#0D0820' },
  grad2: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%', backgroundColor: '#150D30' },
  star: { position: 'absolute' },
  nebula: { position: 'absolute' },
  particle: { position: 'absolute', backgroundColor: 'rgba(200,180,240,0.5)' },
});
