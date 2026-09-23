const test = require('node:test');
const assert = require('node:assert/strict');

const {
    createMusicPlayerEmbed
} = require('../src/components/music/MusicPlayerEmbed');
const {
    createMusicPlayerButtons,
    handleMusicPlayerButton
} = require('../src/components/music/MusicPlayerButtons');
const {
    createQueueButtons,
    handleQueueButton
} = require('../src/components/music/QueueButtons');
const {
    renderMusicPlayer
} = require('../src/components/music/MusicPlayerCardRenderer');
const {
    renderQueueCard,
    TRACKS_PER_PAGE
} = require('../src/components/music/QueueCardRenderer');

function player(overrides = {}) {
    return {
        currentTrack: {
            title: 'Song',
            artist: 'Artist',
            displayName: 'Artist - Song',
            duration: 120,
            artwork: null
        },
        currentTrackStartedAt: Date.now(),
        pausedAt: null,
        pausedDuration: 0,
        audioPlayer: { state: { status: 'playing' } },
        queue: { size: 1, items: [] },
        loopMode: 'off',
        ...overrides
    };
}

test('music player embed renders empty and active states', () => {
    const empty = createMusicPlayerEmbed(player({ currentTrack: null }));
    const active = createMusicPlayerEmbed(player());
    const emptyData = empty.toJSON();
    const activeData = active.toJSON();

    assert.equal(emptyData.title, '🎵 Shuriya FM');
    assert.equal(emptyData.description, 'Nothing is currently playing.');
    assert.equal(activeData.title, '🎵 Player 🎵');
    assert.equal(activeData.fields[1].value, '📋 1 track');
    assert.equal(activeData.footer.text, 'Artist');
});

test('music player buttons reflect pause state', () => {
    const buttons = createMusicPlayerButtons(player()).at(0).components;
    const pausedButtons = createMusicPlayerButtons(
        player({ audioPlayer: { state: { status: 'paused' } } })
    ).at(0).components;

    assert.equal(buttons[0].toJSON().custom_id, 'music_pause');
    assert.equal(pausedButtons[0].toJSON().custom_id, 'music_resume');
    assert.equal(buttons[1].toJSON().custom_id, 'music_skip');
    assert.equal(buttons[3].toJSON().custom_id, 'music_loop');
});

test('music player button handler covers pause, shuffle, loop, and no player', async () => {
    const replies = [];
    const playerState = player({
        queue: {
            size: 2,
            randomize() {
                this.randomized = true;
            }
        },
        pause: () => true,
        loopMode: 'off'
    });
    const interaction = {
        customId: 'music_pause',
        guildId: 'guild-1',
        client: { musicManager: { getPlayer: () => playerState } },
        reply: async value => replies.push(value),
        update: async value => {
            interaction.updated = value;
        },
        deferUpdate: async () => {
            interaction.deferred = true;
        }
    };

    await handleMusicPlayerButton(interaction);
    assert.ok(interaction.updated);

    interaction.customId = 'music_shuffle';
    await handleMusicPlayerButton(interaction);
    assert.equal(playerState.queue.randomized, true);

    interaction.customId = 'music_loop';
    await handleMusicPlayerButton(interaction);
    assert.equal(playerState.loopMode, 'track');

    interaction.client.musicManager.getPlayer = () => undefined;
    await handleMusicPlayerButton(interaction);
    assert.match(replies.at(-1).content, /no active music player/i);
});

test('queue buttons expose pagination and disabled states', () => {
    const firstPage = createQueueButtons(
        { queue: { size: TRACKS_PER_PAGE + 1 } },
        0
    ).at(0).components.map(component => component.toJSON());

    assert.equal(firstPage[0].custom_id, 'queue_previous_0');
    assert.equal(firstPage[0].disabled, true);
    assert.equal(firstPage[1].disabled, false);
    assert.equal(firstPage[2].disabled, false);
});

test('queue button handler clamps pages and shuffles', async () => {
    const updates = [];
    const queue = {
        size: 21,
        items: Array.from(
            { length: 21 },
            (_, index) => ({
                displayName: `Track ${index + 1}`,
                duration: 60
            })
        ),
        randomize() {
            this.randomized = true;
        }
    };
    const playerState = { queue };
    const interaction = {
        customId: 'queue_next_99',
        guildId: 'guild-1',
        client: { musicManager: { getPlayer: () => playerState } },
        update: async value => updates.push(value),
        reply: async value => updates.push(value)
    };

    await handleQueueButton(interaction);
    assert.equal(updates.length, 1);
    assert.equal(updates[0].components[0].components[1].toJSON().custom_id, 'queue_next_2');

    interaction.customId = 'queue_shuffle_1';
    await handleQueueButton(interaction);
    assert.equal(queue.randomized, true);
});

test('music and queue renderers return PNG buffers', async () => {
    const active = player({
        queue: {
            size: 1,
            items: [{ displayName: 'Next <Song>', duration: 61 }]
        }
    });
    const empty = player({ currentTrack: null, queue: { size: 0, items: [] } });

    const musicImage = await renderMusicPlayer(active);
    const emptyMusicImage = await renderMusicPlayer(empty);
    const queueImage = await renderQueueCard(active, 0);

    assert.ok(Buffer.isBuffer(musicImage));
    assert.ok(Buffer.isBuffer(emptyMusicImage));
    assert.ok(Buffer.isBuffer(queueImage));
    assert.ok(musicImage.length > 100);
    assert.ok(queueImage.length > 100);
});