# Music Player

A React Native music streaming app built with Expo, powered by the [JioSaavn API](https://saavn.sumit.co).

---

## Setup

### Prerequisites
- Node.js 18+
- Expo Go app on your device, or an Android/iOS simulator

### Install & Run

```bash
git clone <repo-url>
cd music-player
npm install
npx expo start
```

Scan the QR code with Expo Go, or press `a` for Android / `i` for iOS simulator.

### Build APK

```bash
eas build --platform android --profile preview
```

---

## Features

| Feature | Details |
|---|---|
| Search | Songs, Artists, Albums with infinite scroll pagination |
| Full Player | Seek bar, skip ±10s, prev/next |
| Mini Player | Persistent, synced with full player across all screens |
| Queue | Add, drag-to-reorder, remove — persisted across sessions |
| Background Playback | Continues when minimized or screen is off |
| Shuffle | Picks a random song from the queue each time |
| Repeat | Off / Repeat All / Repeat One |
| Download | Download songs for offline listening |
| Offline Playback | Downloaded songs play without internet |
| Favourites | Like/unlike songs, persisted locally |
| Recently Played | Auto-tracked, seeds the Suggested tab |
| Most Played | Sorted by play count |
| Sort | Songs, Artists, Albums all sortable |
| Dark Mode | Follows system appearance automatically |

---

## Architecture

```
src/
├── screens/           # Home, Player, Search, Queue, Album, Artist, Favourites
├── components/
│   ├── home/          # Suggested, Songs, Artists, Albums tab content
│   ├── AppHeader.tsx
│   ├── FilterTabs.tsx
│   └── MiniPlayer.tsx
├── services/
│   ├── api.ts             # JioSaavn API
│   ├── audioService.ts    # expo-av playback
│   └── downloadService.ts # expo-file-system downloads
├── store/
│   ├── playerStore.ts     # Zustand — song, queue, playback state
│   └── downloadStore.ts   # Zustand — downloaded song IDs
├── storage/
│   └── storage.ts         # MMKV — likes, downloads, recents, play counts, queue
├── hooks/
│   └── useColors.ts       # Dark/light theme hook
└── navigation/
    └── RootNavigator.tsx  # Stack + Tab navigation
```

### Key Decisions

**Single audio instance** — A module-level `soundInstance` in `audioService.ts` is shared across the entire app. All screens read from the same Zustand store updated by the same audio callbacks, keeping Mini Player and Full Player perfectly in sync with zero extra wiring.

**Zustand over Redux** — No boilerplate. `usePlayerStore.getState()` works outside React components, which is critical for the `didJustFinish` audio callback that triggers `playNext()` without any React context.

**MMKV over AsyncStorage** — Synchronous reads. Liked songs, queue, and recently played are available instantly on launch with no loading states or async waterfalls.

**`navigationRef` pattern** — Allows `MiniPlayer` and `audioService` to trigger navigation (e.g. open Player screen) from outside the React tree.

**Download URL refresh** — JioSaavn CDN URLs expire. On download, `getSongById` fetches a fresh URL before writing to disk, preventing broken offline files.

**Dark mode via hook** — `useColors()` reads `useColorScheme()` and returns `Colors.light` or `Colors.dark`. Styles are built inside `useMemo` so they recompute automatically on scheme change across all 18 screens and components.

---

## Trade-offs

**No mock data** — All content is live from the API. Internet required for search and streaming; downloaded songs play fully offline.

**Local Artists/Albums tabs** — Show only content from downloaded songs. API-based artist/album browsing is available in Search.

**Album metadata fetch** — The Albums tab fetches full album data from the API on first load to show real song counts and release years. Cached in MMKV after the first fetch so subsequent visits are instant.

**No crossfade/gapless** — Single audio instance means clean but non-overlapping track transitions. Sufficient for the scope of this project.
