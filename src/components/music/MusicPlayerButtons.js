const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

const {
    LoopMode,
    LoopModeEmojis
} = require('../../constants/LoopMode');

const {
    createMusicPlayerEmbed
} = require('./MusicPlayerEmbed');

function createMusicPlayerButtons(player) {
    const isPaused =
        player.audioPlayer.state.status === 'paused';

    const playbackButton =
        new ButtonBuilder()
            .setCustomId(
                isPaused
                    ? 'music_resume'
                    : 'music_pause'
            )
            .setEmoji(
                isPaused
                    ? '▶️'
                    : '⏸️'
            )
            .setStyle(ButtonStyle.Primary);

    const skipButton =
        new ButtonBuilder()
            .setCustomId('music_skip')
            .setEmoji('⏭️')
            .setStyle(ButtonStyle.Secondary);

    const shuffleButton =
        new ButtonBuilder()
            .setCustomId('music_shuffle')
            .setEmoji('🔀')
            .setStyle(ButtonStyle.Secondary);

    const loopButton =
        new ButtonBuilder()
            .setCustomId('music_loop')
            .setEmoji(
                LoopModeEmojis[player.loopMode] ?? '🔁'
            )
            .setStyle(ButtonStyle.Secondary);

    return [
        new ActionRowBuilder()
            .addComponents(
                playbackButton,
                skipButton,
                shuffleButton,
                loopButton
            )
    ];
}

async function updateMusicPlayer(interaction, player) {
    const embed =
        createMusicPlayerEmbed(player);

    const buttons =
        createMusicPlayerButtons(player);

    await interaction.update({
        embeds: [embed],
        components: buttons
    });
}

async function handleMusicPlayerButton(interaction) {
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
            ephemeral: true
        });

        return;
    }

    switch (interaction.customId) {
        case 'music_pause':
            await handlePause(
                interaction,
                player
            );
            break;

        case 'music_resume':
            await handleResume(
                interaction,
                player
            );
            break;

        case 'music_skip':
            await handleSkip(
                interaction,
                player
            );
            break;

        case 'music_shuffle':
            await handleShuffle(
                interaction,
                player
            );
            break;

        case 'music_loop':
            await handleLoop(
                interaction,
                player
            );
            break;
    }
}

async function handlePause(interaction, player) {
    const paused = player.pause();

    if (!paused) {
        await interaction.reply({
            content:
                'Nothing is currently playing.',
            ephemeral: true
        });

        return;
    }

    await updateMusicPlayer(
        interaction,
        player
    );
}

async function handleResume(interaction, player) {
    const resumed = player.resume();

    if (!resumed) {
        await interaction.reply({
            content:
                'Playback is not paused.',
            ephemeral: true
        });

        return;
    }

    await updateMusicPlayer(
        interaction,
        player
    );
}

async function handleSkip(interaction, player) {
    const skipped = player.skip();

    if (!skipped) {
        await interaction.reply({
            content:
                'Nothing is currently playing.',
            ephemeral: true
        });

        return;
    }

    /*await updateMusicPlayer(
        interaction,
        player
    );*/

    await interaction.deferUpdate();
}

async function handleShuffle(interaction, player) {
    if (player.queue.size < 2) {
        await interaction.reply({
            content:
                'There are not enough tracks in the queue to shuffle.',
            ephemeral: true
        });

        return;
    }

    player.queue.randomize();

    await updateMusicPlayer(
        interaction,
        player
    );
}

async function handleLoop(interaction, player) {
    const modes = [
        LoopMode.OFF,
        LoopMode.TRACK,
        LoopMode.QUEUE
    ];

    const currentIndex =
        modes.indexOf(player.loopMode);

    const nextIndex =
        (currentIndex + 1) % modes.length;

    player.loopMode =
        modes[nextIndex];

    await updateMusicPlayer(
        interaction,
        player
    );
}

module.exports = {
    createMusicPlayerButtons,
    handleMusicPlayerButton
};