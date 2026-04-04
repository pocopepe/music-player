import { create } from 'zustand';
import { Song } from '../services/api';

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
  setIsPlaying: (val: boolean) => void;
  setPosition: (val: number) => void;
  setDuration: (val: number) => void;
};

export const usePlayerStore = create<PlayerStore>((set) => ({
  currentSong: null,
  queue: [],
  isPlaying: false,
  position: 0,
  duration: 0,

  setCurrentSong: (song) => set({ currentSong: song, isPlaying: true }),
  setQueue: (songs) => set({ queue: songs }),
  addToQueue: (song) => set((state) => ({ queue: [...state.queue, song] })),
  removeFromQueue: (id) => set((state) => ({ queue: state.queue.filter((s) => s.id !== id) })),
  setIsPlaying: (val) => set({ isPlaying: val }),
  setPosition: (val) => set({ position: val }),
  setDuration: (val) => set({ duration: val }),
}));
