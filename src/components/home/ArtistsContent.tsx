import { useState, useMemo } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/theme';
import { useColors } from '../../hooks/useColors';
import { getDownloadedSongs } from '../../storage/storage';
import { playSong, playNext } from '../../services/audioService';
import { usePlayerStore } from '../../store/playerStore';
import { Song } from '../../services/api';

type ArtistEntry = { id: string; name: string; imageUrl: string; albumCount: number; songCount: number; songs: Song[] };
type SortOption = 'Ascending' | 'Descending' | 'Songs' | 'Albums';
const SORT_OPTIONS: SortOption[] = ['Ascending', 'Descending', 'Songs', 'Albums'];

function extractArtists(songs: Song[]): ArtistEntry[] {
  const map = new Map<string, ArtistEntry>();
  const albumsByArtist = new Map<string, Set<string>>();
  for (const song of songs) {
    for (const a of song.artists.primary) {
      const imageUrl = (a as any).image?.find((i: any) => i.quality === '150x150')?.url ?? '';
      if (!map.has(a.id)) { map.set(a.id, { id: a.id, name: a.name, imageUrl, albumCount: 0, songCount: 0, songs: [] }); albumsByArtist.set(a.id, new Set()); }
      map.get(a.id)!.songCount += 1;
      map.get(a.id)!.songs.push(song);
      albumsByArtist.get(a.id)!.add(song.album.id);
    }
  }
  for (const [id, albums] of albumsByArtist) map.get(id)!.albumCount = albums.size;
  return Array.from(map.values());
}

function sortArtists(artists: ArtistEntry[], sort: SortOption): ArtistEntry[] {
  const s = [...artists];
  switch (sort) {
    case 'Ascending': return s.sort((a, b) => a.name.localeCompare(b.name));
    case 'Descending': return s.sort((a, b) => b.name.localeCompare(a.name));
    case 'Songs': return s.sort((a, b) => b.songCount - a.songCount);
    case 'Albums': return s.sort((a, b) => b.albumCount - a.albumCount);
  }
}

export default function ArtistsContent({ navigation }: any) {
  const { addToQueue } = usePlayerStore();
  const C = useColors();
  const songs: Song[] = getDownloadedSongs();
  const artists = extractArtists(songs);
  const [menuArtist, setMenuArtist] = useState<ArtistEntry | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('Ascending');
  const [showSort, setShowSort] = useState(false);

  const sorted = useMemo(() => sortArtists(artists, sortBy), [artists, sortBy]);

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
    row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, gap: 12 },
    avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: C.card },
    info: { flex: 1 },
    name: { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 3 },
    meta: { fontSize: 13, color: C.subtext },
    sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    sheet: { backgroundColor: C.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 20, paddingBottom: 40, paddingHorizontal: 20 },
    sheetHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
    sheetAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: C.card },
    sheetInfo: { flex: 1 },
    sheetName: { fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 4 },
    sheetMeta: { fontSize: 13, color: C.subtext },
    sheetDivider: { height: 1, backgroundColor: C.border, marginBottom: 8 },
    sheetOption: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 14 },
    sheetOptionText: { fontSize: 15, color: C.text },
  }), [C]);

  if (artists.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="person-outline" size={64} color={C.border} />
        <Text style={styles.emptyText}>No artists yet</Text>
        <Text style={styles.emptySubtext}>Download songs to see artists here</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.count}>{artists.length} artists</Text>
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
        contentContainerStyle={{ paddingBottom: 160 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => navigation?.navigate('Artist', { artistId: item.id, artistName: item.name, artistImage: item.imageUrl })}>
            <Image source={item.imageUrl ? { uri: item.imageUrl } : undefined} style={styles.avatar} />
            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.meta}>{item.albumCount} {item.albumCount === 1 ? 'Album' : 'Albums'}  |  {item.songCount} Songs</Text>
            </View>
            <TouchableOpacity onPress={() => setMenuArtist(item)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="ellipsis-vertical" size={20} color={C.subtext} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />

      <Modal transparent visible={!!menuArtist} animationType="slide" onRequestClose={() => setMenuArtist(null)}>
        <TouchableOpacity style={styles.sheetOverlay} activeOpacity={1} onPress={() => setMenuArtist(null)}>
          <View style={styles.sheet}>
            {menuArtist && (
              <>
                <View style={styles.sheetHeader}>
                  <Image source={menuArtist.imageUrl ? { uri: menuArtist.imageUrl } : undefined} style={styles.sheetAvatar} />
                  <View style={styles.sheetInfo}>
                    <Text style={styles.sheetName}>{menuArtist.name}</Text>
                    <Text style={styles.sheetMeta}>{menuArtist.albumCount} {menuArtist.albumCount === 1 ? 'Album' : 'Albums'}  |  {menuArtist.songCount} Songs</Text>
                  </View>
                </View>
                <View style={styles.sheetDivider} />
                {[
                  { icon: 'play-circle-outline', label: 'Play', action: () => { if (menuArtist.songs[0]) playSong(menuArtist.songs[0], menuArtist.songs); setMenuArtist(null); } },
                  { icon: 'arrow-forward-circle-outline', label: 'Play Next', action: () => { playNext(); setMenuArtist(null); } },
                  { icon: 'list-outline', label: 'Add to Playing Queue', action: () => { menuArtist.songs.forEach(s => addToQueue(s)); setMenuArtist(null); } },
                  { icon: 'add-circle-outline', label: 'Add to Playlist', action: () => setMenuArtist(null) },
                  { icon: 'paper-plane-outline', label: 'Share', action: () => setMenuArtist(null) },
                ].map(({ icon, label, action }) => (
                  <TouchableOpacity key={label} style={styles.sheetOption} onPress={action}>
                    <Ionicons name={icon as any} size={22} color={C.text} />
                    <Text style={styles.sheetOptionText}>{label}</Text>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
