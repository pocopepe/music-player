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

const QUEUE_KEY = 'queue';

export function getPersistedQueue(): any[] {
  const raw = storage.getString(QUEUE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function persistQueue(songs: any[]) {
  storage.set(QUEUE_KEY, JSON.stringify(songs));
}
