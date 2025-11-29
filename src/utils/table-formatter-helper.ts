import heroes from '../heroes';

export function getWRIndicator(wr: number): string {
  if (wr >= 60) return '🟩';
  if (wr >= 45) return '🟧';
  return '🟥';
}

export function formatHeroStatsTable(statsData: any[]): string {
  const indicator = '⬜';
  const header = `| ${'Hero'.padEnd(19)} | ${'G'.padStart(2).padEnd(3)} | ${'W'.padStart(2).padEnd(3)} | ${'L'.padStart(2).padEnd(3)} | ${'WR%'.padStart(5).padEnd(7)} | ${indicator} |`;
  const separator = `| ${'-'.repeat(19)} | ${'-'.repeat(3)} | ${'-'.repeat(3)} | ${'-'.repeat(3)} | ${'-'.repeat(7)} | ${'-'.repeat(2)} |`;

  const rowsStr = statsData
    .map((r) => {
      const wrStr = `${r.wr.toFixed(2)}%`;
      return `| ${r.name.padEnd(19)} | ${String(r.games).padStart(3)} | ${String(r.wins).padStart(3)} | ${String(r.losses).padStart(3)} | ${wrStr.padStart(7)} | ${getWRIndicator(r.wr)} |`;
    })
    .join('\n');

  return `${header}\n${separator}\n${rowsStr}`;
}

export function formatMatchTable(matchData: any): string {
  const header = `| ${'Player'.padEnd(35)} | ${'Hero'.padEnd(19)} | ${'K/D/A'.padEnd(8)} | ${'GPM'.padEnd(4)} | ${'XPM'.padEnd(4)} | ${'DMG'.padEnd(6)} | ${'NW'.padEnd(5)} |`;
  const separator = `| ${'-'.repeat(35)} | ${'-'.repeat(19)} | ${'-'.repeat(8)} | ${'-'.repeat(4)} | ${'-'.repeat(4)} | ${'-'.repeat(6)} | ${'-'.repeat(5)} |`;

  const buildTeamTable = (players: any[], teamName: string) => {
    const sortedPlayers = players.sort((a, b) => b.net_worth - a.net_worth);

    const rows = sortedPlayers.map((p: any) => {
      const name = (p.personaname || 'Anonymous').substring(0, 35).padEnd(35);
      const heroName =
        heroes.find((h) => h.id === p.hero_id)?.name || 'Unknown';
      const hero = heroName.padEnd(19);
      const kda = `${p.kills}/${p.deaths}/${p.assists}`.padStart(8);
      const gpm = p.gold_per_min.toString().padStart(4);
      const xpm = p.xp_per_min.toString().padStart(4);
      const dmgVal =
        p.hero_damage > 1000
          ? `${(p.hero_damage / 1000).toFixed(1)}k`
          : p.hero_damage;
      const dmg = dmgVal.toString().padStart(6);
      const nwVal =
        p.net_worth > 1000
          ? `${(p.net_worth / 1000).toFixed(1)}k`
          : p.net_worth;
      const nw = nwVal.toString().padStart(5);
      return `| ${name} | ${hero} | ${kda} | ${gpm} | ${xpm} | ${dmg} | ${nw} |`;
    });

    return `**${teamName}**\n${header}\n${separator}\n${rows.join('\n')}`;
  };

  const radiantPlayers = matchData.players.filter((p: any) => p.isRadiant);
  const direPlayers = matchData.players.filter((p: any) => !p.isRadiant);

  const radiantTable = buildTeamTable(radiantPlayers, 'Radiant');
  const direTable = buildTeamTable(direPlayers, 'Dire');

  const winner = matchData.radiant_win ? 'Radiant' : 'Dire';

  return `\`\`\`prolog\nWinner: ${winner}\n\n${radiantTable}\n\n${direTable}\n\`\`\``;
}
