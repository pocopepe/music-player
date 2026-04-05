import { useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/theme';
import { getDownloadedSongs } from '../../storage/storage';
import { playSong, playNext } from '../../services/audioService';
import { usePlayerStore } from '../../store/playerStore';
import { Song } from '../../services/api';

type ArtistEntry = {
  id: string;
  name: string;
  imageUrl: string;
  albumCount: number;
  songCount: number;
  songs: Song[];
};

function extractArtists(songs: Song[]): ArtistEntry[] {
  const map = new Map<string, ArtistEntry>();
  const albumsByArtist = new Map<string, Set<string>>();

  for (const song of songs) {
    for (const a of song.artists.primary) {
      const imageUrl = (a as any).image?.find((i: any) => i.quality === '150x150')?.url ?? '';
      if (!map.has(a.id)) {
        map.set(a.id, { id: a.id, name: a.name, imageUrl, albumCount: 0, songCount: 0, songs: [] });
        albumsByArtist.set(a.id, new Set());
      }
      const entry = map.get(a.id)!;
      entry.songCount += 1;
      entry.songs.push(song);
      albumsByArtist.get(a.id)!.add(song.album.id);
    }
  }

  for (const [id, albums] of albumsByArtist) {
    map.get(id)!.albumCount = albums.size;
  }

  return Array.from(map.values());
}

export default function ArtistsContent({ navigation }: any) {
  const { addToQueue } = usePlayerStore();
  const songs: Song[] = getDownloadedSongs();
  const artists = extractArtists(songs);
  const [menuArtist, setMenuArtist] = useState<ArtistEntry | null>(null);

  if (artists.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="person-outline" size={64} color={Colors.light.border} />
        <Text style={styles.emptyText}>No artists yet</Text>
        <Text style={styles.emptySubtext}>Download songs to see artists here</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.count}>{artists.length} artists</Text>
      </View>
      <FlatList
        data={artists}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 160 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation?.navigate('Artist', { artistId: item.id, artistName: item.name, artistImage: item.imageUrl })}
          >
            <Image source={item.imageUrl ? { uri: item.imageUrl } : undefined} style={styles.avatar} />
            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.meta}>
                {item.albumCount} {item.albumCount === 1 ? 'Album' : 'Albums'}  |  {item.songCount} Songs
              </Text>
            </View>
            <TouchableOpacity onPress={() => setMenuArtist(item)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="ellipsis-vertical" size={20} color={Colors.light.subtext} />
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
                    <Text style={styles.sheetMeta}>
                      {menuArtist.albumCount} {menuArtist.albumCount === 1 ? 'Album' : 'Albums'}  |  {menuArtist.songCount} Songs
                    </Text>
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
                    <Ionicons name={icon as any} size={22} color={Colors.light.text} />
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: { paddingHorizontal: 20, paddingVertical: 14 },
  count: { fontSize: 16, fontWeight: '700', color: Colors.light.text },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 32 },
  emptyText: { fontSize: 18, fontWeight: '600', color: Colors.light.text },
  emptySubtext: { fontSize: 14, color: Colors.light.subtext, textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, gap: 12 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: Colors.light.card },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: Colors.light.text, marginBottom: 3 },
  meta: { fontSize: 13, color: Colors.light.subtext },
  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: Colors.light.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 20, paddingBottom: 40, paddingHorizontal: 20 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  sheetAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.light.card },
  sheetInfo: { flex: 1 },
  sheetName: { fontSize: 16, fontWeight: '700', color: Colors.light.text, marginBottom: 4 },
  sheetMeta: { fontSize: 13, color: Colors.light.subtext },
  sheetDivider: { height: 1, backgroundColor: Colors.light.border, marginBottom: 8 },
  sheetOption: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 14 },
  sheetOptionText: { fontSize: 15, color: Colors.light.text },
});
