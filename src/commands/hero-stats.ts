import { EmbedBuilder, SlashCommandBuilder, MessageFlags } from 'discord.js';
import UserModel from '../models/User';
import { processHeroData } from '../utils/heroStats';
import { buildTable } from '../utils/tableFormatter';

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

      const url = new URL(
        `https://api.opendota.com/api/players/${user.steamId}/heroes`,
      );
      url.searchParams.append('date', String(days));
      url.searchParams.append('lobby_type', '7');

      const res = await fetch(url);
      if (!res.ok) {
        console.error('OpenDota API error:', res.status, res.statusText);
        await interaction.editReply('Error fetching data from OpenDota API.');
        return;
      }

      const data = await res.json();
      if (data.length === 0) {
        await interaction.editReply(
          'No hero data found for the specified period.',
        );
        return;
      }

      const heroStats = processHeroData(data);
      const table = buildTable(heroStats);

      const embed = new EmbedBuilder().setDescription('```\n' + table + '```');
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error('Error in /stats command:', err);
      await interaction.editReply(
        'There was an error while executing this command.',
      );
    }
  },
};
