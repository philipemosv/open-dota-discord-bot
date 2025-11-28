import heroes from '../heroes';
import { HeroStats } from './tableFormatter';

export function processHeroData(data: any[]): HeroStats[] {
  return data
    .filter((hero: any) => hero.games > 0)
    .sort((a: any, b: any) => {
      if (b.games !== a.games) return b.games - a.games;
      const wrA = a.games === 0 ? 0 : a.win / a.games;
      const wrB = b.games === 0 ? 0 : b.win / b.games;
      return wrB - wrA;
    })
    .map((hero: any) => {
      const name = heroes.find((x) => x.id === hero.hero_id)?.name || 'Unknown';
      const games = hero.games;
      const wins = hero.win;
      const losses = games - wins;
      const wr = games === 0 ? 0 : (wins / games) * 100;
      return { name, games, wins, losses, wr };
    });
}
