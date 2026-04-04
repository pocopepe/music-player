import { ScrollView, View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../../constants/theme';

type Song = {
  id: string;
  name: string;
  primaryArtists: string;
  image: string;
};

type Artist = {
  id: string;
  name: string;
  image: string;
};

type SectionProps = {
  title: string;
  onSeeAll: () => void;
};

function SectionHeader({ title, onSeeAll }: SectionProps) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <TouchableOpacity onPress={onSeeAll}>
        <Text style={styles.seeAll}>See All</Text>
      </TouchableOpacity>
    </View>
  );
}

function SongCard({ song }: { song: Song }) {
  return (
    <TouchableOpacity style={styles.songCard}>
      <Image source={{ uri: song.image }} style={styles.songImage} />
      <Text style={styles.songName} numberOfLines={1}>{song.name}</Text>
      <Text style={styles.songArtist} numberOfLines={1}>{song.primaryArtists}</Text>
    </TouchableOpacity>
  );
}

function ArtistCard({ artist }: { artist: Artist }) {
  return (
    <TouchableOpacity style={styles.artistCard}>
      <Image source={{ uri: artist.image }} style={styles.artistImage} />
      <Text style={styles.artistName} numberOfLines={1}>{artist.name}</Text>
    </TouchableOpacity>
  );
}

type Props = {
  recentlyPlayed: Song[];
  artists: Artist[];
  mostPlayed: Song[];
};

export default function SuggestedContent({ recentlyPlayed, artists, mostPlayed }: Props) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      <SectionHeader title="Recently Played" onSeeAll={() => {}} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {recentlyPlayed.map((song) => (
          <SongCard key={song.id} song={song} />
        ))}
      </ScrollView>

      <SectionHeader title="Artists" onSeeAll={() => {}} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {artists.map((artist) => (
          <ArtistCard key={artist.id} artist={artist} />
        ))}
      </ScrollView>

      <SectionHeader title="Most Played" onSeeAll={() => {}} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {mostPlayed.map((song) => (
          <SongCard key={song.id} song={song} />
        ))}
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.accent,
  },
  row: {
    paddingHorizontal: 20,
    gap: 16,
  },
  songCard: {
    width: 140,
  },
  songImage: {
    width: 140,
    height: 140,
    borderRadius: 12,
    backgroundColor: Colors.light.card,
    marginBottom: 8,
  },
  songName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.text,
  },
  songArtist: {
    fontSize: 12,
    color: Colors.light.subtext,
    marginTop: 2,
  },
  artistCard: {
    width: 100,
    alignItems: 'center',
  },
  artistImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.light.card,
    marginBottom: 8,
  },
  artistName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.text,
    textAlign: 'center',
  },
});
