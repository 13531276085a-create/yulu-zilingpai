import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Circle, Line, Polygon, Text as SvgText } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedSvg = Animated.createAnimatedComponent(Svg);

interface Props {
  size?: number;
  speed?: number;
  pulse?: boolean; // triggers a pulse burst
}

export default function MagicCircle({ size = 320, speed = 60, pulse }: Props) {
  const rotation = useSharedValue(0);
  const innerRotation = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: speed * 1000 }), -1, false);
    innerRotation.value = withRepeat(withTiming(-360, { duration: speed * 1000 * 0.6 }), -1, false);
  }, [speed]);

  useEffect(() => {
    if (pulse) {
      pulseScale.value = 1;
      pulseScale.value = withTiming(1.15, { duration: 300 });
      setTimeout(() => { pulseScale.value = withTiming(1, { duration: 600 }); }, 300);
    }
  }, [pulse]);

  const cx = size / 2;
  const cy = size / 2;
  const GOLD = '#C9A96E';
  const GOLD_FAINT = 'rgba(201,169,110,0.3)';
  const GOLD_BRIGHT = '#E8D5A0';

  const svgProps = useAnimatedProps(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const innerSvgProps = useAnimatedProps(() => ({
    transform: [{ rotate: `${innerRotation.value}deg` }],
  }));

  const pulseProps = useAnimatedProps(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  // Generate tick marks on the outer ring
  const ticks = Array.from({ length: 36 }, (_, i) => {
    const angle = (i * 10 * Math.PI) / 180;
    const inner = size * 0.33;
    const outer = size * 0.36;
    const x1 = cx + inner * Math.cos(angle);
    const y1 = cy + inner * Math.sin(angle);
    const x2 = cx + outer * Math.cos(angle);
    const y2 = cy + outer * Math.sin(angle);
    return <Line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={i % 3 === 0 ? GOLD : GOLD_FAINT} strokeWidth={i % 3 === 0 ? 1.2 : 0.5} />;
  });

  // Heptagram / 7-pointed star (as used in Clow cards)
  const heptagramPoints = Array.from({ length: 7 }, (_, i) => {
    const a = (i * 2 * Math.PI) / 7 - Math.PI / 2;
    const r = size * 0.25;
    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
  }).join(' ');

  // Secondary star (smaller, offset)
  const star2Points = Array.from({ length: 7 }, (_, i) => {
    const a = (i * 2 * Math.PI) / 7 - Math.PI / 2 + Math.PI / 7;
    const r = size * 0.13;
    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
  }).join(' ');

  return (
    <Animated.View style={[styles.container, { width: size, height: size }]}>
      {/* Outer rotating ring */}
      <AnimatedSvg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        animatedProps={svgProps}
        style={StyleSheet.absoluteFill}
      >
        {/* Outer double ring */}
        <Circle cx={cx} cy={cy} r={size * 0.44} fill="none" stroke={GOLD_FAINT} strokeWidth={0.5} />
        <Circle cx={cx} cy={cy} r={size * 0.42} fill="none" stroke={GOLD} strokeWidth={1.5} />
        <Circle cx={cx} cy={cy} r={size * 0.38} fill="none" stroke={GOLD_FAINT} strokeWidth={0.5} />

        {/* Tick marks */}
        {ticks}

        {/* Rune-like marks on outer ring */}
        {[0, 90, 180, 270].map((deg, i) => {
          const a = (deg * Math.PI) / 180;
          const r = size * 0.4;
          return (
            <Line
              key={`rune-${i}`}
              x1={cx + r * Math.cos(a)}
              y1={cy + r * Math.sin(a)}
              x2={cx + (r + 12) * Math.cos(a)}
              y2={cy + (r + 12) * Math.sin(a)}
              stroke={GOLD_BRIGHT}
              strokeWidth={2}
            />
          );
        })}

        {/* Heptagram connecting lines */}
        {Array.from({ length: 7 }, (_, i) => {
          const a1 = (i * 2 * Math.PI) / 7 - Math.PI / 2;
          const a2 = ((i + 3) * 2 * Math.PI) / 7 - Math.PI / 2;
          const r = size * 0.25;
          return (
            <Line
              key={`hept-${i}`}
              x1={cx + r * Math.cos(a1)}
              y1={cy + r * Math.sin(a1)}
              x2={cx + r * Math.cos(a2)}
              y2={cy + r * Math.sin(a2)}
              stroke={GOLD_FAINT}
              strokeWidth={0.6}
            />
          );
        })}
      </AnimatedSvg>

      {/* Inner counter-rotating ring */}
      <AnimatedSvg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        animatedProps={innerSvgProps}
        style={StyleSheet.absoluteFill}
      >
        {/* Inner ring */}
        <Circle cx={cx} cy={cy} r={size * 0.3} fill="none" stroke={GOLD} strokeWidth={1} />
        <Circle cx={cx} cy={cy} r={size * 0.28} fill="none" stroke={GOLD_FAINT} strokeWidth={0.5} />

        {/* Four directional markers */}
        {['北', '東', '南', '西'].map((rune, i) => {
          const a = (i * Math.PI) / 2 - Math.PI / 2;
          const r = size * 0.33;
          return (
            <SvgText
              key={`dir-${i}`}
              x={cx + r * Math.cos(a)}
              y={cy + r * Math.sin(a) + 4}
              fill={GOLD_BRIGHT}
              fontSize={10}
              textAnchor="middle"
              fontWeight="bold"
            >
              {rune}
            </SvgText>
          );
        })}

        {/* Secondary star */}
        <Polygon points={star2Points} fill="none" stroke={GOLD_FAINT} strokeWidth={0.8} />
      </AnimatedSvg>

      {/* Central pulsing core */}
      <Animated.View style={[styles.coreWrapper]}>
        <AnimatedSvg
          width={size * 0.2}
          height={size * 0.2}
          viewBox={`0 0 ${size * 0.2} ${size * 0.2}`}
          animatedProps={pulseProps}
        >
          <Circle cx={size * 0.1} cy={size * 0.1} r={size * 0.08} fill="none" stroke={GOLD} strokeWidth={1.5} />
          <Circle cx={size * 0.1} cy={size * 0.1} r={size * 0.05} fill="none" stroke={GOLD_BRIGHT} strokeWidth={0.8} />
          <Circle cx={size * 0.1} cy={size * 0.1} r={size * 0.025} fill={GOLD_BRIGHT} opacity={0.6} />
        </AnimatedSvg>
      </Animated.View>

      {/* Ambient glow ring (static, CSS blur effect) */}
      <Animated.View
        style={[
          styles.glowRing,
          {
            width: size * 0.5,
            height: size * 0.5,
            borderRadius: size * 0.25,
            borderColor: 'rgba(201,169,110,0.15)',
          },
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.8,
  },
  coreWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    borderWidth: 2,
    shadowColor: '#C9A96E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
});
