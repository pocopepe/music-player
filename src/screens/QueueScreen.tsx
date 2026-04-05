import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/theme';
import { usePlayerStore } from '../store/playerStore';
import { playSong } from '../services/audioService';

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function QueueScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { queue, currentSong, removeFromQueueAt } = usePlayerStore();
  const currentIndex = queue.findIndex(s => s.id === currentSong?.id);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.heading}>Queue</Text>
        <Text style={styles.count}>{queue.length} songs</Text>
      </View>

      {queue.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="list-outline" size={64} color={Colors.light.border} />
          <Text style={styles.emptyText}>Queue is empty</Text>
          <Text style={styles.emptySubtext}>Add songs from the three-dot menu on any song</Text>
        </View>
      ) : (
        <FlatList
          data={queue}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item, index }) => {
            const imageUrl = item.image?.find(i => i.quality === '150x150')?.url;
            const artists = item.artists.primary.map(a => a.name).join(', ');
            const isActive = currentSong?.id === item.id;
            return (
              <TouchableOpacity style={[styles.row, isActive && styles.activeRow]} onPress={() => playSong(item)}>
                <Text style={styles.index}>{isActive ? '▶' : index + 1}</Text>
                <Image source={{ uri: imageUrl }} style={styles.image} />
                <View style={styles.info}>
                  <Text style={[styles.name, isActive && styles.activeName]} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.meta} numberOfLines={1}>{artists} · {formatDuration(item.duration)}</Text>
                </View>
                {index > currentIndex && (
                  <TouchableOpacity onPress={() => removeFromQueueAt(index)} style={styles.removeBtn}>
                    <Ionicons name="close" size={20} color={Colors.light.subtext} />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
  heading: { flex: 1, fontSize: 20, fontWeight: '700', color: Colors.light.text },
  count: { fontSize: 14, color: Colors.light.subtext },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 32 },
  emptyText: { fontSize: 18, fontWeight: '600', color: Colors.light.text },
  emptySubtext: { fontSize: 14, color: Colors.light.subtext, textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, gap: 12 },
  activeRow: { backgroundColor: Colors.light.card },
  index: { width: 24, fontSize: 13, color: Colors.light.subtext, textAlign: 'center' },
  image: { width: 52, height: 52, borderRadius: 8, backgroundColor: Colors.light.card },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: Colors.light.text, marginBottom: 3 },
  activeName: { color: Colors.accent },
  meta: { fontSize: 13, color: Colors.light.subtext },
  removeBtn: { padding: 4 },
});
