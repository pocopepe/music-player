import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/theme';
import { getDownloadedSongs } from '../../storage/storage';
import { Song } from '../../services/api';

type AlbumEntry = {
  id: string;
  name: string;
  artist: string;
  imageUrl: string;
  songCount: number;
};

function extractAlbums(songs: Song[]): AlbumEntry[] {
  const map = new Map<string, AlbumEntry>();
  for (const song of songs) {
    const { id, name } = song.album;
    const artist = song.artists.primary[0]?.name ?? '';
    const imageUrl = song.image?.find(i => i.quality === '150x150')?.url ?? '';
    if (!map.has(id)) {
      map.set(id, { id, name, artist, imageUrl, songCount: 0 });
    }
    map.get(id)!.songCount += 1;
  }
  return Array.from(map.values());
}

export default function AlbumsContent({ navigation }: any) {
  const songs: Song[] = getDownloadedSongs();
  const albums = extractAlbums(songs);

  if (albums.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="disc-outline" size={64} color={Colors.light.border} />
        <Text style={styles.emptyText}>No albums yet</Text>
        <Text style={styles.emptySubtext}>Download songs to see albums here</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.count}>{albums.length} albums</Text>
      </View>
      <FlatList
        data={albums}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 160 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation?.navigate('Album', { albumId: item.id })}
          >
            <Image source={{ uri: item.imageUrl }} style={styles.artwork} />
            <View style={styles.cardInfo}>
              <Text style={styles.albumName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.albumMeta} numberOfLines={1}>{item.artist}  |  {item.songCount} songs</Text>
            </View>
            <TouchableOpacity style={styles.dots}>
              <Ionicons name="ellipsis-vertical" size={18} color={Colors.light.subtext} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
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
  columnWrapper: { gap: 16, marginBottom: 16 },
  card: { flex: 1 },
  artwork: { width: '100%', aspectRatio: 1, borderRadius: 12, backgroundColor: Colors.light.card, marginBottom: 8 },
  cardInfo: { flex: 1 },
  albumName: { fontSize: 13, fontWeight: '700', color: Colors.light.text, marginBottom: 2 },
  albumMeta: { fontSize: 12, color: Colors.light.subtext },
  dots: { position: 'absolute', top: 4, right: 4 },
});
