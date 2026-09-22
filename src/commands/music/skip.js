const {
    SlashCommandBuilder,
    MessageFlags
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skips the currently playing track.'),

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

        const skippedTrack = player.currentTrack;

        const skipped = player.skip();

        if (!skipped) {
            await interaction.reply({
                content: 'There is nothing to skip. 🎵',
                flags: MessageFlags.Ephemeral
            });

            return;
        }

        await interaction.reply(
            `⏭️ Skipped **${skippedTrack.displayName}**.`
        );
    }
};