const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const PlaylistService = require('../src/services/PlaylistService');

test('PlaylistService loads MP3 tracks and ignores other files', async () => {
    const audioPath = fs.mkdtempSync(
        path.join(os.tmpdir(), 'discord-music-bot-audio-')
    );
    const playlistPath = path.join(audioPath, 'radio');

    fs.mkdirSync(playlistPath);
    fs.writeFileSync(path.join(playlistPath, 'Artist - Song.mp3'), 'audio');
    fs.writeFileSync(path.join(playlistPath, 'cover.jpg'), 'image');
    fs.mkdirSync(path.join(audioPath, 'empty'));

    const metadataService = {
        read: async fileName => ({
            title: fileName.includes('Artist') ? 'Song' : 'Other',
            artist: 'Artist',
            album: null,
            duration: 42,
            fileName,
            artwork: null
        })
    };
    const service = new PlaylistService(metadataService);
    service.audioPath = audioPath;

    try {
        await service.loadPlaylists();

        const radio = service.getPlaylist('radio');

        assert.equal(service.getPlaylists().length, 2);
        assert.equal(radio.size, 1);
        assert.equal(radio.tracks[0].fileName, path.join('radio', 'Artist - Song.mp3'));
        assert.equal(radio.tracks[0].displayName, 'Artist - Song');
        assert.equal(service.getPlaylist('missing'), undefined);
    } finally {
        fs.rmSync(audioPath, { recursive: true, force: true });
    }
});