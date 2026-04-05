import { useState, useEffect, useMemo } from 'react';
import {
  View, Text, Image, TextInput, TouchableOpacity,
  FlatList, ScrollView, ActivityIndicator, StyleSheet, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/theme';
import { useColors } from '../hooks/useColors';
import { searchSongs, searchArtists, searchAlbums, Song, Artist, Album } from '../services/api';
import { playSong } from '../services/audioService';
import { downloadSong, deleteSong } from '../services/downloadService';
import {
  getRecentSearches, addRecentSearch, removeRecentSearch, clearRecentSearches,
  isSongLiked, toggleLikedSong, saveDownloadedSong, removeDownloadedSong,
} from '../storage/storage';
import { useDownloadStore } from '../store/downloadStore';

const FILTER_CHIPS = ['Songs', 'Artists', 'Albums', 'Folders'];

export default function SearchScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const C = useColors();
  const [query, setQuery] = useState('');
  const [activeChip, setActiveChip] = useState('Songs');
  const [recents, setRecents] = useState<string[]>(getRecentSearches);
  const [songResults, setSongResults] = useState<Song[]>([]);
  const [artistResults, setArtistResults] = useState<Artist[]>([]);
  const [albumResults, setAlbumResults] = useState<Album[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searched, setSearched] = useState(false);
  const [focused, setFocused] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [menuSong, setMenuSong] = useState<Song | null>(null);
  const [menuAlbum, setMenuAlbum] = useState<Album | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const { downloadedIds, refresh } = useDownloadStore();

  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: C.background },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 16, gap: 12 },
    inputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderWidth: 1.5, borderColor: C.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
    inputWrapperFocused: { backgroundColor: C.background, borderColor: Colors.accent },
    input: { flex: 1, fontSize: 15, color: C.text },
    chipsScroll: { flexGrow: 0, flexShrink: 0 },
    chipsRow: { paddingHorizontal: 16, gap: 10, paddingBottom: 16 },
    chip: { borderWidth: 1.5, borderColor: Colors.accent, borderRadius: 20, paddingHorizontal: 18, paddingVertical: 7 },
    chipActive: { backgroundColor: Colors.accent },
    chipText: { fontSize: 14, fontWeight: '500', color: Colors.accent },
    chipTextActive: { color: '#fff' },
    list: { flex: 1 },
    recentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12 },
    recentTitle: { fontSize: 16, fontWeight: '700', color: C.text },
    clearAll: { fontSize: 14, fontWeight: '600', color: Colors.accent },
    divider: { height: 1, backgroundColor: C.border, marginBottom: 4 },
    recentItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
    recentText: { fontSize: 15, color: C.subtext },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    resultItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, gap: 12, borderBottomWidth: 1, borderBottomColor: C.border },
    resultImage: { width: 56, height: 56, borderRadius: 8, backgroundColor: C.card },
    artistImage: { width: 56, height: 56, borderRadius: 28, backgroundColor: C.card },
    resultInfo: { flex: 1 },
    playButton: { padding: 4 },
    resultName: { fontSize: 15, fontWeight: '600', color: C.text },
    resultSub: { fontSize: 13, color: C.subtext, marginTop: 2 },
    notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 16 },
    notFoundEmoji: { fontSize: 120 },
    notFoundTitle: { fontSize: 24, fontWeight: '700', color: C.text, textAlign: 'center' },
    notFoundSubtext: { fontSize: 16, color: C.subtext, textAlign: 'center', lineHeight: 26 },
    sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    sheet: { backgroundColor: C.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 20, paddingBottom: 40, paddingHorizontal: 20 },
    sheetSongRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
    sheetImage: { width: 56, height: 56, borderRadius: 8, backgroundColor: C.card },
    sheetInfo: { flex: 1 },
    sheetName: { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 4 },
    sheetArtist: { fontSize: 13, color: C.subtext },
    sheetDivider: { height: 1, backgroundColor: C.border, marginBottom: 8 },
    sheetOption: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 14 },
    sheetOptionText: { fontSize: 15, color: C.text },
  }), [C]);

  useEffect(() => { if (menuSong) setIsLiked(isSongLiked(menuSong.id)); }, [menuSong]);

  async function handleDownload() {
    if (!menuSong) return;
    const song = menuSong; setMenuSong(null);
    try { const path = await downloadSong(song); saveDownloadedSong({ ...song, localPath: path }); refresh(); } catch { }
  }

  async function handleDeleteDownload() {
    if (!menuSong) return;
    const song = menuSong; setMenuSong(null);
    await deleteSong(song.id); removeDownloadedSong(song.id); refresh();
  }

  async function runSearch(q: string, chip: string, pg: number) {
    if (chip === 'Songs') { const data = await searchSongs(q, pg); setSongResults(data.results); setTotal(data.total); }
    else if (chip === 'Artists') { const data = await searchArtists(q, pg); setArtistResults(data.results); setTotal(data.total); }
    else if (chip === 'Albums') { const data = await searchAlbums(q, pg); setAlbumResults(data.results); setTotal(data.total); }
  }

  async function handleSubmit() {
    if (!query.trim()) return;
    addRecentSearch(query.trim()); setRecents(getRecentSearches()); setLoading(true); setSearched(false); setPage(1);
    try { await runSearch(query.trim(), activeChip, 1); } catch { setSongResults([]); setArtistResults([]); setAlbumResults([]); }
    finally { setLoading(false); setSearched(true); }
  }

  async function handleRecentTap(item: string) {
    setQuery(item); setLoading(true); setSearched(false); setPage(1);
    try { await runSearch(item, activeChip, 1); } catch { setSongResults([]); setArtistResults([]); setAlbumResults([]); }
    finally { setLoading(false); setSearched(true); }
  }

  async function handleChipChange(chip: string) {
    setActiveChip(chip);
    if (!query.trim() || !searched) return;
    setLoading(true); setPage(1);
    try { await runSearch(query.trim(), chip, 1); } catch { } finally { setLoading(false); }
  }

  async function handleLoadMore() {
    const currentResults = activeChip === 'Songs' ? songResults : activeChip === 'Artists' ? artistResults : albumResults;
    if (loadingMore || currentResults.length >= total) return;
    const nextPage = page + 1; setLoadingMore(true);
    try {
      if (activeChip === 'Songs') { const data = await searchSongs(query.trim(), nextPage); setSongResults(prev => [...prev, ...data.results]); }
      else if (activeChip === 'Artists') { const data = await searchArtists(query.trim(), nextPage); setArtistResults(prev => [...prev, ...data.results]); }
      else if (activeChip === 'Albums') { const data = await searchAlbums(query.trim(), nextPage); setAlbumResults(prev => [...prev, ...data.results]); }
      setPage(nextPage);
    } catch { } finally { setLoadingMore(false); }
  }

  const isTyping = query.length > 0;
  const activeResults = activeChip === 'Songs' ? songResults : activeChip === 'Artists' ? artistResults : albumResults;
  const notFound = searched && activeResults.length === 0 && activeChip !== 'Folders';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={C.text} />
        </TouchableOpacity>
        <View style={[styles.inputWrapper, focused && styles.inputWrapperFocused]}>
          <Ionicons name="search" size={18} color={focused ? Colors.accent : C.subtext} />
          <TextInput
            style={styles.input}
            placeholder="Search"
            placeholderTextColor={C.subtext}
            value={query}
            onChangeText={text => { setQuery(text); if (!text) { setSongResults([]); setArtistResults([]); setAlbumResults([]); setSearched(false); } }}
            onSubmitEditing={handleSubmit}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            returnKeyType="search"
            autoFocus
          />
          {isTyping && (
            <TouchableOpacity onPress={() => { setQuery(''); setSongResults([]); setArtistResults([]); setAlbumResults([]); setSearched(false); }}>
              <Ionicons name="close" size={18} color={C.subtext} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isTyping && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll} contentContainerStyle={styles.chipsRow}>
          {FILTER_CHIPS.map((chip) => {
            const active = chip === activeChip;
            return (
              <TouchableOpacity key={chip} onPress={() => handleChipChange(chip)} style={[styles.chip, active && styles.chipActive]}>
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{chip}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {!isTyping && recents.length > 0 && (
        <>
          <View style={styles.recentHeader}>
            <Text style={styles.recentTitle}>Recent Searches</Text>
            <TouchableOpacity onPress={() => { clearRecentSearches(); setRecents([]); }}>
              <Text style={styles.clearAll}>Clear All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.divider} />
          <FlatList
            data={recents}
            keyExtractor={item => item}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.recentItem} onPress={() => handleRecentTap(item)}>
                <Text style={styles.recentText}>{item}</Text>
                <TouchableOpacity onPress={() => { removeRecentSearch(item); setRecents(getRecentSearches()); }}>
                  <Ionicons name="close" size={18} color={C.border} />
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          />
        </>
      )}

      {loading && <View style={styles.centered}><ActivityIndicator color={Colors.accent} size="large" /></View>}

      {!loading && isTyping && activeResults.length > 0 && (
        <FlatList
          style={styles.list}
          data={activeResults as any[]}
          keyExtractor={item => item.id}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          contentContainerStyle={{ paddingBottom: 160 }}
          ListFooterComponent={loadingMore ? <ActivityIndicator color={Colors.accent} style={{ padding: 16 }} /> : null}
          renderItem={({ item }) => {
            if (activeChip === 'Songs') {
              const imageUrl = item.image?.find((i: any) => i.quality === '150x150')?.url;
              return (
                <View style={styles.resultItem}>
                  <Image source={{ uri: imageUrl }} style={styles.resultImage} />
                  <View style={styles.resultInfo}>
                    <Text style={styles.resultName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.resultSub} numberOfLines={1}>{item.artists.primary.map((a: any) => a.name).join(', ')}</Text>
                  </View>
                  <TouchableOpacity style={styles.playButton} onPress={() => playSong(item)}>
                    <Ionicons name="play-circle" size={36} color={Colors.accent} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setMenuSong(item)}>
                    <Ionicons name="ellipsis-vertical" size={20} color={C.subtext} />
                  </TouchableOpacity>
                </View>
              );
            }
            if (activeChip === 'Artists') {
              const imageUrl = item.image?.find((i: any) => i.quality === '150x150')?.url;
              return (
                <View style={styles.resultItem}>
                  <Image source={{ uri: imageUrl }} style={styles.artistImage} />
                  <View style={styles.resultInfo}>
                    <Text style={styles.resultName} numberOfLines={1}>{item.name}</Text>
                    {item.followerCount ? <Text style={styles.resultSub}>{item.followerCount.toLocaleString()} followers</Text> : null}
                  </View>
                </View>
              );
            }
            const imageUrl = item.image?.find((i: any) => i.quality === '150x150')?.url;
            const artist = item.artists?.primary?.[0]?.name ?? '';
            return (
              <TouchableOpacity style={styles.resultItem} onPress={() => navigation.navigate('Album', { albumId: item.id })}>
                <Image source={{ uri: imageUrl }} style={styles.resultImage} />
                <View style={styles.resultInfo}>
                  <Text style={styles.resultName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.resultSub} numberOfLines={1}>{artist}{item.year ? ` · ${item.year}` : ''}</Text>
                </View>
                <TouchableOpacity onPress={() => setMenuAlbum(item)}>
                  <Ionicons name="ellipsis-vertical" size={20} color={C.subtext} />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {!loading && notFound && (
        <View style={styles.notFound}>
          <Text style={styles.notFoundEmoji}>😞</Text>
          <Text style={styles.notFoundTitle}>Not Found</Text>
          <Text style={styles.notFoundSubtext}>Sorry, the keyword you entered cannot be found, please check again or search with another keyword.</Text>
        </View>
      )}

      <Modal transparent visible={!!menuSong} animationType="slide" onRequestClose={() => setMenuSong(null)}>
        <TouchableOpacity style={styles.sheetOverlay} activeOpacity={1} onPress={() => setMenuSong(null)}>
          <View style={styles.sheet}>
            {menuSong && (
              <>
                <View style={styles.sheetSongRow}>
                  <Image source={{ uri: menuSong.image?.find(i => i.quality === '150x150')?.url }} style={styles.sheetImage} />
                  <View style={styles.sheetInfo}>
                    <Text style={styles.sheetName} numberOfLines={1}>{menuSong.name}</Text>
                    <Text style={styles.sheetArtist} numberOfLines={1}>{menuSong.artists.primary.map(a => a.name).join(', ')}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setIsLiked(toggleLikedSong(menuSong))}>
                    <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={24} color={isLiked ? Colors.accent : C.subtext} />
                  </TouchableOpacity>
                </View>
                <View style={styles.sheetDivider} />
                {[
                  { icon: 'arrow-forward-circle-outline', label: 'Play Next', action: () => { playSong(menuSong); setMenuSong(null); } },
                  { icon: 'list-outline', label: 'Add to Playing Queue', action: () => setMenuSong(null) },
                  { icon: 'add-circle-outline', label: 'Add to Playlist', action: () => setMenuSong(null) },
                  { icon: 'play-circle-outline', label: 'Go to Album', action: () => setMenuSong(null) },
                  { icon: 'person-outline', label: 'Go to Artist', action: () => setMenuSong(null) },
                  { icon: 'information-circle-outline', label: 'Details', action: () => setMenuSong(null) },
                  { icon: 'call-outline', label: 'Set as Ringtone', action: () => setMenuSong(null) },
                  { icon: 'close-circle-outline', label: 'Add to Blacklist', action: () => setMenuSong(null) },
                  { icon: 'paper-plane-outline', label: 'Share', action: () => setMenuSong(null) },
                  menuSong && downloadedIds.has(menuSong.id)
                    ? { icon: 'trash-outline', label: 'Delete from Device', action: handleDeleteDownload }
                    : { icon: 'download-outline', label: 'Download to Device', action: handleDownload },
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

      <Modal transparent visible={!!menuAlbum} animationType="slide" onRequestClose={() => setMenuAlbum(null)}>
        <TouchableOpacity style={styles.sheetOverlay} activeOpacity={1} onPress={() => setMenuAlbum(null)}>
          <View style={styles.sheet}>
            {menuAlbum && (
              <>
                <View style={styles.sheetSongRow}>
                  <Image source={{ uri: menuAlbum.image?.find(i => i.quality === '150x150')?.url }} style={styles.sheetImage} />
                  <View style={styles.sheetInfo}>
                    <Text style={styles.sheetName} numberOfLines={1}>{menuAlbum.name}</Text>
                    <Text style={styles.sheetArtist} numberOfLines={1}>{menuAlbum.artists?.primary?.[0]?.name ?? ''}{menuAlbum.year ? ` · ${menuAlbum.year}` : ''}</Text>
                  </View>
                </View>
                <View style={styles.sheetDivider} />
                {[
                  { icon: 'play-circle-outline', label: 'Open Album', action: () => { navigation.navigate('Album', { albumId: menuAlbum.id }); setMenuAlbum(null); } },
                  { icon: 'download-outline', label: 'Download Album', action: () => { navigation.navigate('Album', { albumId: menuAlbum.id }); setMenuAlbum(null); } },
                  { icon: 'paper-plane-outline', label: 'Share', action: () => setMenuAlbum(null) },
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
