import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Polygon, Line } from 'react-native-svg';
import ChineseText from '../ui/ChineseText';
import { Shadows } from '../../constants/theme';

const GOLD = '#C9A96E';
const GOLD_BRIGHT = '#E8D5A0';
const GOLD_FAINT = 'rgba(201,169,110,0.35)';

export default function CardBack() {
  const w = 130;
  const h = 195;
  const cx = w / 2;
  const cy = h / 2;

  // Pentagram star points
  const starPoints = Array.from({ length: 5 }, (_, i) => {
    const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const r = 22;
    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
  }).join(' ');

  // Inner pentagram
  const innerStar = Array.from({ length: 5 }, (_, i) => {
    const a = (i * 4 * Math.PI) / 5 - Math.PI / 2 + Math.PI / 5;
    const r = 10;
    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
  }).join(' ');

  return (
    <View style={[styles.card, Shadows.md]}>
      {/* SVG layer for ornate lines */}
      <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={StyleSheet.absoluteFill}>
        {/* Outer frame */}
        <Line x1={4} y1={8} x2={w - 4} y2={8} stroke={GOLD} strokeWidth={1.2} />
        <Line x1={4} y1={h - 8} x2={w - 4} y2={h - 8} stroke={GOLD} strokeWidth={1.2} />
        <Line x1={8} y1={4} x2={8} y2={h - 4} stroke={GOLD} strokeWidth={1.2} />
        <Line x1={w - 8} y1={4} x2={w - 8} y2={h - 4} stroke={GOLD} strokeWidth={1.2} />

        {/* Corner ornament arcs */}
        {[
          [8, 8],
          [w - 8, 8],
          [8, h - 8],
          [w - 8, h - 8],
        ].map(([x, y], i) => (
          <React.Fragment key={`corner-${i}`}>
            <Circle cx={x} cy={y} r={6} fill="none" stroke={GOLD} strokeWidth={0.8} />
            <Circle cx={x} cy={y} r={3} fill={GOLD} opacity={0.5} />
          </React.Fragment>
        ))}

        {/* Inner border */}
        <Line x1={14} y1={18} x2={w - 14} y2={18} stroke={GOLD_FAINT} strokeWidth={0.5} />
        <Line x1={14} y1={h - 18} x2={w - 14} y2={h - 18} stroke={GOLD_FAINT} strokeWidth={0.5} />
        <Line x1={18} y1={14} x2={18} y2={h - 14} stroke={GOLD_FAINT} strokeWidth={0.5} />
        <Line x1={w - 18} y1={14} x2={w - 18} y2={h - 14} stroke={GOLD_FAINT} strokeWidth={0.5} />

        {/* Central pentagram */}
        <Polygon points={starPoints} fill="none" stroke={GOLD} strokeWidth={1.2} />
        <Polygon points={innerStar} fill="none" stroke={GOLD_FAINT} strokeWidth={0.6} />
        <Circle cx={cx} cy={cy} r={4} fill={GOLD_BRIGHT} opacity={0.6} />

        {/* Moon crescents - left and right side ornaments */}
        <Circle cx={cx - 35} cy={cy} r={14} fill="none" stroke={GOLD_FAINT} strokeWidth={0.5} />
        <Circle cx={cx - 35} cy={cy} r={12} fill="none" stroke={GOLD_FAINT} strokeWidth={0.3} />
        <Circle cx={cx + 35} cy={cy} r={14} fill="none" stroke={GOLD_FAINT} strokeWidth={0.5} />
        <Circle cx={cx + 35} cy={cy} r={12} fill="none" stroke={GOLD_FAINT} strokeWidth={0.3} />
      </Svg>

      {/* Top text */}
      <ChineseText style={styles.title}>紫微斗數</ChineseText>

      {/* Bottom decorative line + text */}
      <View style={styles.divider}>
        <View style={styles.divLine} />
        <View style={styles.divDiamond} />
        <View style={styles.divLine} />
      </View>
      <ChineseText style={styles.subtitle}>紫靈牌</ChineseText>

      {/* Corner petals (View-based, outside SVG) */}
      <View style={[styles.cornerPetal, styles.tl]} />
      <View style={[styles.cornerPetal, styles.tr]} />
      <View style={[styles.cornerPetal, styles.bl]} />
      <View style={[styles.cornerPetal, styles.br]} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 130,
    height: 195,
    borderRadius: 3,
    backgroundColor: '#0D0D1A',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  title: {
    color: GOLD,
    fontSize: 9,
    letterSpacing: 6,
    position: 'absolute',
    top: 26,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    bottom: 38,
    gap: 4,
  },
  divLine: {
    width: 16,
    height: 0.5,
    backgroundColor: GOLD_FAINT,
    borderRadius: 1,
  },
  divDiamond: {
    width: 3,
    height: 3,
    transform: [{ rotate: '45deg' }],
    backgroundColor: GOLD,
    borderRadius: 1,
    opacity: 0.6,
  },
  subtitle: {
    color: GOLD,
    fontSize: 9,
    letterSpacing: 5,
    position: 'absolute',
    bottom: 24,
  },
  cornerPetal: {
    position: 'absolute',
    width: 14,
    height: 7,
    borderRadius: 10,
    borderWidth: 0.8,
    borderColor: GOLD_FAINT,
  },
  tl: { top: 10, left: 10, transform: [{ rotate: '-45deg' }] },
  tr: { top: 10, right: 10, transform: [{ rotate: '45deg' }] },
  bl: { bottom: 10, left: 10, transform: [{ rotate: '45deg' }] },
  br: { bottom: 10, right: 10, transform: [{ rotate: '-45deg' }] },
});
