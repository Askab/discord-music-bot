const {
    AttachmentBuilder,
    SlashCommandBuilder,
    MessageFlags
} = require('discord.js');

const {
    renderMusicPlayer
} = require('../../components/music/MusicPlayerCardRenderer');

const {
    createMusicPlayerButtons
} = require('../../components/music/MusicPlayerButtons');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('Show the currently playing track.'),

    async execute(interaction) {
        
        const musicManager =
            interaction.client.musicManager;

        const player =
            musicManager.getPlayer(
                interaction.guildId
            );

        if (!player || !player.currentTrack) {
            await interaction.reply({
                content:
                    'There is nothing currently playing. 🎵',
                flags: MessageFlags.Ephemeral
            });

            return;
        }

        const image =
            await renderMusicPlayer(player);

        const attachment =
            new AttachmentBuilder(
                image,
                {
                    name: 'music-player.png'
                }
            );

        const buttons =
            createMusicPlayerButtons(player);

        const message =
            await interaction.reply({
                files: [attachment],
                components: buttons,
                fetchReply: true
            });

        player.playerUpdater.setMessage(
            message
        );

        player.playerUpdater.start();
    }
};