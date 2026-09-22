const {
    SlashCommandBuilder,
    MessageFlags
} = require('discord.js');

const {
    LoopMode,
    LoopModeLabels,
    LoopModeEmojis
} = require('../../constants/LoopMode');

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
                        name: LoopModeLabels[LoopMode.OFF],
                        value: LoopMode.OFF
                    },
                    {
                        name: LoopModeLabels[LoopMode.TRACK],
                        value: LoopMode.TRACK
                    },
                    {
                        name: LoopModeLabels[LoopMode.QUEUE],
                        value: LoopMode.QUEUE
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

        const loopMode =
            interaction.options.getString('mode');

        player.loopMode = loopMode;

        if (loopMode === LoopMode.OFF) {
            await interaction.reply(
                `${LoopModeEmojis[loopMode]} Loop disabled.`
            );

            return;
        }

        await interaction.reply(
            `${LoopModeEmojis[loopMode]} ` +
            `${LoopModeLabels[loopMode]} loop enabled.`
        );
    }
};