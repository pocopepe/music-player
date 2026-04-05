import { Audio } from 'expo-av';
import { Song } from './api';
import { usePlayerStore } from '../store/playerStore';
import { addRecentlyPlayed, incrementPlayCount } from '../storage/storage';

let soundInstance: Audio.Sound | null = null;

export async function playSong(song: Song, queue?: Song[]) {
  const { setCurrentSong, setIsPlaying, setDuration, setPosition, setQueue, queue: currentQueue } = usePlayerStore.getState();

  const url = (song as any).localPath ?? song.downloadUrl?.find(d => d.quality === '96kbps')?.url;
  if (!url) return;

  if (soundInstance) {
    await soundInstance.unloadAsync();
    soundInstance = null;
  }

  await Audio.setAudioModeAsync({ staysActiveInBackground: true, playsInSilentModeIOS: true });

  const { sound } = await Audio.Sound.createAsync(
    { uri: url },
    { shouldPlay: true },
    (status) => {
      if (!status.isLoaded) return;
      setPosition(Math.floor(status.positionMillis / 1000));
      setDuration(Math.floor((status.durationMillis ?? 0) / 1000));
      if (status.didJustFinish) playNext();
    }
  );

  soundInstance = sound;
  setCurrentSong(song);
  setIsPlaying(true);
  addRecentlyPlayed(song);
  incrementPlayCount(song);

  if (queue) setQueue(queue);
  else if (!currentQueue.find(s => s.id === song.id)) setQueue([...currentQueue, song]);
}

export async function togglePlayPause() {
  const { isPlaying, setIsPlaying } = usePlayerStore.getState();
  if (!soundInstance) return;
  if (isPlaying) { await soundInstance.pauseAsync(); setIsPlaying(false); }
  else { await soundInstance.playAsync(); setIsPlaying(true); }
}

export async function seekTo(seconds: number) {
  if (!soundInstance) return;
  await soundInstance.setPositionAsync(seconds * 1000);
}

export async function playNext() {
  const { currentSong, queue, repeatMode, shuffle } = usePlayerStore.getState();
  if (!currentSong || queue.length === 0) return;

  if (repeatMode === 'one') {
    await seekTo(0);
    await soundInstance?.playAsync();
    return;
  }

  const idx = queue.findIndex(s => s.id === currentSong.id);

  if (shuffle) {
    const others = queue.filter((s) => s.id !== currentSong.id);
    if (others.length === 0) return;
    await playSong(others[Math.floor(Math.random() * others.length)]);
    return;
  }

  const next = queue[idx + 1];
  if (next) {
    await playSong(next);
  } else if (repeatMode === 'all' && queue.length > 0) {
    await playSong(queue[0]);
  }
}

export async function playPrev() {
  const { currentSong, queue, position } = usePlayerStore.getState();
  if (!currentSong || queue.length === 0) return;
  if (position > 3) { await seekTo(0); return; }
  const idx = queue.findIndex(s => s.id === currentSong.id);
  const prev = queue[idx - 1];
  if (prev) await playSong(prev);
}
