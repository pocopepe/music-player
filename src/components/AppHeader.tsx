import { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/theme';
import { useColors } from '../hooks/useColors';

export default function AppHeader() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const C = useColors();
  const styles = useMemo(() => StyleSheet.create({
    container: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      backgroundColor: C.background, paddingHorizontal: 20, paddingBottom: 12,
    },
    left: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    logo: { fontSize: 24, color: Colors.accent },
    appName: { fontSize: 20, fontWeight: '700', color: C.text },
  }), [C]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.left}>
        <Text style={styles.logo}>♪</Text>
        <Text style={styles.appName}>Mume</Text>
      </View>
      <TouchableOpacity onPress={() => navigation.navigate('Search')}>
        <Ionicons name="search-outline" size={24} color={C.text} />
      </TouchableOpacity>
    </View>
  );
}
