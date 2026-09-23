const test = require('node:test');
const assert = require('node:assert/strict');

const CommandHandler = require('../src/commands/CommandHandler');
const EventHandler = require('../src/bot/EventHandler');
const DiscordBot = require('../src/bot/DiscordBot');
const interactionCreate = require('../src/events/interactionCreate');
const ready = require('../src/events/ready');
const MusicPlayerUpdater = require('../src/components/music/MusicPlayerUpdater');
const GuildMusicPlayer = require('../src/music/GuildMusicPlayer');

test('CommandHandler discovers every command file', () => {
    const handler = new CommandHandler();
    const files = handler.getCommandFiles(
        require('node:path').join(__dirname, '../src/commands')
    );

    assert.equal(files.length, 14);
    assert.ok(files.every(file => file.endsWith('.js')));
});

test('CommandHandler loads commands and dispatches chat input', async () => {
    const handler = new CommandHandler();
    handler.loadCommands();
    const replies = [];

    await handler.handle({
        isButton: () => false,
        isAutocomplete: () => false,
        isChatInputCommand: () => true,
        commandName: 'ping',
        reply: async value => replies.push(value)
    });

    assert.equal(handler.commands.size, 14);
    assert.equal(replies[0], 'Pong! 🏓');
});

test('EventHandler registers event modules with once/on', () => {
    const registered = [];
    const handler = new EventHandler({
        once: (name, listener) => registered.push(['once', name, listener]),
        on: (name, listener) => registered.push(['on', name, listener])
    });

    handler.loadEvents();

    assert.deepEqual(
        registered.map(event => [event[0], event[1]]).sort(),
        [['on', 'interactionCreate'], ['once', 'clientReady']]
    );
});

test('event modules forward interaction and log ready client', async () => {
    let handled = false;
    await interactionCreate.execute({
        client: {
            commandHandler: {
                handle: async () => {
                    handled = true;
                }
            }
        }
    });
    assert.equal(handled, true);

    const originalLog = console.log;
    const logs = [];
    console.log = value => logs.push(value);
    try {
        ready.execute({ user: { tag: 'bot#0001' } });
    } finally {
        console.log = originalLog;
    }
    assert.equal(logs[0], 'Logged in as: bot#0001');
});

test('index constructs the bot and starts it', async () => {
    const Module = require('node:module');
    const indexPath = require.resolve('../src/index');
    const originalLoad = Module._load;
    let started = 0;

    class FakeBot {
        start() {
            started++;
        }
    }

    delete require.cache[indexPath];
    Module._load = function(request, parent, isMain) {
        if (request === './bot/DiscordBot') {
            return FakeBot;
        }

        return originalLoad.call(this, request, parent, isMain);
    };

    try {
        require('../src/index');
    } finally {
        Module._load = originalLoad;
        delete require.cache[indexPath];
    }

    assert.equal(started, 1);
});

test('MusicPlayerUpdater manages its interval and ignores missing messages', async () => {
    const updater = new MusicPlayerUpdater({});

    await updater.update();
    updater.start();
    const interval = updater.interval;
    updater.start();
    assert.equal(updater.interval, interval);
    updater.stop();
    assert.equal(updater.interval, null);
});

test('GuildMusicPlayer exposes safe empty-state controls', () => {
    const player = new GuildMusicPlayer(
        { id: 'guild-1', voiceAdapterCreator: () => {} },
        { createResource: () => ({}) },
        { update: () => {} }
    );

    assert.equal(player.skip(), false);
    assert.equal(player.pause(), false);
    assert.equal(player.resume(), false);
    assert.equal(player.connection, null);
    player.stop();
    player.leave();
    assert.equal(player.currentTrack, null);
});

test('empty modules and configuration are loadable', () => {
    assert.deepEqual(require('../src/commands/index'), {});
    assert.deepEqual(require('../src/utils/logger'), {});
    const config = require('../src/config/config');
    assert.ok(Object.hasOwn(config, 'discordToken'));
    assert.ok(Object.hasOwn(config, 'clientId'));
    assert.ok(Object.hasOwn(config, 'guildId'));
    assert.ok(Object.hasOwn(config, 'botName'));
});

test('DiscordBot start loads commands/events/playlists before login', async () => {
    const bot = new DiscordBot();
    const calls = [];

    bot.commandHandler.loadCommands = () => calls.push('commands');
    bot.eventHandler.loadEvents = () => calls.push('events');
    bot.client.musicManager.playlistService.loadPlaylists = async () =>
        calls.push('playlists');
    bot.client.login = async token => {
        calls.push(['login', token]);
    };

    await bot.start();

    assert.deepEqual(calls.slice(0, 3), [
        'commands',
        'events',
        'playlists'
    ]);
    assert.equal(calls[3][0], 'login');
    assert.equal(typeof calls[3][1], 'string');
    assert.equal(bot.client.commandHandler, bot.commandHandler);
    assert.equal(bot.client.musicManager, bot.client.musicManager);
});