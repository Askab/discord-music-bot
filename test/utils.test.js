const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
    LoopMode,
    LoopModeLabels,
    LoopModeEmojis
} = require('../src/constants/LoopMode');
const MetadataService = require('../src/services/MetadataService');
const {
    getPlaylistNames
} = require('../src/utils/PlaylistUtils');
const {
    capitalizeWords
} = require('../src/utils/StringUtils');

test('capitalizeWords normalizes separators and whitespace', () => {
    assert.equal(
        capitalizeWords('  late_night-radio  mix '),
        'Late Night Radio Mix'
    );
});

test('getPlaylistNames returns directories but ignores files', () => {
    const directory = fs.mkdtempSync(
        path.join(os.tmpdir(), 'discord-music-bot-')
    );

    try {
        fs.mkdirSync(path.join(directory, 'radio'));
        fs.mkdirSync(path.join(directory, 'chill'));
        fs.writeFileSync(path.join(directory, 'README.txt'), 'ignored');

        assert.deepEqual(
            getPlaylistNames(directory).sort(),
            ['chill', 'radio']
        );
    } finally {
        fs.rmSync(directory, { recursive: true, force: true });
    }
});

test('MetadataService.cleanFileName removes extension and normalizes underscores', () => {
    const service = new MetadataService();

    assert.equal(
        service.cleanFileName('radio/Artist__-_Song.mp3'),
        'Artist - Song'
    );
});

test('LoopMode exposes stable values and labels', () => {
    assert.deepEqual(LoopMode, {
        OFF: 'off',
        TRACK: 'track',
        QUEUE: 'queue'
    });
    assert.equal(LoopModeLabels[LoopMode.TRACK], 'Track');
    assert.equal(LoopModeEmojis[LoopMode.QUEUE], '🔁');
});