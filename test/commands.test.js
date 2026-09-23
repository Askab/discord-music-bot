const test = require('node:test');
const assert = require('node:assert/strict');

const commands = [
    require('../src/commands/general/ping'),
    require('../src/commands/general/join'),
    require('../src/commands/general/leave'),
    require('../src/commands/general/cleanup'),
    require('../src/commands/music/play'),
    require('../src/commands/music/playlist'),
    require('../src/commands/music/queue'),
    require('../src/commands/music/nowplaying'),
    require('../src/commands/music/pause'),
    require('../src/commands/music/resume'),
    require('../src/commands/music/skip'),
    require('../src/commands/music/stop'),
    require('../src/commands/music/shuffle'),
    require('../src/commands/music/loop')
];

function interaction(overrides = {}) {
    const replies = [];

    return {
        guildId: 'guild-1',
        guild: { id: 'guild-1' },
        member: { voice: { channel: null } },
        client: {
            user: { id: 'bot-1' },
            musicManager: {
                getPlayer: () => undefined,
                getOrCreatePlayer: () => undefined,
                removePlayer: () => false,
                playlistService: {
                    getPlaylists: () => [],
                    getPlaylist: () => undefined
                },
                metadataService: {
                    read: async () => ({})
                }
            }
        },
        options: {
            getSubcommand: () => 'list',
            getString: () => undefined,
            getFocused: () => ''
        },
        channel: null,
        replies,
        reply: async value => replies.push(value),
        deferReply: async () => {},
        editReply: async value => replies.push(value),
        respond: async value => replies.push(value),
        ...overrides
    };
}

test('every slash command exports data and execute', () => {
    for (const command of commands) {
        assert.equal(typeof command.data.toJSON, 'function');
        assert.equal(typeof command.execute, 'function');
    }
});

test('ping replies with Pong', async () => {
    const current = interaction();
    await commands[0].execute(current);

    assert.equal(current.replies[0], 'Pong! 🏓');
});

test('join and play reject users outside a voice channel', async () => {
    const current = interaction();

    await commands[1].execute(current);
    assert.match(current.replies[0].content, /voice channel/i);

    current.replies.length = 0;
    await commands[4].execute(current);
    assert.match(current.replies[0].content, /voice channel/i);
});

test('leave, queue, nowplaying, pause, resume, skip, stop, shuffle, and loop handle missing players', async () => {
    for (const index of [2, 6, 7, 8, 9, 10, 11, 12, 13]) {
        const current = interaction();
        await commands[index].execute(current);
        assert.ok(current.replies.length > 0, `command ${index} did not reply`);
    }
});

test('playlist autocomplete filters and formats choices', async () => {
    const current = interaction({
        options: {
            getFocused: () => 'ch'
        }
    });
    current.client.musicManager.playlistService.getPlaylists = () => [
        { name: 'chill_mix' },
        { name: 'radio' }
    ];

    await commands[5].autocomplete(current);

    assert.deepEqual(current.replies[0], [
        { name: 'Chill Mix', value: 'chill_mix' }
    ]);
});

test('playlist list and play add tracks to a player', async () => {
    const track = {
        displayName: 'Artist - Song',
        fileName: 'song.mp3'
    };
    const playlist = {
        name: 'chill_mix',
        size: 1,
        tracks: [track]
    };
    const player = {
        queue: {
            randomize() {
                this.randomized = true;
            }
        },
        join: async () => {},
        addTrack: value => {
            player.added = value;
        }
    };
    const current = interaction({
        member: { voice: { channel: { name: 'Lounge' } } },
        options: {
            getSubcommand: () => 'list',
            getString: () => 'chill_mix',
            getFocused: () => ''
        }
    });
    current.client.musicManager.playlistService.getPlaylists = () => [playlist];
    current.client.musicManager.playlistService.getPlaylist = () => playlist;
    current.client.musicManager.getOrCreatePlayer = () => player;

    await commands[5].execute(current);
    assert.match(current.replies[0], /Chill Mix/);

    current.replies.length = 0;
    current.options.getSubcommand = () => 'play';
    await commands[5].execute(current);
    assert.equal(player.added, track);
    assert.equal(player.queue.randomized, true);
    assert.match(current.replies[0], /has been added/);
});

test('play, join, and playback commands use the player on success', async () => {
    const track = {
        displayName: 'Artist - Song',
        fileName: 'test.mp3'
    };
    const player = {
        currentTrack: track,
        audioPlayer: { state: { status: 'playing' } },
        queue: { size: 1, randomize() {} },
        join: async () => {},
        addTrack: value => {
            player.added = value;
        },
        pause: () => true,
        resume: () => true,
        skip: () => true,
        stop: () => {
            player.stopped = true;
        },
        loopMode: 'off'
    };
    const current = interaction({
        member: { voice: { channel: { name: 'Lounge' } } }
    });
    current.client.musicManager.getPlayer = () => player;
    current.client.musicManager.getOrCreatePlayer = () => player;
    current.client.musicManager.metadataService.read = async () => ({
        title: 'Song',
        artist: 'Artist',
        album: null,
        duration: 10,
        fileName: 'test.mp3'
    });

    await commands[1].execute(current);
    await commands[4].execute(current);
    assert.equal(player.added.displayName, 'Artist - Song');

    await commands[8].execute(current);
    current.options.getSubcommand = () => 'unused';
    player.audioPlayer.state.status = 'paused';
    await commands[9].execute(current);
    await commands[10].execute(current);
    await commands[11].execute(current);
    await commands[12].execute(current);

    assert.equal(player.stopped, true);
    assert.ok(current.replies.length >= 7);
});

test('cleanup deletes only bot messages and reports the count', async () => {
    const deleted = [];
    const messages = new Map([
        ['1', { id: '1', author: { id: 'bot-1' }, delete: async () => deleted.push('1') }],
        ['2', { id: '2', author: { id: 'user-1' }, delete: async () => deleted.push('2') }]
    ]);
    messages.filter = predicate => new Map(
        [...messages].filter(([, message]) => predicate(message))
    );
    messages.last = () => [...messages.values()].at(-1);
    const current = interaction({
        channel: {
            isTextBased: () => true,
            messages: {
                fetch: async () => messages
            }
        }
    });

    await commands[3].execute(current);

    assert.deepEqual(deleted, ['1']);
    assert.match(current.replies.at(-1), /Deleted 1 bot message/);
});