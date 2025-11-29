import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  MessageFlags,
} from 'discord.js';
import dayjs from 'dayjs';
import UserModel from '../models/User';
import { getRecentMatches, getMatchDetails } from '../opendota';
import heroes from '../heroes';
import { formatMatchTable } from '../utils/table-formatter-helper';

export default {
  data: new SlashCommandBuilder()
    .setName('history')
    .setDescription('Get recent Dota 2 matches.'),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const discordId = interaction.user.id;

    const user = await UserModel.findOne({ discordId });
    if (!user) {
      await interaction.editReply(
        'User not found. Please link your Steam account first.\nUse `/link` command to link your account.',
      );
      return;
    }

    try {
      const matches = await getRecentMatches(user.steamId);
      if (!matches || matches.length === 0) {
        return interaction.editReply({
          content: 'No matches found or profile is private.',
        });
      }

      const options = matches.map((m: any) => {
        const date = dayjs(m.start_time * 1000).format('DD/MM/YYYY HH:mm');
        const hero = heroes.find((h) => h.id === m.hero_id)?.name || 'Unknown';

        const isRadiant = m.player_slot < 128;
        const win =
          (isRadiant && m.radiant_win) || (!isRadiant && !m.radiant_win);
        const result = win ? 'Win' : 'Loss';

        return new StringSelectMenuOptionBuilder()
          .setLabel(`${date} - ${hero} - ${result}`)
          .setDescription(
            `ID: ${m.match_id} | Duration: ${(m.duration / 60).toFixed(0)} mins`,
          )
          .setValue(m.match_id.toString());
      });

      const menuRow =
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId('match_select')
            .setPlaceholder('Select a match to see full table')
            .addOptions(options),
        );

      const msg = await interaction.editReply({
        content: `**Last 10 matches for ID:** ${user.username}`,
        components: [menuRow],
      });

      const collector = msg.createMessageComponentCollector({
        filter: (i) =>
          i.user.id === interaction.user.id && i.isStringSelectMenu(),
        time: 60000 * 5,
      });

      collector.on('collect', async (i) => {
        if (i.isStringSelectMenu()) {
          await i.deferUpdate();
          const matchId = i.values[0];

          try {
            const details = await getMatchDetails(matchId);
            const table = formatMatchTable(details);

            await i.editReply({
              content: `Match Details: ${matchId}\n${table}`,
              components: [menuRow],
            });
          } catch (err) {
            await i.followUp({
              content: 'Error fetching match details.',
              flags: MessageFlags.Ephemeral,
            });
          }
        }
      });

      collector.on('end', () => {
        interaction.editReply({ components: [] }).catch(() => {});
      });
    } catch (error) {
      console.error('Error fetching matches:', error);
      await interaction.editReply({
        content: 'Error fetching data from OpenDota.',
      });
    }
  },
};
