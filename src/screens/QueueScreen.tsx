import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/theme';
import { usePlayerStore } from '../store/playerStore';
import { playSong } from '../services/audioService';
import { Song } from '../services/api';

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function QueueScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { queue, currentSong, setQueue, removeFromQueueAt } = usePlayerStore();
  const currentIndex = queue.findIndex(s => s.id === currentSong?.id);

  function renderItem({ item, drag, isActive, getIndex }: RenderItemParams<Song>) {
    const index = getIndex() ?? 0;
    const imageUrl = item.image?.find(i => i.quality === '150x150')?.url;
    const artists = item.artists.primary.map(a => a.name).join(', ');
    const isActive2 = currentSong?.id === item.id;
    const isPast = index < currentIndex;
    const canInteract = index > currentIndex;

    return (
      <ScaleDecorator>
        <TouchableOpacity
          style={[styles.row, isActive2 && styles.activeRow, isActive && styles.dragging]}
          onPress={() => playSong(item)}
          onLongPress={canInteract ? drag : undefined}
          disabled={isActive}
        >
          <Text style={[styles.index, isActive2 && { color: Colors.accent }]}>
            {isActive2 ? '▶' : index + 1}
          </Text>
          <Image source={{ uri: imageUrl }} style={styles.image} />
          <View style={styles.info}>
            <Text style={[styles.name, isActive2 && styles.activeName, isPast && styles.pastName]} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.meta} numberOfLines={1}>{artists} · {formatDuration(item.duration)}</Text>
          </View>
          {canInteract ? (
            <>
              <TouchableOpacity onPress={() => removeFromQueueAt(index)} style={styles.btn}>
                <Ionicons name="close" size={20} color={Colors.light.subtext} />
              </TouchableOpacity>
              <TouchableOpacity onLongPress={drag} style={styles.btn}>
                <Ionicons name="reorder-three" size={22} color={Colors.light.subtext} />
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.btnPlaceholder} />
          )}
        </TouchableOpacity>
      </ScaleDecorator>
    );
  }

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
        <DraggableFlatList
          data={queue}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          onDragEnd={({ data }) => setQueue(data)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 40 }}
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
  dragging: { opacity: 0.9, backgroundColor: Colors.light.card },
  index: { width: 24, fontSize: 13, color: Colors.light.subtext, textAlign: 'center' },
  image: { width: 52, height: 52, borderRadius: 8, backgroundColor: Colors.light.card },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: Colors.light.text, marginBottom: 3 },
  activeName: { color: Colors.accent },
  pastName: { opacity: 0.4 },
  meta: { fontSize: 13, color: Colors.light.subtext },
  btn: { padding: 4 },
  btnPlaceholder: { width: 28 },
});
