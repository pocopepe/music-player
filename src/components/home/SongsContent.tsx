import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/theme';
import { Song } from '../../services/api';

type Props = {
  songs: Song[];
};

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')} mins`;
}

export default function SongsContent({ songs }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.count}>{songs.length} songs</Text>
        <TouchableOpacity style={styles.sortButton}>
          <Text style={styles.sortText}>Ascending</Text>
          <Ionicons name="swap-vertical" size={16} color={Colors.accent} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={songs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const imageUrl = item.image?.find(i => i.quality === '150x150')?.url;
          const artists = item.artists.primary.map((a) => a.name).join(', ');
          const duration = formatDuration(item.duration);
          return (
            <View style={styles.row}>
              <Image source={{ uri: imageUrl }} style={styles.image} />
              <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.meta} numberOfLines={1}>
                  {artists}
                  <Text style={styles.pipe}> | </Text>
                  {duration}
                </Text>
              </View>
              <TouchableOpacity>
                <Ionicons name="play-circle" size={36} color={Colors.accent} />
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
  meta: {
    fontSize: 13,
    color: Colors.light.subtext,
  },
  pipe: {
    color: Colors.light.subtext,
  },
});
