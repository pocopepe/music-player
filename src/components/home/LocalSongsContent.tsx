import { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/theme';
import { Song } from '../../services/api';
import { playSong, togglePlayPause, playNext } from '../../services/audioService';
import { deleteSong } from '../../services/downloadService';
import { usePlayerStore } from '../../store/playerStore';
import { getDownloadedSongs, removeDownloadedSong } from '../../storage/storage';
import { useDownloadStore } from '../../store/downloadStore';

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')} mins`;
}

export default function LocalSongsContent() {
  const { currentSong, isPlaying, addToQueue } = usePlayerStore();
  const { refresh } = useDownloadStore();
  const [songs, setSongs] = useState<Song[]>(getDownloadedSongs());
  const [menuSong, setMenuSong] = useState<Song | null>(null);

  useEffect(() => { setSongs(getDownloadedSongs()); }, []);

  function handlePlay(item: Song) {
    if (currentSong?.id === item.id) togglePlayPause();
    else playSong(item, songs);
  }

  async function handleDelete() {
    if (!menuSong) return;
    const id = menuSong.id;
    setMenuSong(null);
    await deleteSong(id);
    removeDownloadedSong(id);
    refresh();
    setSongs(getDownloadedSongs());
  }

  if (songs.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="musical-notes-outline" size={64} color={Colors.light.border} />
        <Text style={styles.emptyText}>No downloaded songs</Text>
        <Text style={styles.emptySubtext}>Download songs from Search or Favourites to play them here</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.count}>{songs.length} songs</Text>
      </View>

      <FlatList
        data={songs}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 160 }}
        renderItem={({ item }) => {
          const imageUrl = item.image?.find(i => i.quality === '150x150')?.url;
          const artists = item.artists.primary.map(a => a.name).join(', ');
          const isActive = currentSong?.id === item.id;
          return (
            <View style={styles.row}>
              <Image source={{ uri: imageUrl }} style={styles.image} />
              <View style={styles.info}>
                <Text style={[styles.name, isActive && styles.activeName]} numberOfLines={1}>{item.name}</Text>
                <View style={styles.metaRow}>
                  <Text style={styles.artist} numberOfLines={1}>{artists}</Text>
                  <Text style={styles.duration}> | {formatDuration(item.duration)}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => handlePlay(item)}>
                <Ionicons name={isActive && isPlaying ? 'pause-circle' : 'play-circle'} size={36} color={Colors.accent} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setMenuSong(item)}>
                <Ionicons name="ellipsis-vertical" size={20} color={Colors.light.subtext} />
              </TouchableOpacity>
            </View>
          );
        }}
      />

      <Modal transparent visible={!!menuSong} animationType="slide" onRequestClose={() => setMenuSong(null)}>
        <TouchableOpacity style={styles.sheetOverlay} activeOpacity={1} onPress={() => setMenuSong(null)}>
          <View style={styles.sheet}>
            {menuSong && (
              <>
                <View style={styles.sheetSongRow}>
                  <Image source={{ uri: menuSong.image?.find(i => i.quality === '150x150')?.url }} style={styles.sheetImage} />
                  <View style={styles.sheetInfo}>
                    <Text style={styles.sheetName} numberOfLines={1}>{menuSong.name}</Text>
                    <Text style={styles.sheetArtist} numberOfLines={1}>
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
                  { icon: 'trash-outline', label: 'Delete from Device', action: handleDelete },
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
  image: { width: 60, height: 60, borderRadius: 8, backgroundColor: Colors.light.card },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: Colors.light.text, marginBottom: 4 },
  activeName: { color: Colors.accent },
  metaRow: { flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
  artist: { flexShrink: 1, fontSize: 13, color: Colors.light.subtext },
  duration: { fontSize: 13, color: Colors.light.subtext, flexShrink: 0 },
  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: Colors.light.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 20, paddingBottom: 40, paddingHorizontal: 20 },
  sheetSongRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  sheetImage: { width: 56, height: 56, borderRadius: 8, backgroundColor: Colors.light.card },
  sheetInfo: { flex: 1 },
  sheetName: { fontSize: 15, fontWeight: '700', color: Colors.light.text, marginBottom: 4 },
  sheetArtist: { fontSize: 13, color: Colors.light.subtext },
  sheetDivider: { height: 1, backgroundColor: Colors.light.border, marginBottom: 8 },
  sheetOption: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 14 },
  sheetOptionText: { fontSize: 15, color: Colors.light.text },
});
