const {
    SlashCommandBuilder,
    MessageFlags
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Resume the paused track.'),

    async execute(interaction) {
        const musicManager = interaction.client.musicManager;

        const player = musicManager.getPlayer(
            interaction.guildId
        );

        if (!player || !player.currentTrack) {
            await interaction.reply({
                content: 'There is nothing to resume. 🎵',
                flags: MessageFlags.Ephemeral
            });

            return;
        }

        if (player.audioPlayer.state.status !== 'paused') {
            await interaction.reply({
                content: 'The track is not paused. ▶️',
                flags: MessageFlags.Ephemeral
            });

            return;
        }

        const resumed = player.resume();

        if (!resumed) {
            await interaction.reply({
                content: 'Failed to resume the track.',
                flags: MessageFlags.Ephemeral
            });

            return;
        }

        await interaction.reply(
            `▶️ Resumed **${player.currentTrack.displayName}**.`
        );
    }
};