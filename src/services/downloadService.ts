import * as FileSystem from 'expo-file-system/legacy';
import { Song, getSongById } from './api';

const SONGS_DIR = FileSystem.documentDirectory + 'songs/';

export async function downloadSong(song: Song): Promise<string> {
  console.log('[download] starting for:', song.name);

  const info = await FileSystem.getInfoAsync(SONGS_DIR);
  if (!info.exists) await FileSystem.makeDirectoryAsync(SONGS_DIR, { intermediates: true });

  const fresh = await getSongById(song.id);
  console.log('[download] fresh song data:', fresh ? 'fetched' : 'null');

  const url = fresh?.downloadUrl?.find(d => d.quality === '96kbps')?.url
    ?? song.downloadUrl?.find(d => d.quality === '96kbps')?.url;
  console.log('[download] url:', url ?? 'NOT FOUND');
  if (!url) throw new Error('No download URL');

  const path = SONGS_DIR + song.id + '.mp3';
  console.log('[download] saving to:', path);
  await FileSystem.downloadAsync(url, path);
  console.log('[download] done:', song.name);
  return path;
}

export async function deleteSong(id: string): Promise<void> {
  const path = SONGS_DIR + id + '.mp3';
  const info = await FileSystem.getInfoAsync(path);
  if (info.exists) await FileSystem.deleteAsync(path);
}
