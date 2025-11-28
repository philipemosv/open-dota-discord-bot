import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
} from 'discord.js';
import UserModel from '../models/User';
import { getWinLoss } from '../opendota';

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
    try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      const days = interaction.options.getInteger('days', true);
      const discordId = interaction.user.id;

      const user = await UserModel.findOne({ discordId });
      if (!user) {
        await interaction.editReply(
          'User not found. Please link your Steam account first.\nUse `/link` command to link your account.',
        );
        return;
      }

      const data = await getWinLoss(user.steamId, days);

      const winrate =
        data.win + data.lose === 0
          ? 0
          : (data.win / (data.win + data.lose)) * 100;

      const mmrChange = (data.win - data.lose) * 25; // Assuming 25 MMR per win/loss

      const replyMessage = `**W:** ${data.win} | **L:** ${data.lose} | **WR%:** ${winrate.toFixed(2)}% | **~MMR:** ${mmrChange >= 0 ? '+' : ''}${mmrChange}`;
      await interaction.editReply(replyMessage);
    } catch (err) {
      console.error('Error in /wl command:', err);
      await interaction.editReply(
        'There was an error while executing this command.',
      );
    }
  },
};
