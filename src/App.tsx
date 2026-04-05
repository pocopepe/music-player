import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './navigation/RootNavigator';
import MiniPlayer from './components/MiniPlayer';
import { navigationRef } from './navigation/navigationRef';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<string | undefined>();

  return (
    <GestureHandlerRootView style={styles.container}>
      <NavigationContainer
        ref={navigationRef}
        onStateChange={() => setCurrentRoute(navigationRef.getCurrentRoute()?.name)}
      >
        <View style={styles.container}>
          <RootNavigator />
          {currentRoute !== 'Player' && currentRoute !== 'Search' && currentRoute !== 'Queue' && (
            <MiniPlayer bottom={currentRoute === 'Artist' || currentRoute === 'Album' ? 30 : 85} />
          )}
        </View>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
