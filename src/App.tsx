import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './navigation/RootNavigator';
import MiniPlayer from './components/MiniPlayer';
import { navigationRef } from './navigation/navigationRef';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<string | undefined>();

  return (
    <NavigationContainer
      ref={navigationRef}
      onStateChange={() => setCurrentRoute(navigationRef.getCurrentRoute()?.name)}
    >
      <View style={styles.container}>
        <RootNavigator />
        {currentRoute !== 'Player' && currentRoute !== 'Search' && <MiniPlayer />}
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
