import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useColors } from '../hooks/useColors';
import AppHeader from '../components/AppHeader';

export default function SettingsScreen() {
  const C = useColors();
  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: C.background },
  }), [C]);

  return (
    <View style={styles.container}>
      <AppHeader />
    </View>
  );
}
