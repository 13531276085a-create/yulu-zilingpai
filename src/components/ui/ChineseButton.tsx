import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, View } from 'react-native';
import ChineseText from './ChineseText';
import { Colors, Shadows, BorderRadius } from '../../constants/theme';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  disabled?: boolean;
  style?: ViewStyle;
  icon?: string;
}

export default function ChineseButton({ title, onPress, variant = 'primary', disabled, style, icon }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.75}
      style={[styles.base, styles[variant], disabled && styles.disabled, Shadows.sm, style]}
    >
      {icon && <ChineseText style={styles.icon}>{icon}</ChineseText>}
      <ChineseText
        variant="accent"
        style={[
          styles.text,
          variant === 'ghost' ? styles.textGhost :
          variant === 'outline' ? styles.textOutline :
          styles.textFilled,
        ]}
      >
        {title}
      </ChineseText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 15,
    paddingHorizontal: 28,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  primary: {
    backgroundColor: Colors.btnPrimary,
    borderWidth: 0,
  },
  secondary: {
    backgroundColor: Colors.btnSecondary,
    borderWidth: 0,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primaryLight,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingVertical: 10,
  },
  disabled: { opacity: 0.35 },
  icon: { fontSize: 16 },
  text: { textAlign: 'center' },
  textFilled: { color: Colors.btnTextWhite },
  textOutline: { color: Colors.primary },
  textGhost: { color: Colors.primary },
});
