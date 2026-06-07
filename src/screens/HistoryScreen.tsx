import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import ScreenContainer from '../components/layout/ScreenContainer';
import BackHeader from '../components/layout/BackHeader';
import ChineseText from '../components/ui/ChineseText';
import Divider from '../components/ui/Divider';
import { useHistoryStore } from '../store/historyStore';
import { Colors } from '../constants/theme';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'History'> };

export default function HistoryScreen({ navigation }: Props) {
  const readings = useHistoryStore(s => s.readings);
  const deleteReading = useHistoryStore(s => s.deleteReading);

  const handleDelete = (id: string) => {
    Alert.alert('刪除紀錄', '確定要刪除這筆占卜紀錄嗎？', [
      { text: '取消', style: 'cancel' },
      { text: '刪除', style: 'destructive', onPress: () => deleteReading(id) },
    ]);
  };

  const fmt = (ts: number) => {
    const d = new Date(ts);
    return `${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`;
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <BackHeader title="占卜紀錄" />
        <Divider />
        {readings.length === 0 ? (
          <View style={styles.empty}>
            <ChineseText style={styles.emptyText}>尚無占卜紀錄</ChineseText>
            <ChineseText style={styles.emptyHint}>完成一次抽牌後，結果將會保存在此</ChineseText>
          </View>
        ) : (
          <FlatList
            data={readings}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('HistoryDetail', { reading: item })} onLongPress={() => handleDelete(item.id)}>
                <ChineseText style={styles.rowQ} numberOfLines={1}>{item.question}</ChineseText>
                <ChineseText variant="caption" style={styles.rowDate}>{fmt(item.timestamp)}</ChineseText>
                <View style={styles.cardRow}>
                  {item.cards.map((c, i) => (
                    <View key={i} style={styles.cardPill}>
                      <ChineseText variant="caption" style={styles.cardPillText}>{c.nameZh}</ChineseText>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
          />
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  title: { textAlign: 'center', color: Colors.textPrimary },
  list: { paddingBottom: 32 },
  row: { backgroundColor: Colors.surfaceCard, borderRadius: 14, padding: 16, marginVertical: 6, borderWidth: 1, borderColor: Colors.cardBorder },
  rowQ: { color: Colors.textPrimary, fontSize: 16 },
  rowDate: { color: Colors.textMuted, marginTop: 4 },
  cardRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  cardPill: { backgroundColor: Colors.primaryPale, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  cardPillText: { color: Colors.primaryDark },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 100 },
  emptyText: { color: Colors.textMuted, fontSize: 18 },
  emptyHint: { color: Colors.textMuted, marginTop: 8, fontSize: 14 },
});
