const {
    SlashCommandBuilder,
    MessageFlags
} = require('discord.js');

const {
    createMusicPlayerEmbed
} = require('../../components/music/MusicPlayerEmbed');

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

        const embed =
            createMusicPlayerEmbed(player);

        const buttons =
            createMusicPlayerButtons(player);

        await interaction.reply({
            embeds: [embed],
            components: buttons
        });
    }
};