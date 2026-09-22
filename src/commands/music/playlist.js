const {
    SlashCommandBuilder,
    MessageFlags
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('playlist')
        .setDescription('Handle playlists.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List playlists.')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('play')
                .setDescription('Plays the given playlist.')
                .addStringOption(option =>
                    option
                        .setName('name')
                        .setDescription('The playlist\'s name.')
                        .setRequired(true)
                )
        ),

    async execute(interaction) {
        const musicManager = interaction.client.musicManager;

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'list') {
            const playlists =
                musicManager.playlistService.getPlaylists();

            if (playlists.length === 0) {
                await interaction.reply({
                    content: 'Nincsenek elérhető playlist-ek. 🎵',
                    flags: MessageFlags.Ephemeral
                });

                return;
            }

            const lines = playlists.map(
                (playlist, index) =>
                    `${index + 1}. **${playlist.name}** — ${playlist.size} track`
            );

            await interaction.reply(
                `🎵 **Playlists**\n\n${lines.join('\n')}`
            );

            return;
        }

        if (subcommand === 'play') {
            const playlistName =
                interaction.options.getString('name');

            const playlist =
                musicManager.playlistService.getPlaylist(
                    playlistName
                );

            if (!playlist) {
                await interaction.reply({
                    content: `Nem találom ezt a playlist-et: **${playlistName}**`,
                    flags: MessageFlags.Ephemeral
                });

                return;
            }

            const channel = interaction.member.voice.channel;

            if (!channel) {
                await interaction.reply({
                    content: 'Előbb lépj be egy voice channelbe! 🎤',
                    flags: MessageFlags.Ephemeral
                });

                return;
            }

            const player = musicManager.getOrCreatePlayer(
                interaction.guild
            );

            try {
                await player.join(channel);

                for (const track of playlist.tracks) {
                    player.addTrack(track);
                }

                await interaction.reply(
                    `🎵 **${playlist.name}** playlist hozzáadva a lejátszási sorhoz. ` +
                    `(${playlist.size} track)`
                );
            } catch (error) {
                console.error(
                    'Failed to play playlist:',
                    error
                );

                await interaction.reply({
                    content: 'Nem sikerült elindítani a playlist-et.',
                    flags: MessageFlags.Ephemeral
                });
            }
        }
    }
};