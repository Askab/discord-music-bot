const {
    SlashCommandBuilder,
    MessageFlags
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shuffle')
        .setDescription('Shuffle the queued tracks.'),

    async execute(interaction) {
        const musicManager =
            interaction.client.musicManager;

        const player = musicManager.getPlayer(
            interaction.guildId
        );

        if (!player || player.queue.size === 0) {
            await interaction.reply({
                content: 'There are no queued tracks to shuffle. 🎵',
                flags: MessageFlags.Ephemeral
            });

            return;
        }

        const queueSize = player.queue.size;

        player.queue.randomize();

        await interaction.reply(
            `🔀 Shuffled **${queueSize} queued tracks**.`
        );
    }
};