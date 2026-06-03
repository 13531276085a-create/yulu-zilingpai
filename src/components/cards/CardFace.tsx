import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CardDefinition } from '../../types';
import ChineseText from '../ui/ChineseText';
import CardShimmer from '../effects/CardShimmer';
import { Colors, Shadows, BorderRadius } from '../../constants/theme';

interface Props { card: CardDefinition }

const CAT_LABEL: Record<string, string> = { major: '主星', auxiliary: '輔星', misc: '雜曜' };

// Mucha soft pastel palette per element
const PALETTE: Record<string, { bg: string; halo: string; accent: string; soft: string; glow: string }> = {
  '木': { bg: '#F4F9F0', halo: '#C8DFB8', accent: '#5B7F3C', soft: '#A8C98A', glow: '#E6F0DD' },
  '火': { bg: '#FDF5F3', halo: '#F0C4BF', accent: '#B5453C', soft: '#E8908A', glow: '#FBE8E4' },
  '土': { bg: '#FDF9F2', halo: '#F0D9B0', accent: '#B8782A', soft: '#DCB878', glow: '#FBF0E0' },
  '金': { bg: '#FDFCF4', halo: '#F2E6B8', accent: '#B8952A', soft: '#DDC878', glow: '#FAF4DC' },
  '水': { bg: '#F4F6FC', halo: '#C4CFEB', accent: '#3F5B9C', soft: '#8A9EC8', glow: '#E2E7F6' },
};

