import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './navigation/RootNavigator';
import MiniPlayer from './components/MiniPlayer';

export default function App() {
  return (
    <NavigationContainer>
      <View style={styles.container}>
        <RootNavigator />
        <MiniPlayer />
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
