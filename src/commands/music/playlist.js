const {
    SlashCommandBuilder,
    MessageFlags
} = require('discord.js');

const {
    capitalizeWords
} = require('../../utils/StringUtils');

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
                .setDescription('Play a playlist.')
                .addStringOption(option =>
                    option
                        .setName('name')
                        .setDescription('Select a playlist.')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
        ),

    async autocomplete(interaction) {
        const musicManager =
            interaction.client.musicManager;

        const playlists =
            musicManager.playlistService.getPlaylists();

        const focusedValue =
            interaction.options
                .getFocused()
                .toLowerCase();

        const choices = playlists
            .filter(playlist =>
                playlist.name
                    .toLowerCase()
                    .includes(focusedValue)
            )
            .slice(0, 25)
            .map(playlist => ({
                name: capitalizeWords(playlist.name),
                value: playlist.name
            }));

        await interaction.respond(choices);
    },

    async execute(interaction) {
        const musicManager =
            interaction.client.musicManager;

        const subcommand =
            interaction.options.getSubcommand();

        if (subcommand === 'list') {
            const playlists =
                musicManager.playlistService.getPlaylists();

            if (playlists.length === 0) {
                await interaction.reply({
                    content: 'No playlists are available. 🎵',
                    flags: MessageFlags.Ephemeral
                });

                return;
            }

            const lines = playlists.map(
                (playlist, index) =>
                    `${index + 1}. **${capitalizeWords(playlist.name)}** — ` +
                    `${playlist.size} track${playlist.size === 1 ? '' : 's'}`
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
                    content: `Playlist not found: **${playlistName}**`,
                    flags: MessageFlags.Ephemeral
                });

                return;
            }

            const channel =
                interaction.member.voice.channel;

            if (!channel) {
                await interaction.reply({
                    content: 'Join a voice channel first! 🎤',
                    flags: MessageFlags.Ephemeral
                });

                return;
            }

            const player =
                musicManager.getOrCreatePlayer(
                    interaction.guild
                );

            try {
                await player.join(channel);

                for (const track of playlist.tracks) {
                    player.addTrack(track);
                }

                //Shuffle
                player.queue.randomize();

                await interaction.reply(
                    `🎵 **${capitalizeWords(playlist.name)}** ` +
                    `playlist has been added to the queue. ` +
                    `(${playlist.size} track${playlist.size === 1 ? '' : 's'})`
                );
            } catch (error) {
                console.error(
                    'Failed to play playlist:',
                    error
                );

                await interaction.reply({
                    content: 'Failed to start the playlist.',
                    flags: MessageFlags.Ephemeral
                });
            }
        }
    }
};