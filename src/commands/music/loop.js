const {
    SlashCommandBuilder,
    MessageFlags
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Set the playback loop mode.')
        .addStringOption(option =>
            option
                .setName('mode')
                .setDescription('Select the loop mode.')
                .setRequired(true)
                .addChoices(
                    {
                        name: 'Off',
                        value: 'off'
                    },
                    {
                        name: 'Track',
                        value: 'track'
                    },
                    {
                        name: 'Queue',
                        value: 'queue'
                    }
                )
        ),

    async execute(interaction) {
        const musicManager =
            interaction.client.musicManager;

        const player = musicManager.getPlayer(
            interaction.guildId
        );

        if (!player) {
            await interaction.reply({
                content: 'There is no active music player. 🎵',
                flags: MessageFlags.Ephemeral
            });

            return;
        }

        const mode =
            interaction.options.getString('mode');

        player.loopMode = mode;

        const messages = {
            off: '🔁 Loop disabled.',
            track: '🔂 Track loop enabled.',
            queue: '🔁 Queue loop enabled.'
        };

        await interaction.reply(
            messages[mode]
        );
    }
};