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

export async function searchSongs(query: string, page = 1): Promise<{ results: Song[]; total: number }> {
  const data = await get<any>(`/api/search/songs?query=${encodeURIComponent(query)}&page=${page}`);
  return data.data;
}

export async function getSongById(id: string): Promise<Song> {
  const data = await get<any>(`/api/songs/${id}`);
  return data.data[0];
}

export async function getSongSuggestions(id: string): Promise<Song[]> {
  const data = await get<any>(`/api/songs/${id}/suggestions`);
  return data.data;
}
