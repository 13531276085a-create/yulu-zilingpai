import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ChineseText from '../ui/ChineseText';
import { Colors } from '../../constants/theme';

interface Props {
  title: string;
  onBack?: () => void;
}

export default function BackHeader({ title, onBack }: Props) {
  const navigation = useNavigation();
  const handleBack = onBack || (() => navigation.goBack());

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
        <ChineseText style={styles.arrow}>←</ChineseText>
        <ChineseText style={styles.backText}>返回</ChineseText>
      </TouchableOpacity>
      <ChineseText variant="headingSmall" style={styles.title} numberOfLines={1}>
        {title}
      </ChineseText>
      <View style={styles.placeholder} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingRight: 12,
    minWidth: 60,
  },
  arrow: { fontSize: 18, color: Colors.primary },
  backText: { color: Colors.primary, fontSize: 14 },
  title: { color: Colors.textPrimary, flex: 1, textAlign: 'center' },
  placeholder: { minWidth: 60 },
});
