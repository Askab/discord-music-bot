const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays a song'),

    async execute(interaction) {
        // command logic

        const musicManager = interaction.client.musicManager;

        await musicManager.play(
            interaction.guildId,
            interaction
        );
    }
};