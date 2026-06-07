import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, {
  Circle, Line, Polygon, Text as SvgText,
  Defs, RadialGradient, Stop, G,
} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';

const AnimatedSvg = Animated.createAnimatedComponent(Svg);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedG = Animated.createAnimatedComponent(G);

interface Props {
  size?: number;
  speed?: number;
  highlightIndex?: number; // which card slot is currently highlighted
  totalSlots?: number;
}

/** AstrolabeWheel — central sacred geometry astrolabe with rotating rings */
export default function AstrolabeWheel({
  size = 320,
  speed = 80,
  highlightIndex = 0,
  totalSlots = 9,
}: Props) {
  const outerRotation = useSharedValue(0);
  const innerRotation = useSharedValue(0);
  const coreRotation = useSharedValue(0);
  const pulseGlow = useSharedValue(1);

  useEffect(() => {
    outerRotation.value = withRepeat(withTiming(360, { duration: speed * 1000 }), -1, false);
    innerRotation.value = withRepeat(withTiming(-360, { duration: speed * 1000 * 0.65 }), -1, false);
    coreRotation.value = withRepeat(withTiming(360, { duration: speed * 1000 * 0.3 }), -1, false);
    pulseGlow.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 2000 }),
        withTiming(1, { duration: 2000 }),
      ),
      -1,
      true,
    );
  }, [speed]);

  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.46;
  const midR = size * 0.34;
  const innerR = size * 0.22;
  const coreR = size * 0.10;

  // Colors
  const VIOLET = 'rgba(180,150,220,';
  const LAVENDER = 'rgba(210,190,240,';
  const WHITE = 'rgba(245,240,255,';
  const WHITE_BRIGHT = 'rgba(255,255,255,';

  // Outer ring ticks (72 ticks = every 5 degrees, like an astrolabe)
  const outerTicks = useMemo(() => Array.from({ length: 72 }, (_, i) => {
    const angle = (i * 5 * Math.PI) / 180;
    const isMajor = i % 6 === 0;
    const isHalf = i % 3 === 0 && !isMajor;
    const r1 = outerR - (isMajor ? 12 : isHalf ? 8 : 4);
    const r2 = outerR;
    const x1 = cx + r1 * Math.cos(angle);
    const y1 = cy + r1 * Math.sin(angle);
    const x2 = cx + r2 * Math.cos(angle);
    const y2 = cy + r2 * Math.sin(angle);
    return (
      <Line
        key={`ot-${i}`}
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={isMajor ? WHITE + '0.7)' : isHalf ? VIOLET + '0.5)' : LAVENDER + '0.25)'}
        strokeWidth={isMajor ? 1.2 : isHalf ? 0.7 : 0.4}
      />
    );
  }), [size]);

  // Middle ring: 12 constellation/zodiac markers
  const zodiacSymbols = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const zodiacMarkers = useMemo(() => Array.from({ length: 12 }, (_, i) => {
    const angle = (i * 30 - 90) * Math.PI / 180;
    const r = midR + 4;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle) + 4;
    return (
      <SvgText
        key={`zod-${i}`}
        x={x} y={y}
        fill={i % 3 === 0 ? WHITE + '0.7)' : VIOLET + '0.5)'}
        fontSize={i % 3 === 0 ? 10 : 8}
        textAnchor="middle"
        fontWeight={i % 3 === 0 ? 'bold' : 'normal'}
      >
        {zodiacSymbols[i]}
      </SvgText>
    );
  }), [size]);

  // Sacred geometry: heptagram (7-pointed star)
  const heptagram = useMemo(() => {
    const points = Array.from({ length: 7 }, (_, i) => {
      const a = (i * 2 * Math.PI) / 7 - Math.PI / 2;
      const r = innerR * 0.85;
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    }).join(' ');
    const lines = Array.from({ length: 7 }, (_, i) => {
      const a1 = (i * 2 * Math.PI) / 7 - Math.PI / 2;
      const a2 = ((i + 3) * 2 * Math.PI) / 7 - Math.PI / 2;
      const r = innerR * 0.85;
      return (
        <Line
          key={`hept-${i}`}
          x1={cx + r * Math.cos(a1)} y1={cy + r * Math.sin(a1)}
          x2={cx + r * Math.cos(a2)} y2={cy + r * Math.sin(a2)}
          stroke={LAVENDER + '0.25)'} strokeWidth={0.5}
        />
      );
    });
    return (
      <>
        <Polygon points={points} fill="none" stroke={VIOLET + '0.4)'} strokeWidth={1} />
        {lines}
      </>
    );
  }, [size]);

  // Inner star
  const innerStar = useMemo(() => {
    const points = Array.from({ length: 6 }, (_, i) => {
      const a = (i * Math.PI) / 3 - Math.PI / 2;
      const r = coreR * 2.2;
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    }).join(' ');
    return <Polygon points={points} fill="none" stroke={WHITE + '0.5)'} strokeWidth={0.8} />;
  }, [size]);

  const outerSvgProps = useAnimatedProps(() => ({
    rotation: outerRotation.value, originX: cx, originY: cy,
  }));
  const innerSvgProps = useAnimatedProps(() => ({
    rotation: innerRotation.value, originX: cx, originY: cy,
  }));
  const coreSvgProps = useAnimatedProps(() => ({
    rotation: coreRotation.value, originX: cx, originY: cy,
  }));
  const pulseProps = useAnimatedProps(() => ({
    opacity: pulseGlow.value,
  }));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Ambient glow behind everything */}
      <View style={[styles.ambientGlow, {
        width: size * 1.2, height: size * 1.2,
        borderRadius: size * 0.6,
        top: -size * 0.1, left: -size * 0.1,
      }]} />

      {/* Outer rotating ring + ticks */}
      <AnimatedSvg
        width={size} height={size}
        viewBox={`0 0 ${size} ${size}`}
        animatedProps={outerSvgProps}
        style={StyleSheet.absoluteFill}
      >
        <Defs>
          <RadialGradient id="ringGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={VIOLET + '0.05)'} />
            <Stop offset="70%" stopColor={VIOLET + '0.08)'} />
            <Stop offset="85%" stopColor={VIOLET + '0.15)'} />
            <Stop offset="100%" stopColor={VIOLET + '0.02)'} />
          </RadialGradient>
        </Defs>

        {/* Outer rings */}
        <Circle cx={cx} cy={cy} r={outerR + 3} fill="none" stroke={LAVENDER + '0.15)'} strokeWidth={1.5} />
        <Circle cx={cx} cy={cy} r={outerR} fill="url(#ringGlow)" />
        <Circle cx={cx} cy={cy} r={outerR} fill="none" stroke={VIOLET + '0.45)'} strokeWidth={2} />
        <Circle cx={cx} cy={cy} r={outerR - 16} fill="none" stroke={LAVENDER + '0.2)'} strokeWidth={0.8} />

        {/* Outer ticks */}
        {outerTicks}

        {/* Zodiac markers */}
        {zodiacMarkers}

        {/* Middle ring */}
        <Circle cx={cx} cy={cy} r={midR} fill="none" stroke={VIOLET + '0.3)'} strokeWidth={1.5} />
        <Circle cx={cx} cy={cy} r={midR - 3} fill="none" stroke={LAVENDER + '0.15)'} strokeWidth={0.5} />

        {/* Constellation dots along mid ring */}
        {Array.from({ length: 28 }, (_, i) => {
          const a = (i * 12.857 * Math.PI) / 180;
          const r = midR - 1;
          const x = cx + r * Math.cos(a);
          const y = cy + r * Math.sin(a);
          const isBright = i % 7 === 0;
          return (
            <Circle
              key={`const-${i}`}
              cx={x} cy={y}
              r={isBright ? 2 : 1}
              fill={isBright ? WHITE + '0.6)' : LAVENDER + '0.3)'}
            />
          );
        })}
      </AnimatedSvg>

      {/* Inner counter-rotating ring */}
      <AnimatedSvg
        width={size} height={size}
        viewBox={`0 0 ${size} ${size}`}
        animatedProps={innerSvgProps}
        style={StyleSheet.absoluteFill}
      >
        <Defs>
          <RadialGradient id="innerGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={LAVENDER + '0.15)'} />
            <Stop offset="50%" stopColor={VIOLET + '0.1)'} />
            <Stop offset="100%" stopColor={VIOLET + '0.02)'} />
          </RadialGradient>
        </Defs>

        {/* Inner ring */}
        <Circle cx={cx} cy={cy} r={innerR + 4} fill="none" stroke={LAVENDER + '0.2)'} strokeWidth={1} />
        <Circle cx={cx} cy={cy} r={innerR} fill="url(#innerGlow)" />
        <Circle cx={cx} cy={cy} r={innerR} fill="none" stroke={VIOLET + '0.5)'} strokeWidth={1.5} />

        {/* Sacred geometry */}
        {heptagram}

        {/* Four cardinal direction markers */}
        {['北', '東', '南', '西'].map((dir, i) => {
          const a = (i * Math.PI) / 2 - Math.PI / 2;
          const r = innerR + 10;
          return (
            <SvgText
              key={`dir-${i}`}
              x={cx + r * Math.cos(a)}
              y={cy + r * Math.sin(a) + 3}
              fill={WHITE + '0.55)'}
              fontSize={9}
              textAnchor="middle"
            >
              {dir}
            </SvgText>
          );
        })}
      </AnimatedSvg>

      {/* Pulsing core */}
      <AnimatedSvg
        width={size} height={size}
        viewBox={`0 0 ${size} ${size}`}
        animatedProps={coreSvgProps}
        style={StyleSheet.absoluteFill}
      >
        {/* Inner star */}
        {innerStar}

        {/* Core rings */}
        <Circle cx={cx} cy={cy} r={coreR + 8} fill="none" stroke={LAVENDER + '0.2)'} strokeWidth={0.5} />
        <Circle cx={cx} cy={cy} r={coreR + 4} fill="none" stroke={VIOLET + '0.5)'} strokeWidth={1} />
      </AnimatedSvg>

      {/* Central glowing orb */}
      <AnimatedSvg
        width={size} height={size}
        viewBox={`0 0 ${size} ${size}`}
        animatedProps={pulseProps}
        style={[StyleSheet.absoluteFill, { opacity: 1 }]}
      >
        <Defs>
          <RadialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={WHITE + '0.95)'} />
            <Stop offset="20%" stopColor={WHITE + '0.7)'} />
            <Stop offset="50%" stopColor={LAVENDER + '0.3)'} />
            <Stop offset="100%" stopColor={VIOLET + '0.0)'} />
          </RadialGradient>
        </Defs>
        <Circle cx={cx} cy={cy} r={coreR + 6} fill="url(#coreGlow)" />
        <Circle cx={cx} cy={cy} r={coreR * 0.7} fill={WHITE + '0.9)'} />
      </AnimatedSvg>

      {/* Pointer beam slot indicators (drawn by parent's highlight) */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ambientGlow: {
    position: 'absolute',
    backgroundColor: 'rgba(140,110,200,0.04)',
    shadowColor: 'rgba(180,150,220,0.15)',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 40,
    elevation: 10,
  },
});
