import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
} from 'discord.js';
import { upsertUser } from '../db';

export default {
  data: new SlashCommandBuilder()
    .setName('link')
    .setDescription('Link your Discord account to your Steam account.')
    .addStringOption((option) =>
      option
        .setName('steamid')
        .setDescription('Your Steam ID.')
        .setRequired(true),
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const steamId = interaction.options.getString('steamid', true);
    const discordId = interaction.user.id;
    const discordUsername = interaction.user.username;

    try {
      upsertUser(discordId, steamId, discordUsername);

      await interaction.reply({
        content: `Successfully linked Steam ID ${steamId} to your Discord account!`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error('Error linking accounts:', error);
      await interaction.reply({
        content:
          'There was an error linking your accounts. Please try again later.',
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};