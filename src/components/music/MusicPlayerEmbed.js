const {
    EmbedBuilder
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

    const remainingSeconds =
        totalSeconds % 60;

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

function getElapsedTime(player) {
    if (!player.currentTrackStartedAt) {
        return 0;
    }

    let elapsed =
        (Date.now() - player.currentTrackStartedAt) / 1000;

    elapsed -= player.pausedDuration / 1000;

    if (player.pausedAt) {
        elapsed -=
            (Date.now() - player.pausedAt) / 1000;
    }

    return Math.max(
        0,
        Math.min(
            player.currentTrack.duration,
            elapsed
        )
    );
}

function createMusicPlayerEmbed(player) {
    const track = player.currentTrack;

    if (!track) {
        return new EmbedBuilder()
            .setTitle('🎵 Shuriya FM')
            .setDescription(
                'Nothing is currently playing.'
            );
    }

    const elapsed =
        getElapsedTime(player);

    const progress =
        track.duration > 0
            ? elapsed / track.duration
            : 0;

    const isPaused =
        player.audioPlayer.state.status === 'paused';

    const status = isPaused
        ? '⏸️ Paused'
        : '▶️ Playing';

    const loopMode =
        player.loopMode ?? LoopMode.OFF;

    const loopLabel =
        LoopModeLabels[loopMode] ?? 'Off';

    const loopEmoji =
        LoopModeEmojis[loopMode] ?? '🔁';

    const progressBar =
        createProgressBar(progress);

    const queueSize =
        player.queue.size;

    const embed =
        new EmbedBuilder()
            .setTitle('🎵 Player 🎵')
            .setDescription(
                `### ${track.displayName}\n\n` +
                `${status}`
            )
            .addFields(
                {
                    name: 'Progress',
                    value:
                        `\`${progressBar}\`\n` +
                        `\`${formatDuration(elapsed)} / ${formatDuration(track.duration)}\``,
                    inline: false
                },
                {
                    name: 'Queue',
                    value:
                        `📋 ${queueSize} track${queueSize === 1 ? '' : 's'}`,
                    inline: true
                },
                {
                    name: 'Loop',
                    value:
                        `${loopEmoji} ${loopLabel}`,
                    inline: true
                }
            )
            .setTimestamp();

    if (track.artist) {
        embed.setFooter({
            text: track.artist
        });
    }

    return embed;
}

module.exports = {
    createMusicPlayerEmbed
};