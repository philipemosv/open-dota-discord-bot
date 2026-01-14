import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
  EmbedBuilder,
} from 'discord.js';
import { findUserByDiscordId } from '../db';
import { getWinLoss, getRecentMatches } from '../opendota';
import {
  calculateStreaks,
  formatStreak,
  getStreakEmoji,
} from '../utils/streak-helper';

function getWinRateColor(winrate: number): number {
  if (winrate >= 55) return 0x00ff00;
  if (winrate >= 45) return 0xffa500;
  return 0xff0000;
}

export default {
  data: new SlashCommandBuilder()
    .setName('wl')
    .setDescription('Get win/loss record for a player.')
    .addIntegerOption((option) =>
      option
        .setName('days')
        .setDescription('Days to look back for matches (0-365)')
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(365),
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    let deferred = false;
    try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      deferred = true;

      const days = interaction.options.getInteger('days', true);
      const discordId = interaction.user.id;

      const user = findUserByDiscordId(discordId);
      if (!user) {
        await interaction.editReply(
          'User not found. Please link your Steam account first.\nUse `/link` command to link your account.',
        );
        return;
      }

      const [wlData, matches] = await Promise.all([
        getWinLoss(user.steam_id, days),
        getRecentMatches(user.steam_id, days, 500),
      ]);

      const totalGames = wlData.win + wlData.lose;
      const winrate = totalGames === 0 ? 0 : (wlData.win / totalGames) * 100;
      const mmrChange = (wlData.win - wlData.lose) * 25;
      const streaks = calculateStreaks(matches, user.steam_id);

      const periodText = days === 0 ? 'All Time' : `Last ${days} days`;
      const currentStreakText = `${getStreakEmoji(streaks.currentStreak)} ${formatStreak(streaks.currentStreak)}`;

      const embed = new EmbedBuilder()
        .setTitle(`Win/Loss - ${periodText}`)
        .setColor(getWinRateColor(winrate))
        .addFields(
          { name: 'Wins', value: String(wlData.win), inline: true },
          { name: 'Losses', value: String(wlData.lose), inline: true },
          { name: 'Win Rate', value: `${winrate.toFixed(1)}%`, inline: true },
          {
            name: '~MMR Change',
            value: `${mmrChange >= 0 ? '+' : ''}${mmrChange}`,
            inline: true,
          },
          { name: 'Current Streak', value: currentStreakText, inline: true },
          { name: 'Total Games', value: String(totalGames), inline: true },
          {
            name: 'Best Win Streak',
            value: `${streaks.longestWinStreak}W`,
            inline: true,
          },
          {
            name: 'Worst Loss Streak',
            value: `${streaks.longestLossStreak}L`,
            inline: true,
          },
        )
        .setFooter({ text: 'Ranked matches only' })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error('Error in /wl command:', err);
      if (deferred) {
        try {
          await interaction.editReply(
            'There was an error while executing this command.',
          );
        } catch {
          // Interaction expired, ignore
        }
      }
    }
  },
};
