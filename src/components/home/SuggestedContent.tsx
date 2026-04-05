import { useMemo } from 'react';
import { ScrollView, View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../../constants/theme';
import { useColors } from '../../hooks/useColors';
import { Song } from '../../services/api';
import { playSong } from '../../services/audioService';

type Artist = { id: string; name: string; imageUrl: string };

function extractArtists(songs: Song[]): Artist[] {
  const seen = new Set<string>();
  const artists: Artist[] = [];
  for (const song of songs) {
    for (const a of song.artists.primary) {
      if (!seen.has(a.id)) {
        seen.add(a.id);
        const imageUrl = (a as any).image?.find((i: any) => i.quality === '150x150')?.url ?? '';
        artists.push({ id: a.id, name: a.name, imageUrl });
      }
    }
  }
  return artists.slice(0, 10);
}

type Props = { recentlyPlayed: Song[]; mostPlayed: Song[] };

export default function SuggestedContent({ recentlyPlayed, mostPlayed }: Props) {
  const C = useColors();
  const artists = extractArtists([...recentlyPlayed, ...mostPlayed]);

  const styles = useMemo(() => StyleSheet.create({
    container: { paddingBottom: 160 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 24, marginBottom: 12 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: C.text },
    seeAll: { fontSize: 14, fontWeight: '600', color: Colors.accent },
    row: { paddingHorizontal: 20, gap: 16 },
    songCard: { width: 140 },
    songImage: { width: 140, height: 140, borderRadius: 12, backgroundColor: C.card, marginBottom: 8 },
    songName: { fontSize: 13, fontWeight: '600', color: C.text },
    songArtist: { fontSize: 12, color: C.subtext, marginTop: 2 },
    artistCard: { width: 140, alignItems: 'center' },
    artistImage: { width: 140, height: 140, borderRadius: 70, backgroundColor: C.card, marginBottom: 8 },
    artistName: { fontSize: 13, fontWeight: '600', color: C.text, textAlign: 'center' },
  }), [C]);

  function SectionHeader({ title }: { title: string }) {
    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity><Text style={styles.seeAll}>See All</Text></TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      <SectionHeader title="Recently Played" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {recentlyPlayed.map((song) => {
          const imageUrl = song.image?.find(i => i.quality === '150x150')?.url;
          return (
            <TouchableOpacity key={song.id} style={styles.songCard} onPress={() => playSong(song)}>
              <Image source={{ uri: imageUrl }} style={styles.songImage} />
              <Text style={styles.songName} numberOfLines={1}>{song.name}</Text>
              <Text style={styles.songArtist} numberOfLines={1}>{song.artists.primary.map(a => a.name).join(', ')}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <SectionHeader title="Artists" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {artists.map((artist) => (
          <TouchableOpacity key={artist.id} style={styles.artistCard}>
            <Image source={{ uri: artist.imageUrl }} style={styles.artistImage} />
            <Text style={styles.artistName} numberOfLines={1}>{artist.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <SectionHeader title="Most Played" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {mostPlayed.map((song) => {
          const imageUrl = song.image?.find(i => i.quality === '150x150')?.url;
          return (
            <TouchableOpacity key={song.id} style={styles.songCard} onPress={() => playSong(song)}>
              <Image source={{ uri: imageUrl }} style={styles.songImage} />
              <Text style={styles.songName} numberOfLines={1}>{song.name}</Text>
              <Text style={styles.songArtist} numberOfLines={1}>{song.artists.primary.map(a => a.name).join(', ')}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </ScrollView>
  );
}
