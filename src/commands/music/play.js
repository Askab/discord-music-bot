const { SlashCommandBuilder } = require('discord.js');
const { MessageFlags } = require('discord.js');
const Track = require('../../music/Track');

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

            const metadata =
                await musicManager.metadataService.read(
                    'test.mp3'
                );

            const track = new Track(metadata);

            player.addTrack(track);

            await interaction.reply(
                `🎵 **${track.displayName}** inserted into the playlist!`
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