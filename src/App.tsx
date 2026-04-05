import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import RootNavigator from './navigation/RootNavigator';
import MiniPlayer from './components/MiniPlayer';
import { navigationRef } from './navigation/navigationRef';

function AppInner() {
  const [currentRoute, setCurrentRoute] = useState<string | undefined>();
  const insets = useSafeAreaInsets();
  const noTabBar = currentRoute === 'Artist' || currentRoute === 'Album';

  return (
    <NavigationContainer
      ref={navigationRef}
      onStateChange={() => setCurrentRoute(navigationRef.getCurrentRoute()?.name)}
    >
      <View style={styles.container}>
        <RootNavigator />
        {currentRoute !== 'Player' && currentRoute !== 'Search' && currentRoute !== 'Queue' && (
          <MiniPlayer bottom={noTabBar ? insets.bottom : 85} />
        )}
      </View>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <AppInner />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
