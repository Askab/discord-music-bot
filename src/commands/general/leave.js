const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Leaves the voice channel.'),

    async execute(interaction) {
        const musicManager = interaction.client.musicManager;

        const removed = musicManager.removePlayer(
            interaction.guildId
        );

        if (!removed) {
            await interaction.reply({
                content: 'Not connected to a voice channel. 🤷',
            });

            return;
        }

        await interaction.reply(
            'I\'m leaving the voice channel now...👋'
        );
    }
};