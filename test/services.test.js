const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const AudioService = require('../src/services/AudioService');
const MetadataService = require('../src/services/MetadataService');
const MusicManager = require('../src/music/MusicManager');
const PresenceService = require('../src/services/PresenceService');

test('AudioService reports missing audio files', () => {
    assert.throws(
        () => new AudioService().createResource('missing.mp3'),
        /Audio file not found/
    );
});

test('MetadataService reads metadata from a real audio fixture', async () => {
    const service = new MetadataService();
    const directory = fs.mkdtempSync(
        path.join(os.tmpdir(), 'discord-music-bot-metadata-')
    );
    const filePath = path.join(directory, 'not-audio.mp3');

    fs.writeFileSync(filePath, 'not an mp3');
    const originalCwd = process.cwd();

    try {
        process.chdir(directory);
        await assert.rejects(
            service.read('not-audio.mp3')
        );
    } finally {
        process.chdir(originalCwd);
        fs.rmSync(directory, { recursive: true, force: true });
    }
});

test('PresenceService reports idle and active playback', () => {
    const calls = [];
    const service = new PresenceService({
        user: {
            setPresence: presence => calls.push(presence)
        }
    });

    service.update({ currentTrack: null });
    service.update({
        currentTrack: {
            displayName: 'Artist - Song'
        }
    });

    assert.equal(calls.length, 2);
    assert.equal(calls[0].activities[0].name, 'Nothing is playing');
    assert.equal(calls[1].activities[0].name, '🎧 Artist - Song');
    assert.equal(calls[1].status, 'online');
});

test('MusicManager creates, reuses, and removes guild players', () => {
    const manager = new MusicManager({ user: {} });
    const guild = {
        id: 'guild-1',
        voiceAdapterCreator: () => {}
    };

    const first = manager.getOrCreatePlayer(guild);
    const second = manager.getOrCreatePlayer(guild);

    assert.equal(first, second);
    assert.equal(manager.getPlayer(guild.id), first);
    assert.equal(manager.removePlayer('missing'), false);

    first.leave = () => {
        first.left = true;
    };

    assert.equal(manager.removePlayer(guild.id), true);
    assert.equal(first.left, true);
    assert.equal(manager.getPlayer(guild.id), undefined);
});