import { Audio } from 'expo-av';
import { Song } from './api';
import { usePlayerStore } from '../store/playerStore';

let soundInstance: Audio.Sound | null = null;

export async function playSong(song: Song) {
  const { setCurrentSong, setIsPlaying, setDuration, setPosition } = usePlayerStore.getState();

  const url = song.downloadUrl?.find(d => d.quality === '96kbps')?.url;
  if (!url) return;

  if (soundInstance) {
    await soundInstance.unloadAsync();
    soundInstance = null;
  }

  await Audio.setAudioModeAsync({
    staysActiveInBackground: true,
    playsInSilentModeIOS: true,
  });

  const { sound } = await Audio.Sound.createAsync(
    { uri: url },
    { shouldPlay: true },
    (status) => {
      if (!status.isLoaded) return;
      setPosition(Math.floor(status.positionMillis / 1000));
      setDuration(Math.floor((status.durationMillis ?? 0) / 1000));
      if (status.didJustFinish) setIsPlaying(false);
    }
  );

  soundInstance = sound;
  setCurrentSong(song);
  setIsPlaying(true);
}

export async function togglePlayPause() {
  const { isPlaying, setIsPlaying } = usePlayerStore.getState();
  if (!soundInstance) return;
  if (isPlaying) {
    await soundInstance.pauseAsync();
    setIsPlaying(false);
  } else {
    await soundInstance.playAsync();
    setIsPlaying(true);
  }
}

export async function seekTo(seconds: number) {
  if (!soundInstance) return;
  await soundInstance.setPositionAsync(seconds * 1000);
}
