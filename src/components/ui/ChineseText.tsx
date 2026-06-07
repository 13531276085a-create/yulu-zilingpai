import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useSettingsStore } from '../../store/settingsStore';
import { Typography } from '../../constants/theme';

interface Props extends TextProps {
  variant?: keyof typeof Typography;
}

export default function ChineseText({ variant = 'body', style, ...props }: Props) {
  const fontScale = useSettingsStore((s) => s.settings.fontSize === 'large' ? 1.15 : 1);
  const baseStyle = Typography[variant];

  return (
    <Text
      {...props}
      style={[
        styles.base,
        baseStyle,
        { fontSize: baseStyle.fontSize * fontScale },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: { color: '#2D2D2D' },
});
