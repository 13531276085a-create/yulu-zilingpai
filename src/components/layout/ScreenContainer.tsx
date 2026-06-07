import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/theme';

interface Props {
  children: React.ReactNode;
  background?: string;
}

export default function ScreenContainer({ children, background = Colors.background }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={background} />
      <View style={[styles.inner, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1 }, inner: { flex: 1 } });
