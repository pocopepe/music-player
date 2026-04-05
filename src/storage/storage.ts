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

const RECENTLY_PLAYED_KEY = 'recently_played';

export function getRecentlyPlayed(): any[] {
  const raw = storage.getString(RECENTLY_PLAYED_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function addRecentlyPlayed(song: any): void {
  const current = getRecentlyPlayed().filter((s: any) => s.id !== song.id);
  storage.set(RECENTLY_PLAYED_KEY, JSON.stringify([song, ...current].slice(0, 50)));
}

const PLAY_COUNTS_KEY = 'play_counts';

export function incrementPlayCount(song: any): void {
  const raw = storage.getString(PLAY_COUNTS_KEY);
  const counts: Record<string, { song: any; count: number }> = raw ? JSON.parse(raw) : {};
  counts[song.id] = { song, count: (counts[song.id]?.count ?? 0) + 1 };
  storage.set(PLAY_COUNTS_KEY, JSON.stringify(counts));
}

export function getMostPlayed(limit = 10): any[] {
  const raw = storage.getString(PLAY_COUNTS_KEY);
  if (!raw) return [];
  const counts: Record<string, { song: any; count: number }> = JSON.parse(raw);
  return Object.values(counts)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map(e => e.song);
}

const QUEUE_KEY = 'queue';

export function getPersistedQueue(): any[] {
  const raw = storage.getString(QUEUE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function persistQueue(songs: any[]) {
  storage.set(QUEUE_KEY, JSON.stringify(songs));
}
