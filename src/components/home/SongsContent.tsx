import { useState } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity,
  StyleSheet, Modal, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/theme';
import { Song, searchSongs } from '../../services/api';
import { playSong, togglePlayPause, playNext } from '../../services/audioService';
import { usePlayerStore } from '../../store/playerStore';

const SORT_OPTIONS = ['Ascending', 'Descending', 'Artist', 'Album', 'Year', 'Date Added', 'Date Modified', 'Composer'];

type Props = {
  songs: Song[];
  query: string;
};

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')} mins`;
}

function sortSongs(songs: Song[], option: string): Song[] {
  const sorted = [...songs];
  switch (option) {
    case 'Ascending':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'Descending':
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case 'Artist':
      return sorted.sort((a, b) => {
        const aArtist = a.artists.primary[0]?.name ?? '';
        const bArtist = b.artists.primary[0]?.name ?? '';
        return aArtist.localeCompare(bArtist);
      });
    case 'Album':
      return sorted.sort((a, b) => a.album.name.localeCompare(b.album.name));
    default:
      return sorted;
  }
}

export default function SongsContent({ songs, query }: Props) {
  const { currentSong, isPlaying, addToQueue } = usePlayerStore();
  const [sortOption, setSortOption] = useState('Ascending');
  const [showSort, setShowSort] = useState(false);
  const [allSongs, setAllSongs] = useState<Song[]>(songs);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [menuSong, setMenuSong] = useState<Song | null>(null);

  const sortedSongs = sortSongs(allSongs, sortOption);

  async function handleLoadMore() {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const data = await searchSongs(query, page + 1);
      setAllSongs(prev => [...prev, ...data.results]);
      setPage(p => p + 1);
    } catch {
      // ignore
    } finally {
      setLoadingMore(false);
    }
  }

  function handlePlay(item: Song) {
    if (currentSong?.id === item.id) {
      togglePlayPause();
    } else {
      playSong(item, sortedSongs);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.count}>{allSongs.length} songs</Text>
        <TouchableOpacity style={styles.sortButton} onPress={() => setShowSort(true)}>
          <Text style={styles.sortText}>{sortOption}</Text>
          <Ionicons name="swap-vertical" size={16} color={Colors.accent} />
        </TouchableOpacity>
      </View>

      <Modal transparent visible={showSort} animationType="fade" onRequestClose={() => setShowSort(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowSort(false)}>
          <View style={styles.dropdown}>
            {SORT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={styles.sortRow}
                onPress={() => { setSortOption(opt); setShowSort(false); }}
              >
                <Text style={styles.sortOptionText}>{opt}</Text>
                <View style={[styles.radio, sortOption === opt && styles.radioActive]}>
                  {sortOption === opt && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal transparent visible={!!menuSong} animationType="slide" onRequestClose={() => setMenuSong(null)}>
        <TouchableOpacity style={styles.sheetOverlay} activeOpacity={1} onPress={() => setMenuSong(null)}>
          <View style={styles.sheet}>
            {menuSong && (
              <>
                <View style={styles.sheetSongRow}>
                  <Image
                    source={{ uri: menuSong.image?.find(i => i.quality === '150x150')?.url }}
                    style={styles.sheetImage}
                  />
                  <View style={styles.sheetSongInfo}>
                    <Text style={styles.sheetSongName} numberOfLines={1}>{menuSong.name}</Text>
                    <Text style={styles.sheetSongArtist} numberOfLines={1}>
                      {menuSong.artists.primary.map(a => a.name).join(', ')} | {formatDuration(menuSong.duration)}
                    </Text>
                  </View>
                </View>
                <View style={styles.sheetDivider} />
                {[
                  { icon: 'arrow-forward-circle-outline', label: 'Play Next', action: () => { playNext(); setMenuSong(null); } },
                  { icon: 'list-outline', label: 'Add to Playing Queue', action: () => { addToQueue(menuSong); setMenuSong(null); } },
                  { icon: 'add-circle-outline', label: 'Add to Playlist', action: () => setMenuSong(null) },
                  { icon: 'play-circle-outline', label: 'Go to Album', action: () => setMenuSong(null) },
                  { icon: 'person-outline', label: 'Go to Artist', action: () => setMenuSong(null) },
                  { icon: 'information-circle-outline', label: 'Details', action: () => setMenuSong(null) },
                  { icon: 'call-outline', label: 'Set as Ringtone', action: () => setMenuSong(null) },
                  { icon: 'close-circle-outline', label: 'Add to Blacklist', action: () => setMenuSong(null) },
                  { icon: 'paper-plane-outline', label: 'Share', action: () => setMenuSong(null) },
                ].map(({ icon, label, action }) => (
                  <TouchableOpacity key={label} style={styles.sheetOption} onPress={action}>
                    <Ionicons name={icon as any} size={22} color={Colors.light.text} />
                    <Text style={styles.sheetOptionText}>{label}</Text>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      <FlatList
        data={sortedSongs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 160 }}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        ListFooterComponent={loadingMore ? <ActivityIndicator color={Colors.accent} style={{ padding: 16 }} /> : null}
        renderItem={({ item }) => {
          const imageUrl = item.image?.find(i => i.quality === '150x150')?.url;
          const artists = item.artists.primary.map((a) => a.name).join(', ');
          const duration = formatDuration(item.duration);
          const isActive = currentSong?.id === item.id;
          return (
            <View style={styles.row}>
              <Image source={{ uri: imageUrl }} style={styles.image} />
              <View style={styles.info}>
                <Text style={[styles.name, isActive && styles.activeName]} numberOfLines={1}>{item.name}</Text>
                <View style={styles.metaRow}>
                  <Text style={styles.metaArtist} numberOfLines={1}>{artists}</Text>
                  <Text style={styles.metaDuration}> | {duration}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => handlePlay(item)}>
                <Ionicons
                  name={isActive && isPlaying ? 'pause-circle' : 'play-circle'}
                  size={36}
                  color={Colors.accent}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setMenuSong(item)}>
                <Ionicons name="ellipsis-vertical" size={20} color={Colors.light.subtext} />
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  count: { fontSize: 16, fontWeight: '700', color: Colors.light.text },
  activeName: { color: Colors.accent },
  sortButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sortText: { fontSize: 14, fontWeight: '600', color: Colors.accent },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, gap: 12 },
  image: { width: 60, height: 60, borderRadius: 8, backgroundColor: Colors.light.card },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: Colors.light.text, marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
  metaArtist: { flexShrink: 1, fontSize: 13, color: Colors.light.subtext },
  metaDuration: { fontSize: 13, color: Colors.light.subtext, flexShrink: 0 },
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-start', alignItems: 'flex-end',
    paddingTop: 120, paddingRight: 20,
  },
  dropdown: {
    backgroundColor: Colors.light.background, borderRadius: 12,
    paddingVertical: 8, minWidth: 200,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 8,
  },
  sortRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.light.border,
  },
  sortOptionText: { fontSize: 15, color: Colors.light.text },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: Colors.accent, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: Colors.accent },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.accent },
  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: Colors.light.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 20, paddingBottom: 40, paddingHorizontal: 20 },
  sheetSongRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  sheetImage: { width: 56, height: 56, borderRadius: 8, backgroundColor: Colors.light.card },
  sheetSongInfo: { flex: 1 },
  sheetSongName: { fontSize: 15, fontWeight: '700', color: Colors.light.text, marginBottom: 4 },
  sheetSongArtist: { fontSize: 13, color: Colors.light.subtext },
  sheetDivider: { height: 1, backgroundColor: Colors.light.border, marginBottom: 8 },
  sheetOption: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 14 },
  sheetOptionText: { fontSize: 15, color: Colors.light.text },
});
