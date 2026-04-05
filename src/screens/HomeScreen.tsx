import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Colors } from '../../constants/theme';
import AppHeader from '../components/AppHeader';
import FilterTabs from '../components/FilterTabs';
import SuggestedContent from '../components/home/SuggestedContent';
import SongsContent from '../components/home/SongsContent';
import { searchSongs, Song } from '../services/api';

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState('Suggested');
  const [trending, setTrending] = useState<Song[]>([]);
  const [popular, setPopular] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInitial() {
      try {
        const [trendingData, popularData] = await Promise.all([
          searchSongs('trending'),
          searchSongs('top hits'),
        ]);
        setTrending(trendingData.results);
        setPopular(popularData.results);
      } catch (err) {
        console.log('Home fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchInitial();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader />
      <FilterTabs activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === 'Suggested' && (
        <SuggestedContent
          recentlyPlayed={trending.slice(0, 10)}
          mostPlayed={popular.slice(0, 10)}
        />
      )}
      {activeTab === 'Songs' && (
        <SongsContent songs={trending} query="trending" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
