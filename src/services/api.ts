const BASE_URL = 'https://saavn.sumit.co';

export type Song = {
  id: string;
  name: string;
  duration: number;
  language: string;
  album: {
    id: string;
    name: string;
  };
  artists: {
    primary: { id: string; name: string }[];
  };
  image: { quality: string; url: string }[];
  downloadUrl: { quality: string; url: string }[];
};

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export type Artist = {
  id: string;
  name: string;
  image: { quality: string; url: string }[];
  followerCount?: number;
};

export type Album = {
  id: string;
  name: string;
  artists: { primary: { id: string; name: string }[] };
  image: { quality: string; url: string }[];
  year?: string;
};

export async function getSongById(id: string): Promise<Song | null> {
  try {
    const res = await fetch(`https://saavn.sumit.co/api/songs?ids=${id}`);
    const data = await res.json();
    return data?.data?.[0] ?? null;
  } catch {
    return null;
  }
}

export async function searchSongs(query: string, page = 1): Promise<{ results: Song[]; total: number }> {
  const data = await get<any>(`/api/search/songs?query=${encodeURIComponent(query)}&page=${page}`);
  return data.data;
}

export async function searchArtists(query: string, page = 1): Promise<{ results: Artist[]; total: number }> {
  const data = await get<any>(`/api/search/artists?query=${encodeURIComponent(query)}&page=${page}`);
  return data.data;
}

export async function searchAlbums(query: string, page = 1): Promise<{ results: Album[]; total: number }> {
  const data = await get<any>(`/api/search/albums?query=${encodeURIComponent(query)}&page=${page}`);
  return data.data;
}

export async function getAlbum(id: string): Promise<{ name: string; year?: string; artists: { primary: { id: string; name: string }[] }; image: { quality: string; url: string }[]; songs: Song[] } | null> {
  try {
    const data = await get<any>(`/api/albums?id=${id}`);
    return data.data;
  } catch {
    return null;
  }
}


