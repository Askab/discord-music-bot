const { SlashCommandBuilder } = require('discord.js');
const { MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a song!'),

    async execute(interaction) {
        const channel = interaction.member.voice.channel;

        if (!channel) {
            await interaction.reply({
                content: 'First, join a voice channel! 🎤',
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

            player.addTrack('test.mp3');

            await interaction.reply(
                'Lejátszom a test.mp3-at! 🎵'
            );
        } catch (error) {
            console.error('Failed to play audio:', error);

            await interaction.reply({
                content: 'Nem sikerült lejátszani a hangot.',
                ephemeral: MessageFlags.Ephemeral
            });
        }
    }
};