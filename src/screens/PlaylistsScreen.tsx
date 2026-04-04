import { StyleSheet, View } from 'react-native';
import { Colors } from '../../constants/theme';
import AppHeader from '../components/AppHeader';

export default function PlaylistsScreen() {
  return (
    <View style={styles.container}>
      <AppHeader />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
});
