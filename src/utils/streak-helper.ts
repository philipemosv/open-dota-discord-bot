export interface StreakData {
  currentStreak: number;
  longestWinStreak: number;
  longestLossStreak: number;
}

function didWin(match: any): boolean {
  const isRadiant = match.player_slot < 128;
  return (isRadiant && match.radiant_win) || (!isRadiant && !match.radiant_win);
}

export function calculateStreaks(
  matches: any[],
  steamId: string,
): StreakData {
  if (!matches || matches.length === 0) {
    return { currentStreak: 0, longestWinStreak: 0, longestLossStreak: 0 };
  }

  // Sort by time: oldest first for streak calculation
  const sortedMatches = [...matches].sort(
    (a, b) => a.start_time - b.start_time,
  );

  let longestWinStreak = 0;
  let longestLossStreak = 0;
  let tempWinStreak = 0;
  let tempLossStreak = 0;

  // Calculate longest streaks (oldest to newest)
  for (const match of sortedMatches) {
    const won = didWin(match);

    if (won) {
      tempWinStreak++;
      tempLossStreak = 0;
      if (tempWinStreak > longestWinStreak) {
        longestWinStreak = tempWinStreak;
      }
    } else {
      tempLossStreak++;
      tempWinStreak = 0;
      if (tempLossStreak > longestLossStreak) {
        longestLossStreak = tempLossStreak;
      }
    }
  }

  // Calculate current streak (from most recent match backwards)
  let currentStreak = 0;
  const newestFirst = [...matches].sort((a, b) => b.start_time - a.start_time);
  const firstWon = didWin(newestFirst[0]);

  for (const match of newestFirst) {
    const won = didWin(match);
    if (won === firstWon) {
      currentStreak = won ? currentStreak + 1 : currentStreak - 1;
    } else {
      break;
    }
  }

  return { currentStreak, longestWinStreak, longestLossStreak };
}

export function formatStreak(streak: number): string {
  if (streak === 0) return 'None';
  if (streak > 0) return `${streak}W`;
  return `${Math.abs(streak)}L`;
}

export function getStreakEmoji(streak: number): string {
  if (streak === 0) return '';
  if (streak > 0) return streak >= 3 ? '🔥' : '✅';
  return streak <= -3 ? '❄️' : '❌';
}
