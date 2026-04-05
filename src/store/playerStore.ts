import { create } from 'zustand';
import { Song } from '../services/api';
import { getPersistedQueue, persistQueue } from '../storage/storage';

type PlayerStore = {
  currentSong: Song | null;
  queue: Song[];
  isPlaying: boolean;
  position: number;
  duration: number;

  setCurrentSong: (song: Song) => void;
  setQueue: (songs: Song[]) => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (id: string) => void;
  removeFromQueueAt: (index: number) => void;
  setIsPlaying: (val: boolean) => void;
  setPosition: (val: number) => void;
  setDuration: (val: number) => void;
};

export const usePlayerStore = create<PlayerStore>((set) => ({
  currentSong: null,
  queue: getPersistedQueue(),
  isPlaying: false,
  position: 0,
  duration: 0,

  setCurrentSong: (song) => set({ currentSong: song }),
  setQueue: (songs) => {
    persistQueue(songs);
    set({ queue: songs });
  },
  addToQueue: (song) => set((state) => {
    const queue = [...state.queue, song];
    persistQueue(queue);
    return { queue };
  }),
  removeFromQueue: (id) => set((state) => {
    const queue = state.queue.filter((s) => s.id !== id);
    persistQueue(queue);
    return { queue };
  }),
  removeFromQueueAt: (index) => set((state) => {
    const queue = state.queue.filter((_, i) => i !== index);
    persistQueue(queue);
    return { queue };
  }),
  setIsPlaying: (val) => set({ isPlaying: val }),
  setPosition: (val) => set({ position: val }),
  setDuration: (val) => set({ duration: val }),
}));
