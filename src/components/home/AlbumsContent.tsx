import { useMemo, useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/theme';
import { useColors } from '../../hooks/useColors';
import { getDownloadedSongs, getAlbumMeta, saveAlbumMeta } from '../../storage/storage';
import { getAlbum, Song } from '../../services/api';

type SortOption = 'Ascending' | 'Descending' | 'Artist' | 'Date Modified';
const SORT_OPTIONS: SortOption[] = ['Ascending', 'Descending', 'Artist', 'Date Modified'];

type AlbumEntry = { id: string; name: string; artist: string; imageUrl: string; localCount: number };

function extractAlbums(songs: Song[]): AlbumEntry[] {
  const map = new Map<string, AlbumEntry>();
  for (const song of songs) {
    const { id, name } = song.album;
    const artist = song.artists.primary[0]?.name ?? '';
    const imageUrl = song.image?.find(i => i.quality === '150x150')?.url ?? '';
    if (!map.has(id)) map.set(id, { id, name, artist, imageUrl, localCount: 0 });
    map.get(id)!.localCount += 1;
  }
  return Array.from(map.values());
}

function sortAlbums(albums: AlbumEntry[], sort: SortOption): AlbumEntry[] {
  const s = [...albums];
  switch (sort) {
    case 'Ascending': return s.sort((a, b) => a.name.localeCompare(b.name));
    case 'Descending': return s.sort((a, b) => b.name.localeCompare(a.name));
    case 'Artist': return s.sort((a, b) => a.artist.localeCompare(b.artist));
    default: return s;
  }
}

export default function AlbumsContent({ navigation }: any) {
  const C = useColors();
  const songs: Song[] = getDownloadedSongs();
  const albums = extractAlbums(songs);
  const [sortBy, setSortBy] = useState<SortOption>('Ascending');
  const [showSort, setShowSort] = useState(false);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const missing = albums.filter(a => !getAlbumMeta(a.id));
    if (missing.length === 0) return;
    Promise.all(missing.map(a => getAlbum(a.id).then(data => {
      if (data) saveAlbumMeta(a.id, { year: data.year, songCount: data.songs?.length ?? 0 });
    }))).then(() => forceUpdate(n => n + 1));
  }, []);

  const sorted = useMemo(() => sortAlbums(albums, sortBy), [albums, sortBy]);

  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1 },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
    count: { fontSize: 16, fontWeight: '700', color: C.text },
    sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    sortLabel: { fontSize: 14, fontWeight: '600', color: Colors.accent },
    sortOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 },
    sortPanel: { position: 'absolute', top: 48, right: 20, backgroundColor: C.background, borderRadius: 12, paddingVertical: 8, paddingHorizontal: 16, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 8, minWidth: 180 },
    sortOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, gap: 24 },
    sortOptionText: { fontSize: 15, color: C.text },
    sortOptionActive: { color: Colors.accent, fontWeight: '600' },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 32 },
    emptyText: { fontSize: 18, fontWeight: '600', color: C.text },
    emptySubtext: { fontSize: 14, color: C.subtext, textAlign: 'center' },
    columnWrapper: { gap: 16, marginBottom: 16 },
    card: { flex: 1 },
    artwork: { width: '100%', aspectRatio: 1, borderRadius: 12, backgroundColor: C.card, marginBottom: 8 },
    nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
    albumName: { flex: 1, fontSize: 13, fontWeight: '700', color: C.text },
    albumMeta: { fontSize: 12, color: C.subtext, marginBottom: 2 },
    albumSongs: { fontSize: 12, color: C.subtext },
  }), [C]);

  if (albums.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="disc-outline" size={64} color={C.border} />
        <Text style={styles.emptyText}>No albums yet</Text>
        <Text style={styles.emptySubtext}>Download songs to see albums here</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.count}>{albums.length} albums</Text>
        <TouchableOpacity style={styles.sortBtn} onPress={() => setShowSort(v => !v)}>
          <Text style={styles.sortLabel}>{sortBy}</Text>
          <Ionicons name="swap-vertical" size={16} color={Colors.accent} />
        </TouchableOpacity>
      </View>

      {showSort && (
        <TouchableOpacity style={styles.sortOverlay} activeOpacity={1} onPress={() => setShowSort(false)}>
          <View style={styles.sortPanel}>
            {SORT_OPTIONS.map(opt => (
              <TouchableOpacity key={opt} style={styles.sortOption} onPress={() => { setSortBy(opt); setShowSort(false); }}>
                <Text style={[styles.sortOptionText, sortBy === opt && styles.sortOptionActive]}>{opt}</Text>
                <Ionicons name={sortBy === opt ? 'radio-button-on' : 'radio-button-off'} size={20} color={sortBy === opt ? Colors.accent : C.border} />
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      )}

      <FlatList
        data={sorted}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 160 }}
        renderItem={({ item }) => {
          const meta = getAlbumMeta(item.id);
          const songCount = meta?.songCount ?? item.localCount;
          const year = meta?.year;
          return (
            <TouchableOpacity style={styles.card} onPress={() => navigation?.navigate('Album', { albumId: item.id })}>
              <Image source={{ uri: item.imageUrl }} style={styles.artwork} />
              <View style={styles.nameRow}>
                <Text style={styles.albumName} numberOfLines={1}>{item.name}</Text>
                <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="ellipsis-vertical" size={18} color={C.subtext} />
                </TouchableOpacity>
              </View>
              <Text style={styles.albumMeta} numberOfLines={1}>{item.artist}{year ? `  |  ${year}` : ''}</Text>
              <Text style={styles.albumSongs}>{songCount} songs</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}
