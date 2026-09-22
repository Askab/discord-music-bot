const {
    SlashCommandBuilder,
    MessageFlags
} = require('discord.js');

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

function createMessageChunks(lines, maxLength = 1900) {
    const chunks = [];
    let currentChunk = '';

    for (const line of lines) {
        const newChunk = currentChunk
            ? `${currentChunk}\n${line}`
            : line;

        if (newChunk.length > maxLength) {
            if (currentChunk) {
                chunks.push(currentChunk);
            }

            currentChunk = line;
        } else {
            currentChunk = newChunk;
        }
    }

    if (currentChunk) {
        chunks.push(currentChunk);
    }

    return chunks;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Megmutatja a lejátszási sort.'),

    async execute(interaction) {
        const musicManager = interaction.client.musicManager;

        const player = musicManager.getPlayer(
            interaction.guildId
        );

        if (!player) {
            await interaction.reply({
                content: 'A lejátszási sor üres. 🎵',
                flags: MessageFlags.Ephemeral
            });

            return;
        }

        const currentTrack = player.currentTrack;
        const queue = player.queue;

        if (!currentTrack && queue.size === 0) {
            await interaction.reply({
                content: 'A lejátszási sor üres. 🎵',
                flags: MessageFlags.Ephemeral
            });

            return;
        }

        const lines = [];

        // Jelenleg játszott track
        if (currentTrack) {
            let currentRemaining = currentTrack.duration;

            if (player.currentTrackStartedAt) {
                let elapsed =
                    (Date.now() - player.currentTrackStartedAt) / 1000;

                elapsed -= player.pausedDuration / 1000;

                if (player.pausedAt) {
                    elapsed -=
                        (Date.now() - player.pausedAt) / 1000;
                }

                currentRemaining = Math.max(
                    0,
                    currentTrack.duration - elapsed
                );
            }

            lines.push(
                `▶️ **${currentTrack.displayName}** — \`${formatDuration(currentRemaining)} hátra\``
            );
        }

        // Queue összes eleme
        queue.items.forEach((track, index) => {
            lines.push(
                `${index + 1}. **${track.displayName}** — \`${formatDuration(track.duration)}\``
            );
        });

        // Teljes hátralévő idő
        let remainingDuration = 0;

        if (
            currentTrack &&
            player.currentTrackStartedAt
        ) {
            const elapsed =
                (Date.now() - player.currentTrackStartedAt) / 1000;

            remainingDuration = Math.max(
                0,
                currentTrack.duration - elapsed
            );
        }

        for (const track of queue.items) {
            remainingDuration += track.duration;
        }

        const endTime = new Date(
            Date.now() + remainingDuration * 1000
        );

        const endTimeString = endTime.toLocaleTimeString(
            'hu-HU',
            {
                hour: '2-digit',
                minute: '2-digit'
            }
        );

        lines.push('');
        lines.push(
            `⏱️ **Time remaining:** ${formatDuration(remainingDuration)}`
        );
        lines.push(
            `🕐 **Estimated end:** ${endTimeString}`
        );

        // Feldaraboljuk Discord üzenetekre
        const chunks = createMessageChunks(lines);

        // Első üzenet
        await interaction.reply(
            `🎵 **Queue**\n\n${chunks[0]}`
        );

        // További üzenetek
        for (let i = 1; i < chunks.length; i++) {
            await interaction.followUp(
                `🎵 **Queue — continuation ${i + 1}/${chunks.length}**\n\n${chunks[i]}`
            );
        }
    }
};