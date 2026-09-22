const { SlashCommandBuilder } = require('discord.js');
const { MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('Join a voice channel.'),

    async execute(interaction) {

        const member = interaction.member;
        const channel = member.voice.channel;

        if (!channel) {
            await interaction.reply({
                content: 'Join a voice channel! 🎤',
                ephemeral: MessageFlags.Ephemeral
            });

            return;
        }

        const musicManager = interaction.client.musicManager;

        const player = musicManager.getOrCreatePlayer(
            interaction.guild
        );

        try {
            await player.join(channel);

            await interaction.reply(
                `Connected to **${channel.name}** channel! 🎵`
            );

        } catch (error) {
            console.error('Failed to join voice channel:', error);

            await interaction.reply({
                content: 'Failed to join voice channel.',
                ephemeral: MessageFlags.Ephemeral
            });
        }
    }
};