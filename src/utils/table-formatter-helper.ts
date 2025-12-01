import heroes from '../heroes';
import { EmbedBuilder } from 'discord.js';

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

export function createMatchEmbed(matchData: any) {
  const isRadiantWin = matchData.radiant_win;
  const durationMin = Math.floor(matchData.duration / 60);
  const durationSec = (matchData.duration % 60).toString().padStart(2, '0');

  const embed = new EmbedBuilder()
    .setTitle(`Match ${matchData.match_id}`)
    .setURL(`https://www.dotabuff.com/matches/${matchData.match_id}`)
    .setDescription(
      `**Winner:** ${isRadiantWin ? 'Radiant' : 'Dire'} | **Duration:** ${durationMin}:${durationSec}`,
    )
    .setColor(isRadiantWin ? 0x008000 : 0xff0000)
    .setTimestamp(new Date(matchData.start_time * 1000));

  const buildTeamString = (isRadiantTeam: boolean) => {
    const teamPlayers = matchData.players
      .filter((p: any) => p.isRadiant === isRadiantTeam)
      .sort((a: any, b: any) => b.net_worth - a.net_worth);

    return teamPlayers
      .map((p: any) => {
        const heroName =
          heroes.find((h) => h.id === p.hero_id)?.name || 'Unknown';

        const rawName = (p.personaname || 'Anonymous').substring(0, 20);
        const playerLink = p.account_id
          ? `[${rawName}](https://www.dotabuff.com/players/${p.account_id})`
          : rawName;

        const kda = `${p.kills}/${p.deaths}/${p.assists}`;
        const nw =
          p.net_worth > 1000
            ? `${(p.net_worth / 1000).toFixed(1)}k`
            : p.net_worth;

        return `**${heroName}** \u2022 ${playerLink}\n└ ${kda} KDA \u2022 ${nw} NW`;
      })
      .join('\n\n');
  };

  embed.addFields(
    { name: '🌳 Radiant', value: buildTeamString(true), inline: true },
    { name: '🌋 Dire', value: buildTeamString(false), inline: true },
  );

  return embed;
}
