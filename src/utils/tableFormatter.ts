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
