import { create } from 'zustand';
import { getDownloadedSongs } from '../storage/storage';

type DownloadStore = {
  downloadedIds: Set<string>;
  refresh: () => void;
};

export const useDownloadStore = create<DownloadStore>((set) => ({
  downloadedIds: new Set(getDownloadedSongs().map((s: any) => s.id)),
  refresh: () => set({ downloadedIds: new Set(getDownloadedSongs().map((s: any) => s.id)) }),
}));
