import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, StarCategory } from '../types';
import ScreenContainer from '../components/layout/ScreenContainer';
import BackHeader from '../components/layout/BackHeader';
import ChineseText from '../components/ui/ChineseText';
import CardFace from '../components/cards/CardFace';
import { ALL_CARDS } from '../constants/cards';
import { Colors } from '../constants/theme';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Encyclopedia'> };
const FILTERS: { key: StarCategory | 'all'; label: string }[] = [
  { key: 'all', label: '全部' }, { key: 'major', label: '主星' }, { key: 'auxiliary', label: '輔星' }, { key: 'misc', label: '雜曜' },
];

export default function EncyclopediaScreen({ navigation }: Props) {
  const [filter, setFilter] = useState<StarCategory | 'all'>('all');
  const cards = useMemo(() => filter === 'all' ? ALL_CARDS : ALL_CARDS.filter(c => c.category === filter), [filter]);

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <BackHeader title="星曜圖鑑" />
        <View style={styles.filterRow}>
          {FILTERS.map(f => (
            <TouchableOpacity key={f.key} onPress={() => setFilter(f.key)} style={[styles.filterBtn, filter === f.key && styles.filterActive]}>
              <ChineseText variant="caption" style={[styles.filterText, filter === f.key && styles.filterTextActive]}>{f.label}</ChineseText>
            </TouchableOpacity>
          ))}
        </View>
        <FlatList
          data={cards}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.cardItem} onPress={() => navigation.navigate('CardDetail', { card: item })}>
              <CardFace card={item} />
            </TouchableOpacity>
          )}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  title: { textAlign: 'center', color: Colors.textPrimary, marginBottom: 12 },
  filterRow: { flexDirection: 'row', gap: 6, marginBottom: 16, justifyContent: 'center' },
  filterBtn: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1.5, borderColor: Colors.primaryLight },
  filterActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { color: Colors.textSecondary },
  filterTextActive: { color: '#FFF' },
  list: { paddingBottom: 32 },
  row: { justifyContent: 'space-evenly', marginBottom: 16 },
  cardItem: { transform: [{ scale: 0.85 }] },
});
