import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/theme';

export default function AppHeader() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.left}>
        <Text style={styles.logo}>♪</Text>
        <Text style={styles.appName}>Mume</Text>
      </View>
      <TouchableOpacity>
        <Text style={styles.searchIcon}>⌕</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.light.background,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    fontSize: 24,
    color: Colors.accent,
  },
  appName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
  },
  searchIcon: {
    fontSize: 24,
    color: Colors.light.text,
  },
});
