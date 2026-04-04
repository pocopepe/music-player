import { useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/theme';
import { Song } from '../../services/api';
import { playSong, togglePlayPause } from '../../services/audioService';
import { usePlayerStore } from '../../store/playerStore';

const SORT_OPTIONS = ['Ascending', 'Descending', 'Artist', 'Album', 'Year', 'Date Added', 'Date Modified', 'Composer'];

type Props = {
  songs: Song[];
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

export default function SongsContent({ songs }: Props) {
  const { currentSong, isPlaying } = usePlayerStore();
  const [sortOption, setSortOption] = useState('Ascending');
  const [showSort, setShowSort] = useState(false);

  const sortedSongs = sortSongs(songs, sortOption);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.count}>{songs.length} songs</Text>
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

      <FlatList
        data={sortedSongs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 160 }}
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
              <TouchableOpacity onPress={() => isActive ? togglePlayPause() : playSong(item)}>
                <Ionicons
                  name={isActive && isPlaying ? 'pause-circle' : 'play-circle'}
                  size={36}
                  color={Colors.accent}
                />
              </TouchableOpacity>
              <TouchableOpacity>
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
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  count: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
  },
  activeName: {
    color: Colors.accent,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.accent,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 12,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: Colors.light.card,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  metaArtist: {
    flexShrink: 1,
    fontSize: 13,
    color: Colors.light.subtext,
  },
  metaDuration: {
    fontSize: 13,
    color: Colors.light.subtext,
    flexShrink: 0,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 120,
    paddingRight: 20,
  },
  dropdown: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  sortRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  sortOptionText: {
    fontSize: 15,
    color: Colors.light.text,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: Colors.accent,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.accent,
  },
});
