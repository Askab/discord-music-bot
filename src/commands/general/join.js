const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('Joins the voice channel'),

    async execute(interaction) {
        // command logic
    }
};