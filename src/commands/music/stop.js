const {
    SlashCommandBuilder,
    MessageFlags
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stop playback and clear the queue.'),

    async execute(interaction) {
        const musicManager = interaction.client.musicManager;

        const player = musicManager.getPlayer(
            interaction.guildId
        );

        if (!player) {
            await interaction.reply({
                content: 'There is nothing playing. 🎵',
                flags: MessageFlags.Ephemeral
            });

            return;
        }

        if (
            !player.currentTrack &&
            player.queue.size === 0
        ) {
            await interaction.reply({
                content: 'There is nothing playing or queued. 🎵',
                flags: MessageFlags.Ephemeral
            });

            return;
        }

        player.stop();

        await interaction.reply(
            '⏹️ Playback stopped and the queue has been cleared.'
        );
    }
};