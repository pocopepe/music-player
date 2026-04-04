import { useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/theme';
import { usePlayerStore } from '../store/playerStore';
import { togglePlayPause, seekTo } from '../services/audioService';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function PlayerScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { currentSong, isPlaying, position, duration } = usePlayerStore();
  const trackWidth = useRef(0);

  if (!currentSong) return null;

  const imageUrl =
    currentSong.image?.find(i => i.quality === '500x500')?.url ??
    currentSong.image?.find(i => i.quality === '150x150')?.url;
  const artists = currentSong.artists.primary.map(a => a.name).join(', ');
  const progress = duration > 0 ? Math.min(position / duration, 1) : 0;

  function handleSeek(locationX: number) {
    if (trackWidth.current === 0 || duration === 0) return;
    const ratio = Math.max(0, Math.min(locationX / trackWidth.current, 1));
    seekTo(Math.floor(ratio * duration));
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 }]}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
      </TouchableOpacity>

      <Image source={{ uri: imageUrl }} style={styles.artwork} />

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{currentSong.name}</Text>
        <Text style={styles.artist} numberOfLines={1}>{artists}</Text>
      </View>

      <View style={styles.seekContainer}>
        <View
          style={styles.track}
          onLayout={e => { trackWidth.current = e.nativeEvent.layout.width; }}
          onStartShouldSetResponder={() => true}
          onResponderGrant={e => handleSeek(e.nativeEvent.locationX)}
          onResponderMove={e => handleSeek(e.nativeEvent.locationX)}
        >
          <View style={[styles.fill, { width: `${progress * 100}%` }]} />
          <View style={[styles.thumb, { left: `${progress * 100}%` as any }]} />
        </View>
        <View style={styles.times}>
          <Text style={styles.time}>{formatTime(position)}</Text>
          <Text style={styles.time}>{formatTime(duration)}</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity>
          <Ionicons name="play-skip-back" size={28} color={Colors.light.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => seekTo(Math.max(0, position - 10))}>
          <View style={styles.skipWrap}>
            <Ionicons name="reload" size={28} color={Colors.light.text} style={styles.flipIcon} />
            <Text style={styles.skipLabel}>10</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.playBtn} onPress={togglePlayPause}>
          <Ionicons name={isPlaying ? 'pause' : 'play'} size={34} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => seekTo(Math.min(duration, position + 10))}>
          <View style={styles.skipWrap}>
            <Ionicons name="reload" size={28} color={Colors.light.text} />
            <Text style={styles.skipLabel}>10</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="play-skip-forward" size={28} color={Colors.light.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.secondary}>
        <TouchableOpacity style={styles.secBtn}>
          <Ionicons name="speedometer-outline" size={24} color={Colors.light.icon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.secBtn}>
          <Ionicons name="timer-outline" size={24} color={Colors.light.icon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.secBtn}>
          <Ionicons name="tv-outline" size={24} color={Colors.light.icon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.secBtn}>
          <Ionicons name="ellipsis-vertical" size={24} color={Colors.light.icon} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.lyricsBtn}>
        <Ionicons name="chevron-up" size={16} color={Colors.light.subtext} />
        <Text style={styles.lyricsLabel}>Lyrics</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingHorizontal: 28,
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: 20,
    padding: 4,
  },
  artwork: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: Colors.light.card,
    marginBottom: 24,
  },
  info: {
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 6,
  },
  artist: {
    fontSize: 16,
    color: Colors.light.subtext,
  },
  seekContainer: {
    marginBottom: 28,
  },
  track: {
    height: 4,
    backgroundColor: Colors.light.border,
    borderRadius: 2,
    marginBottom: 10,
    justifyContent: 'center',
  },
  fill: {
    height: 4,
    backgroundColor: Colors.accent,
    borderRadius: 2,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  thumb: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.accent,
    position: 'absolute',
    top: -5,
    marginLeft: -7,
  },
  times: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  time: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  playBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
  },
  flipIcon: {
    transform: [{ scaleX: -1 }],
  },
  skipLabel: {
    position: 'absolute',
    fontSize: 10,
    fontWeight: '700',
    color: Colors.light.text,
  },
  secondary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  secBtn: {
    padding: 8,
  },
  lyricsBtn: {
    alignItems: 'center',
    gap: 2,
  },
  lyricsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.subtext,
  },
});
