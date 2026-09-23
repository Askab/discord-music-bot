const {
    AttachmentBuilder,
    SlashCommandBuilder,
    MessageFlags
} = require('discord.js');

const {
    renderQueueCard
} = require('../../components/music/QueueCardRenderer');

const {
    createQueueButtons
} = require('../../components/music/QueueButtons');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription(
            'Show the current music queue.'
        ),

    async execute(interaction) {
        const musicManager =
            interaction.client.musicManager;

        const player =
            musicManager.getPlayer(
                interaction.guildId
            );

        if (!player) {
            await interaction.reply({
                content:
                    'There is no active music player. 🎵',
                flags: MessageFlags.Ephemeral
            });

            return;
        }

        const image =
            await renderQueueCard(
                player,
                0
            );

        const attachment =
            new AttachmentBuilder(
                image,
                {
                    name: 'queue.png'
                }
            );

        const buttons =
            createQueueButtons(
                player,
                0
            );

        await interaction.reply({
            files: [attachment],
            components: buttons
        });
    }
};