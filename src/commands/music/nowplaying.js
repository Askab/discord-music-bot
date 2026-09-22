const {
    SlashCommandBuilder,
    MessageFlags
} = require('discord.js');

const {
    LoopMode,
    LoopModeLabels,
    LoopModeEmojis
} = require('../../constants/LoopMode');

function formatDuration(seconds) {
    const totalSeconds = Math.max(
        0,
        Math.round(seconds)
    );

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor(
        (totalSeconds % 3600) / 60
    );
    const remainingSeconds = totalSeconds % 60;

    if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    }

    return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
}

function createProgressBar(progress, length = 20) {
    const clampedProgress = Math.min(
        1,
        Math.max(0, progress)
    );

    const filled = Math.round(
        clampedProgress * length
    );

    return '█'.repeat(filled) +
        '░'.repeat(length - filled);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('Show the currently playing track.'),

    async execute(interaction) {
        const musicManager =
            interaction.client.musicManager;

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

        const track = player.currentTrack;

        let elapsed = 0;

        if (player.currentTrackStartedAt) {
            elapsed =
                (Date.now() - player.currentTrackStartedAt) / 1000;

            elapsed -= player.pausedDuration / 1000;

            if (player.pausedAt) {
                elapsed -=
                    (Date.now() - player.pausedAt) / 1000;
            }
        }

        elapsed = Math.max(
            0,
            Math.min(track.duration, elapsed)
        );

        const progress =
            track.duration > 0
                ? elapsed / track.duration
                : 0;

        const isPaused =
            player.audioPlayer.state.status === 'paused';

        const status = isPaused
            ? '⏸️ Paused'
            : '▶️ Playing';

        const queueSize = player.queue.size;

        /**
         * Loop Mode
         */
        const loopMode =
            player.loopMode ?? LoopMode.OFF;

        const loopLabel =
            LoopModeLabels[loopMode];

        const loopEmoji =
            LoopModeEmojis[loopMode];

        const progressBar =
            createProgressBar(progress);

        await interaction.reply(
            `🎵 **Now Playing**\n\n` +
            `${status}\n` +
            `**${track.displayName}**\n\n` +
            `\`${progressBar}\`\n` +
            `⏱️ \`${formatDuration(elapsed)} / ${formatDuration(track.duration)}\`\n\n` +
            `📋 **Queue:** ${queueSize} track${queueSize === 1 ? '' : 's'}` +
            `\n🔁 **Loop:** ${loopEmoji} ${loopLabel}`
        );
    }
};