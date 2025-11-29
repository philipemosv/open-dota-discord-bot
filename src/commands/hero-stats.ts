import { EmbedBuilder, SlashCommandBuilder, MessageFlags } from 'discord.js';
import UserModel from '../models/User';
import { processHeroData } from '../utils/hero-stats-helper';
import { formatHeroStatsTable } from '../utils/table-formatter-helper';
import { getHeroStats } from '../opendota';

export default {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Get hero statistics for a player.')
    .addIntegerOption((option) =>
      option
        .setName('days')
        .setDescription('Days to look back for matches (0-365)')
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(365),
    ),
  async execute(interaction: any) {
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

      const data = await getHeroStats(user.steamId, days);

      if (data.length === 0 || data.every((d: any) => d.games === 0)) {
        await interaction.editReply(
          'No hero data found for the specified period.',
        );
        return;
      }

      const heroStats = processHeroData(data);
      const table = formatHeroStatsTable(heroStats);
      const daysText = days === 0 ? 'Today' : `Last ${days} days`;

      const embed = new EmbedBuilder()
        .setAuthor({
          name: `${interaction.user.username} - Hero Stats (${daysText})`,
          iconURL:
            'https://avatars.steamstatic.com/d7ee96dce61bff8c9b8699efe41bacb093befabd_full.jpg',
          url: 'https://steamcommunity.com/id/mrshrg/',
        })
        .setDescription('```\n' + table + '```')
        .setFooter({ text: '🟩 >= 60% | 🟧 >= 45% | 🟥 < 45%' });

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error('Error in /stats command:', err);
      await interaction.editReply(
        'There was an error while executing this command.',
      );
    }
  },
};
