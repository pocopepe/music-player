import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors } from '../../constants/theme';
import AppHeader from '../components/AppHeader';
import FilterTabs from '../components/FilterTabs';

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState('Suggested');

  return (
    <View style={styles.container}>
      <AppHeader />
      <FilterTabs activeTab={activeTab} onTabChange={setActiveTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
});
