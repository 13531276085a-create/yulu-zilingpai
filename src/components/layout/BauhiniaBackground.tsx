import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

function FloatingPetal({ size, color, opacity, x, y, rotation, delay }: {
  size: number; color: string; opacity: number; x: number; y: number; rotation: number; delay: number;
}) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 4000 + Math.random() * 3000, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const translateY = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -12, 0] });
  const rotateAnim = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['0deg', `${rotation}deg`, '0deg'] });

  return (
    <Animated.View style={[styles.petal, { width: size, height: size * 1.2, opacity, left: x, top: y, transform: [{ translateY }, { rotate: rotateAnim }] }]}>
      <View style={[styles.petalShape, { borderColor: color }]} />
    </Animated.View>
  );
}

const PETALS = [
  { size: 28, color: '#C9A0DC', opacity: 0.3, x: 30, y: 80, rotation: 15, delay: 0 },
  { size: 24, color: '#D4B8E8', opacity: 0.25, x: width - 60, y: 120, rotation: -10, delay: 800 },
  { size: 30, color: '#C9A0DC', opacity: 0.25, x: 50, y: 250, rotation: 20, delay: 1600 },
  { size: 26, color: '#BE8FD8', opacity: 0.2, x: width - 50, y: 300, rotation: -15, delay: 2400 },
  { size: 22, color: '#D4B8E8', opacity: 0.25, x: 80, y: 420, rotation: 8, delay: 1000 },
  { size: 28, color: '#C9A0DC', opacity: 0.2, x: width - 80, y: 450, rotation: -20, delay: 2000 },
  { size: 20, color: '#D4B8E8', opacity: 0.22, x: 120, y: 560, rotation: 12, delay: 3200 },
  { size: 24, color: '#BE8FD8', opacity: 0.18, x: width - 100, y: 580, rotation: -8, delay: 500 },
];

function FlowerEmblem({ top, left, right, bottom, size, delay }: {
  top?: number; left?: number; right?: number; bottom?: number; size: number; delay: number;
}) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 6000, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const scale = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.06, 1] });
  const rotate = anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Animated.Text style={[styles.flower, { fontSize: size, top, left, right, bottom, transform: [{ scale }, { rotate }] }]}>
      🌸
    </Animated.Text>
  );
}

export default function BauhiniaBackground() {
  return (
    <View style={styles.container}>
      <View style={styles.gradientTop} />
      <View style={styles.gradientMid} />
      <View style={styles.gradientBottom} />
      {PETALS.map((cfg, i) => <FloatingPetal key={i} {...cfg} />)}
      <FlowerEmblem top={60} left={20} size={36} delay={0} />
      <FlowerEmblem top={100} right={20} size={28} delay={1500} />
      <FlowerEmblem bottom={200} left={30} size={32} delay={3000} />
      <FlowerEmblem bottom={100} right={25} size={38} delay={2000} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFill, overflow: 'hidden' },
  gradientTop: { position: 'absolute', top: 0, left: 0, right: 0, height: '35%', backgroundColor: '#3D2A6E' },
  gradientMid: { position: 'absolute', top: '25%', left: 0, right: 0, height: '50%', backgroundColor: '#5E3A9E' },
  gradientBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', backgroundColor: '#3D2A6E' },
  petal: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  petalShape: { width: '70%', height: '60%', borderRadius: 50, borderWidth: 1.5 },
  flower: { position: 'absolute', opacity: 0.25 },
});
