import { createMMKV } from 'react-native-mmkv';

export const storage = createMMKV();

const RECENT_SEARCHES_KEY = 'recent_searches';

export function getRecentSearches(): string[] {
  const raw = storage.getString(RECENT_SEARCHES_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function addRecentSearch(query: string) {
  const current = getRecentSearches();
  const updated = [query, ...current.filter((q) => q !== query)].slice(0, 10);
  storage.set(RECENT_SEARCHES_KEY, JSON.stringify(updated));
}

export function removeRecentSearch(query: string) {
  const updated = getRecentSearches().filter((q) => q !== query);
  storage.set(RECENT_SEARCHES_KEY, JSON.stringify(updated));
}

export function clearRecentSearches() {
  storage.remove(RECENT_SEARCHES_KEY);
}

const LIKED_SONGS_KEY = 'liked_songs';

export function getLikedSongs(): any[] {
  const raw = storage.getString(LIKED_SONGS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function toggleLikedSong(song: any): boolean {
  const current = getLikedSongs();
  const exists = current.some((s: any) => s.id === song.id);
  if (exists) {
    storage.set(LIKED_SONGS_KEY, JSON.stringify(current.filter((s: any) => s.id !== song.id)));
    return false;
  }
  storage.set(LIKED_SONGS_KEY, JSON.stringify([song, ...current]));
  return true;
}

export function isSongLiked(id: string): boolean {
  return getLikedSongs().some((s: any) => s.id === id);
}

const DOWNLOADED_SONGS_KEY = 'downloaded_songs';

export function getDownloadedSongs(): any[] {
  const raw = storage.getString(DOWNLOADED_SONGS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveDownloadedSong(song: any): void {
  const current = getDownloadedSongs();
  if (!current.find((s: any) => s.id === song.id)) {
    storage.set(DOWNLOADED_SONGS_KEY, JSON.stringify([...current, song]));
  }
}

export function removeDownloadedSong(id: string): void {
  const updated = getDownloadedSongs().filter((s: any) => s.id !== id);
  storage.set(DOWNLOADED_SONGS_KEY, JSON.stringify(updated));
}

export function isDownloaded(id: string): boolean {
  return getDownloadedSongs().some((s: any) => s.id === id);
}

const QUEUE_KEY = 'queue';

export function getPersistedQueue(): any[] {
  const raw = storage.getString(QUEUE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function persistQueue(songs: any[]) {
  storage.set(QUEUE_KEY, JSON.stringify(songs));
}
