const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

const {
    TRACKS_PER_PAGE,
    renderQueueCard
} = require('./QueueCardRenderer');

function createQueueButtons(
    player,
    page = 0
) {
    const totalPages =
        Math.max(
            1,
            Math.ceil(
                player.queue.size /
                TRACKS_PER_PAGE
            )
        );

    const previousButton =
        new ButtonBuilder()
            .setCustomId(
                `queue_previous_${page}`
            )
            .setEmoji('◀️')
            .setStyle(
                ButtonStyle.Secondary
            )
            .setDisabled(
                page <= 0
            );

    const nextButton =
        new ButtonBuilder()
            .setCustomId(
                `queue_next_${page}`
            )
            .setEmoji('▶️')
            .setStyle(
                ButtonStyle.Secondary
            )
            .setDisabled(
                page >= totalPages - 1
            );

    const shuffleButton =
        new ButtonBuilder()
            .setCustomId(
                `queue_shuffle_${page}`
            )
            .setEmoji('🔀')
            .setStyle(
                ButtonStyle.Secondary
            )
            .setDisabled(
                player.queue.size < 2
            );

    const refreshButton =
        new ButtonBuilder()
            .setCustomId(
                `queue_refresh_${page}`
            )
            .setEmoji('🔄')
            .setStyle(
                ButtonStyle.Secondary
            );

    return [
        new ActionRowBuilder()
            .addComponents(
                previousButton,
                nextButton,
                shuffleButton,
                refreshButton
            )
    ];
}

async function updateQueueMessage(
    interaction,
    player,
    page
) {
    const image =
        await renderQueueCard(
            player,
            page
        );

    await interaction.update({
        files: [
            {
                attachment: image,
                name: 'queue.png'
            }
        ],
        components:
            createQueueButtons(
                player,
                page
            )
    });
}

async function handleQueueButton(
    interaction
) {
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

    const parts =
        interaction.customId.split('_');

    const action =
        parts[1];

    const page =
        Number(parts[2]) || 0;

    if (action === 'previous') {
        await updateQueueMessage(
            interaction,
            player,
            Math.max(0, page - 1)
        );

        return;
    }

    if (action === 'next') {
        const totalPages =
            Math.max(
                1,
                Math.ceil(
                    player.queue.size /
                    TRACKS_PER_PAGE
                )
            );

        await updateQueueMessage(
            interaction,
            player,
            Math.min(
                totalPages - 1,
                page + 1
            )
        );

        return;
    }

    if (action === 'shuffle') {
        player.queue.randomize();

        await updateQueueMessage(
            interaction,
            player,
            page
        );

        return;
    }

    if (action === 'refresh') {
        await updateQueueMessage(
            interaction,
            player,
            page
        );
    }
}

module.exports = {
    createQueueButtons,
    handleQueueButton
};