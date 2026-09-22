const {
    SlashCommandBuilder,
    MessageFlags
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pause the currently playing track.'),

    async execute(interaction) {
        const musicManager = interaction.client.musicManager;

        const player = musicManager.getPlayer(
            interaction.guildId
        );

        if (!player || !player.currentTrack) {
            await interaction.reply({
                content: 'There is nothing currently playing. 🎵',
                flags: MessageFlags.Ephemeral
            });

            return;
        }

        if (player.audioPlayer.state.status === 'paused') {
            await interaction.reply({
                content: 'The track is already paused. ⏸️',
                flags: MessageFlags.Ephemeral
            });

            return;
        }

        const paused = player.pause();

        if (!paused) {
            await interaction.reply({
                content: 'Failed to pause the track.',
                flags: MessageFlags.Ephemeral
            });

            return;
        }

        await interaction.reply(
            `⏸️ Paused **${player.currentTrack.displayName}**.`
        );
    }
};