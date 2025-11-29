const BASE_URL = 'https://api.opendota.com/api';

async function fetchOpenDotaApi<T>(
  endpoint: string,
  params: Record<string, string> = {},
): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([key, value]) =>
    url.searchParams.append(key, value),
  );

  const res = await fetch(url);
  if (!res.ok) {
    console.error('OpenDota API error:', res.status, res.statusText);
    throw new Error('Error fetching data from OpenDota API.');
  }

  return res.json() as Promise<T>;
}

export function getHeroStats(steamId: string, days: number): Promise<any> {
  return fetchOpenDotaApi(`/players/${steamId}/heroes`, {
    date: String(days),
    lobby_type: '7',
  });
}

export function getWinLoss(steamId: string, days: number): Promise<any> {
  return fetchOpenDotaApi(`/players/${steamId}/wl`, {
    date: String(days),
    lobby_type: '7',
  });
}

export async function getRecentMatches(steamId: string): Promise<any> {
  return fetchOpenDotaApi(`/players/${steamId}/matches`, {
    limit: '10',
    lobby_type: '7',
  });
}

export async function getMatchDetails(matchId: string): Promise<any> {
  return fetchOpenDotaApi(`/matches/${matchId}`);
}
