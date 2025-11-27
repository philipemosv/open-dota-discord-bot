import { SlashCommandBuilder, ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import UserModel from '../models/User';

export default {
    data: new SlashCommandBuilder()
        .setName('wl')
        .setDescription('Get win/loss record for a player.')
        .addIntegerOption(option =>
            option
                .setName('period')
                .setDescription('Days to look back for matches (0-365)')
                .setRequired(true)
                .setMinValue(0)
                .setMaxValue(365)
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            const period = interaction.options.getInteger('period', true);
            const discordId = interaction.user.id;

            const user = await UserModel.findOne({ discordId });
            if (!user) {
                await interaction.editReply('User not found. Please link your Steam account first.\nUse `/link` command to link your account.');
                return;
            }

            const url = new URL(`https://api.opendota.com/api/players/${user.steamId}/wl`);
            url.searchParams.append('date', String(period));
            url.searchParams.append('lobby_type', '7');

            const res = await fetch(url);
            if (!res.ok) {
                console.error('OpenDota API error:', res.status, res.statusText);
                await interaction.editReply('Error fetching data from OpenDota API.');
                return;
            }

            const data = await res.json();
            const winrate = data.win + data.lose === 0 ? 0 : (data.win / (data.win + data.lose)) * 100;

            const replyMessage = `**W:** ${data.win} | **L:** ${data.lose} | **WR%:** ${winrate.toFixed(2)}%`;
            await interaction.editReply(replyMessage);
        } catch (err) {
            console.error('Error in /wl command:', err);
            await interaction.editReply('There was an error while executing this command.');
        }
    }
};