import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { usePlayerStore } from '../store/playerStore';
import { togglePlayPause } from '../services/audioService';

export default function MiniPlayer() {
  const { currentSong, isPlaying } = usePlayerStore();

  if (!currentSong) return null;

  const imageUrl = currentSong.image?.find(i => i.quality === '150x150')?.url;
  const artists = currentSong.artists.primary.map((a) => a.name).join(', ');
  const title = `${currentSong.name} - ${artists}`;

  return (
    <View style={styles.container}>
      <Image source={{ uri: imageUrl }} style={styles.image} />
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      <TouchableOpacity onPress={togglePlayPause} style={styles.btn}>
        <Ionicons
          name={isPlaying ? 'pause' : 'play'}
          size={24}
          color={Colors.accent}
        />
      </TouchableOpacity>
      <TouchableOpacity style={styles.btn}>
        <Ionicons name="play-skip-forward" size={24} color={Colors.accent} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
    position: 'absolute',
    bottom: 85,
    left: 0,
    right: 0,
  },
  image: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: Colors.light.card,
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  btn: {
    padding: 4,
  },
});
