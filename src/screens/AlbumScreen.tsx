import { useEffect, useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, FlatList,
  StyleSheet, ActivityIndicator, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/theme';
import { getAlbum, Song } from '../services/api';
import { playSong, togglePlayPause, playNext } from '../services/audioService';
import { downloadSong } from '../services/downloadService';
import { usePlayerStore } from '../store/playerStore';
import { useDownloadStore } from '../store/downloadStore';
import { isSongLiked, toggleLikedSong, saveDownloadedSong, removeDownloadedSong } from '../storage/storage';
import { deleteSong } from '../services/downloadService';

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function totalDuration(songs: Song[]): string {
  const total = songs.reduce((acc, s) => acc + s.duration, 0);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
}

export default function AlbumScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { albumId } = route.params;
  const { currentSong, isPlaying, addToQueue } = usePlayerStore();
  const { downloadedIds, refresh } = useDownloadStore();

  const [album, setAlbum] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [menuSong, setMenuSong] = useState<Song | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    getAlbum(albumId).then(data => { setAlbum(data); setLoading(false); });
  }, [albumId]);

  useEffect(() => {
    if (menuSong) setIsLiked(isSongLiked(menuSong.id));
  }, [menuSong]);

  const songs: Song[] = album?.songs ?? [];
  const artists = album?.artists?.primary?.map((a: any) => a.name).join(', ') ?? '';
  const imageUrl = album?.image?.find((i: any) => i.quality === '500x500')?.url
    ?? album?.image?.find((i: any) => i.quality === '150x150')?.url;

  async function handleDownloadAlbum() {
    if (!songs.length || downloading) return;
    setDownloading(true);
    for (const song of songs) {
      if (!downloadedIds.has(song.id)) {
        try {
          const path = await downloadSong(song);
          saveDownloadedSong({ ...song, localPath: path });
          refresh();
        } catch { /* skip failed */ }
      }
    }
    setDownloading(false);
  }

  async function handleDownloadSong() {
    if (!menuSong) return;
    const song = menuSong;
    setMenuSong(null);
    try {
      const path = await downloadSong(song);
      saveDownloadedSong({ ...song, localPath: path });
      refresh();
    } catch (e) {
      console.log('[album] download error:', e);
    }
  }

  async function handleDeleteSong() {
    if (!menuSong) return;
    const song = menuSong;
    setMenuSong(null);
    await deleteSong(song.id);
    removeDownloadedSong(song.id);
    refresh();
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDownloadAlbum} disabled={downloading}>
          {downloading
            ? <ActivityIndicator size="small" color={Colors.accent} />
            : <Ionicons name="ellipsis-horizontal" size={24} color={Colors.light.text} />
          }
        </TouchableOpacity>
      </View>

      <FlatList
        data={songs}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 160 }}
        ListHeaderComponent={
          <View style={styles.albumHeader}>
            <Image source={{ uri: imageUrl }} style={styles.artwork} />
            <Text style={styles.albumName}>{album?.name}</Text>
            <Text style={styles.albumMeta}>{artists}  |  {songs.length} Songs  |  {totalDuration(songs)} mins</Text>
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.shuffleBtn}
                onPress={() => {
                  const shuffled = [...songs].sort(() => Math.random() - 0.5);
                  if (shuffled[0]) playSong(shuffled[0], shuffled);
                }}
              >
                <Ionicons name="shuffle" size={20} color="#fff" />
                <Text style={styles.shuffleText}>Shuffle</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.playBtn}
                onPress={() => { if (songs[0]) playSong(songs[0], songs); }}
              >
                <Ionicons name="play" size={20} color={Colors.accent} />
                <Text style={styles.playText}>Play</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.songsLabel}>Songs</Text>
          </View>
        }
        renderItem={({ item }) => {
          const imgUrl = item.image?.find(i => i.quality === '150x150')?.url;
          const isActive = currentSong?.id === item.id;
          return (
            <View style={styles.row}>
              <Image source={{ uri: imgUrl }} style={styles.songImage} />
              <View style={styles.info}>
                <Text style={[styles.songName, isActive && styles.activeName]} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.songArtist} numberOfLines={1}>
                  {item.artists.primary.map(a => a.name).join(', ')}
                </Text>
              </View>
              <TouchableOpacity onPress={() => {
                if (currentSong?.id === item.id) togglePlayPause();
                else playSong(item);
              }}>
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
                  <TouchableOpacity onPress={() => { setIsLiked(toggleLikedSong(menuSong)); }}>
                    <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={24} color={isLiked ? Colors.accent : Colors.light.subtext} />
                  </TouchableOpacity>
                </View>
                <View style={styles.sheetDivider} />
                {[
                  { icon: 'arrow-forward-circle-outline', label: 'Play Next', action: () => { playNext(); setMenuSong(null); } },
                  { icon: 'list-outline', label: 'Add to Playing Queue', action: () => { addToQueue(menuSong); setMenuSong(null); } },
                  { icon: 'add-circle-outline', label: 'Add to Playlist', action: () => setMenuSong(null) },
                  { icon: 'person-outline', label: 'Go to Artist', action: () => setMenuSong(null) },
                  { icon: 'information-circle-outline', label: 'Details', action: () => setMenuSong(null) },
                  { icon: 'call-outline', label: 'Set as Ringtone', action: () => setMenuSong(null) },
                  { icon: 'close-circle-outline', label: 'Add to Blacklist', action: () => setMenuSong(null) },
                  { icon: 'paper-plane-outline', label: 'Share', action: () => setMenuSong(null) },
                  menuSong && downloadedIds.has(menuSong.id)
                    ? { icon: 'trash-outline', label: 'Delete from Device', action: handleDeleteSong }
                    : { icon: 'download-outline', label: 'Download to Device', action: handleDownloadSong },
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
  container: { flex: 1, backgroundColor: Colors.light.background },
  centered: { alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 },
  albumHeader: { alignItems: 'center', paddingHorizontal: 20, paddingBottom: 8 },
  artwork: { width: 220, height: 220, borderRadius: 16, backgroundColor: Colors.light.card, marginBottom: 20 },
  albumName: { fontSize: 22, fontWeight: '700', color: Colors.light.text, textAlign: 'center', marginBottom: 8 },
  albumMeta: { fontSize: 14, color: Colors.light.subtext, textAlign: 'center', marginBottom: 24 },
  actions: { flexDirection: 'row', gap: 16, marginBottom: 28, width: '100%' },
  shuffleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.accent, borderRadius: 50, paddingVertical: 14 },
  shuffleText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  playBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#FFF3E8', borderRadius: 50, paddingVertical: 14 },
  playText: { fontSize: 16, fontWeight: '600', color: Colors.accent },
  songsLabel: { alignSelf: 'flex-start', fontSize: 18, fontWeight: '700', color: Colors.light.text, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, gap: 12 },
  songImage: { width: 52, height: 52, borderRadius: 8, backgroundColor: Colors.light.card },
  info: { flex: 1 },
  songName: { fontSize: 15, fontWeight: '600', color: Colors.light.text, marginBottom: 3 },
  activeName: { color: Colors.accent },
  songArtist: { fontSize: 13, color: Colors.light.subtext },
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