export default function CardFace({ card }: Props) {
  const p = PALETTE[card.fiveElement] || PALETTE['土'];

  return (
    <View style={[styles.card, Shadows.md]}>
      {/* Holographic shimmer overlay */}
      <CardShimmer width={154} height={234} interval={3500} />

      {/* Outer gold filigree frame */}
      <View style={styles.goldFrame}>
        {/* Corner floral ornaments */}
        <View style={[styles.corner, styles.cTL]}>
          <View style={[styles.cDot, { backgroundColor: p.accent }]} />
          <View style={[styles.cPetal, { borderColor: p.accent }]} />
        </View>
        <View style={[styles.corner, styles.cTR]}>
          <View style={[styles.cPetal, { borderColor: p.accent }]} />
          <View style={[styles.cDot, { backgroundColor: p.accent }]} />
        </View>
        <View style={[styles.corner, styles.cBL]}>
          <View style={[styles.cPetal, { borderColor: p.accent }]} />
          <View style={[styles.cDot, { backgroundColor: p.accent }]} />
        </View>
        <View style={[styles.corner, styles.cBR]}>
          <View style={[styles.cDot, { backgroundColor: p.accent }]} />
          <View style={[styles.cPetal, { borderColor: p.accent }]} />
        </View>

        {/* Inner cream panel */}
        <View style={[styles.panel, { backgroundColor: p.bg }]}>
          {/* Top filigree band */}
          <View style={styles.filigree}>
            <View style={[styles.fLine, { backgroundColor: p.accent }]} />
            <View style={[styles.fSwirl, { borderColor: p.accent }]} />
            <View style={[styles.fDot, { backgroundColor: p.accent }]} />
            <View style={[styles.fSwirl, { borderColor: p.accent }]} />
            <View style={[styles.fLine, { backgroundColor: p.accent }]} />
          </View>

          {/* Category tag */}
          <View style={[styles.tag, { borderColor: p.accent + '40' }]}>
            <ChineseText style={[styles.tagText, { color: p.accent }]}>
              {CAT_LABEL[card.category]}
            </ChineseText>
          </View>

          {/* Circular halo — the Mucha mandorla */}
          <View style={[styles.haloOuter, { borderColor: p.halo }]}>
            <View style={[styles.haloMid, { borderColor: p.soft + '60' }]}>
              <View style={[styles.haloInner, { backgroundColor: p.glow, borderColor: p.soft + '40' }]}>
                {/* Element kanji as central motif */}
                <ChineseText style={[styles.kanji, { color: p.accent }]}>
                  {card.fiveElement}
                </ChineseText>
              </View>
            </View>
          </View>

          {/* Star name with Art Nouveau side flourishes */}
          <View style={styles.nameRow}>
            <View style={styles.nameFlourish}>
              <View style={[styles.nfDot, { backgroundColor: p.accent }]} />
              <View style={[styles.nfLine, { backgroundColor: p.accent }]} />
            </View>
            <ChineseText style={[styles.starName, { color: p.accent }]}>
              {card.nameZh}
            </ChineseText>
            <View style={styles.nameFlourish}>
              <View style={[styles.nfLine, { backgroundColor: p.accent }]} />
              <View style={[styles.nfDot, { backgroundColor: p.accent }]} />
            </View>
          </View>

          {/* YinYang element line */}
          <View style={styles.infoRow}>
            <ChineseText style={[styles.infoText, { color: p.accent }]}>
              {card.yinYang}
            </ChineseText>
            <View style={[styles.infoSep, { backgroundColor: p.accent }]} />
            <ChineseText style={[styles.infoText, { color: p.accent }]}>
              {card.fiveElement}
            </ChineseText>
          </View>

          {/* Keywords as delicate pills */}
          <View style={styles.kwRow}>
            {card.keywords.slice(0, 2).map((kw) => (
              <View key={kw} style={[styles.kwPill, { borderColor: p.soft + '80' }]}>
                <ChineseText style={[styles.kwText, { color: p.accent }]}>{kw}</ChineseText>
              </View>
            ))}
          </View>

          {/* Bottom filigree band */}
          <View style={styles.filigree}>
            <View style={[styles.fLine, { backgroundColor: p.accent }]} />
            <View style={[styles.fSwirl, { borderColor: p.accent }]} />
            <View style={[styles.fDot, { backgroundColor: p.accent }]} />
            <View style={[styles.fSwirl, { borderColor: p.accent }]} />
            <View style={[styles.fLine, { backgroundColor: p.accent }]} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 154,
    height: 234,
    borderRadius: 4,
    backgroundColor: '#FDFAF3',
  },
  goldFrame: {
    flex: 1,
    margin: 3,
    borderWidth: 1,
    borderColor: '#D8CDA8',
    borderRadius: 2,
    overflow: 'hidden',
  },
  // Corner ornaments
  corner: { position: 'absolute', zIndex: 20, flexDirection: 'row', alignItems: 'center', gap: 4 },
  cTL: { top: 3, left: 5 },
  cTR: { top: 3, right: 5 },
  cBL: { bottom: 3, left: 5 },
  cBR: { bottom: 3, right: 5 },
  cDot: { width: 4, height: 4, borderRadius: 2, opacity: 0.5 },
  cPetal: { width: 10, height: 5, borderRadius: 3, borderWidth: 0.8, opacity: 0.35 },
  // Inner panel
  panel: {
    flex: 1,
    margin: 8,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 3,
  },
  // Filigree decorative band
  filigree: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  fLine: { width: 18, height: 0.8, borderRadius: 1, opacity: 0.35 },
  fSwirl: { width: 6, height: 3, borderRadius: 4, borderWidth: 0.8, opacity: 0.35 },
  fDot: { width: 3, height: 3, borderRadius: 2, opacity: 0.5 },
  // Category tag
  tag: {
    paddingHorizontal: 8, paddingVertical: 1,
    borderRadius: 6, borderWidth: 1,
  },
  tagText: { fontSize: 9, letterSpacing: 3, fontWeight: '600' },
  // Halo / mandorla
  haloOuter: {
    width: 74, height: 74, borderRadius: 37,
    borderWidth: 2.5, alignItems: 'center', justifyContent: 'center',
  },
  haloMid: {
    width: 62, height: 62, borderRadius: 31,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  haloInner: {
    width: 48, height: 48, borderRadius: 24,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  kanji: { fontSize: 22, fontWeight: '900', letterSpacing: 0 },
  // Star name with flourishes
  nameRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  nameFlourish: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
  },
  nfLine: { width: 10, height: 1, borderRadius: 1, opacity: 0.4 },
  nfDot: { width: 3, height: 3, borderRadius: 2, opacity: 0.5 },
  starName: {
    fontSize: 17, fontWeight: '800', letterSpacing: 5,
  },
  // Info
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  infoSep: { width: 0.8, height: 10, opacity: 0.25, borderRadius: 1 },
  infoText: { fontSize: 10, fontWeight: '600', letterSpacing: 2 },
  // Keywords
  kwRow: { flexDirection: 'row', gap: 4 },
  kwPill: { paddingHorizontal: 7, paddingVertical: 1, borderRadius: 5, borderWidth: 1 },
  kwText: { fontSize: 8, letterSpacing: 1 },
});
