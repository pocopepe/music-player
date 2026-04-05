import { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../../constants/theme';
import AppHeader from '../components/AppHeader';
import FilterTabs from '../components/FilterTabs';
import SuggestedContent from '../components/home/SuggestedContent';
import LocalSongsContent from '../components/home/LocalSongsContent';
import ArtistsContent from '../components/home/ArtistsContent';
import AlbumsContent from '../components/home/AlbumsContent';
import { searchSongs, Song } from '../services/api';
import { getRecentlyPlayed, getMostPlayed } from '../storage/storage';

export default function HomeScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState('Suggested');
  const [trending, setTrending] = useState<Song[]>([]);
  const [popular, setPopular] = useState<Song[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);
  const [mostPlayed, setMostPlayed] = useState<Song[]>([]);
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

  useFocusEffect(useCallback(() => {
    setRecentlyPlayed(getRecentlyPlayed());
    setMostPlayed(getMostPlayed());
  }, []));

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  const suggestedRecent = recentlyPlayed.length > 0 ? recentlyPlayed.slice(0, 10) : trending.slice(0, 10);

  return (
    <View style={styles.container}>
      <AppHeader />
      <FilterTabs activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === 'Suggested' && (
        <SuggestedContent
          recentlyPlayed={suggestedRecent}
          mostPlayed={mostPlayed.length > 0 ? mostPlayed : popular.slice(0, 10)}
        />
      )}
      {activeTab === 'Songs' && <LocalSongsContent />}
      {activeTab === 'Artists' && <ArtistsContent navigation={navigation} />}
      {activeTab === 'Albums' && <AlbumsContent navigation={navigation} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  centered: { alignItems: 'center', justifyContent: 'center' },
});
