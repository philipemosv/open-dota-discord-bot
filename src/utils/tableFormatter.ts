import heroes from '../heroes';

// -------- Padding Helpers --------
export function padLeft(value: string | number, width: number): string {
  return String(value).padStart(width, ' ');
}

export function padRight(value: string | number, width: number): string {
  return String(value).padEnd(width, ' ');
}

export function padCenter(value: string | number, width: number): string {
  const str = String(value);
  const totalPadding = width - str.length;
  const leftPadding = Math.floor(totalPadding / 2);
  const rightPadding = totalPadding - leftPadding;
  return ' '.repeat(leftPadding) + str + ' '.repeat(rightPadding);
}

// -------- Win Rate Indicator --------
export function getWRIndicator(wr: number): string {
  if (wr >= 60) return '🟩';
  if (wr >= 45) return '🔶';
  return '🟥';
}

// -------- Types --------
export interface ColumnWidths {
  hero: number;
  games: number;
  wins: number;
  losses: number;
  wr: number;
  indicator: number;
}

export interface HeroStats {
  name: string;
  games: number;
  wins: number;
  losses: number;
  wr: number;
}

// -------- Column Width Calculation --------
export function calculateColumnWidths(rows: HeroStats[]): ColumnWidths {
  return {
    hero: Math.max(...rows.map((r) => r.name.length), 'Hero'.length),
    games: Math.max(...rows.map((r) => String(r.games).length), 'G'.length),
    wins: Math.max(...rows.map((r) => String(r.wins).length), 'W'.length),
    losses: Math.max(...rows.map((r) => String(r.losses).length), 'L'.length),
    wr: Math.max(7, 'WR%'.length),
    indicator: 2,
  };
}

// -------- Table Building --------
export function buildTableHeader(cols: ColumnWidths): string {
  const indicator = '●';
  return (
    `| ${padRight('Hero', cols.hero)} ` +
    `| ${padCenter('G', cols.games)} ` +
    `| ${padCenter('W', cols.wins)} ` +
    `| ${padCenter('L', cols.losses)} ` +
    `| ${padCenter('WR%', cols.wr)} ` +
    `| ${padCenter(indicator, cols.indicator)} |`
  );
}

export function buildTableSeparator(cols: ColumnWidths): string {
  const totalWidth =
    2 +
    cols.hero +
    1 +
    2 +
    cols.games +
    1 +
    2 +
    cols.wins +
    1 +
    2 +
    cols.losses +
    1 +
    2 +
    cols.wr +
    1 +
    2 +
    cols.indicator +
    2;
  return '-'.repeat(totalWidth);
}

export function buildTableRows(rows: HeroStats[], cols: ColumnWidths): string {
  return rows
    .map((r) => {
      const wrStr = `${r.wr.toFixed(2)}%`;
      return (
        `| ${padRight(r.name, cols.hero)} ` +
        `| ${padCenter(r.games, cols.games)} ` +
        `| ${padCenter(r.wins, cols.wins)} ` +
        `| ${padCenter(r.losses, cols.losses)} ` +
        `| ${padLeft(wrStr, cols.wr)} ` +
        `| ${padCenter(getWRIndicator(r.wr), cols.indicator)} |`
      );
    })
    .join('\n');
}

export function buildTable(rows: HeroStats[]): string {
  const cols = calculateColumnWidths(rows);
  const header = buildTableHeader(cols);
  const separator = buildTableSeparator(cols);
  const tableRows = buildTableRows(rows, cols);
  return `${header}\n${separator}\n${tableRows}`;
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
      const kda = `${p.kills}/${p.deaths}/${p.assists}`.padEnd(8);
      const gpm = p.gold_per_min.toString().padEnd(4);
      const xpm = p.xp_per_min.toString().padEnd(4);
      const dmgVal =
        p.hero_damage > 1000
          ? `${(p.hero_damage / 1000).toFixed(1)}k`
          : p.hero_damage;
      const dmg = dmgVal.toString().padEnd(6);
      const nwVal =
        p.net_worth > 1000
          ? `${(p.net_worth / 1000).toFixed(1)}k`
          : p.net_worth;
      const nw = nwVal.toString().padEnd(5);
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
