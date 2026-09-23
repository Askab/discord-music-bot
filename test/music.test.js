const test = require('node:test');
const assert = require('node:assert/strict');

const Playlist = require('../src/music/Playlist');
const Queue = require('../src/music/Queue');
const Track = require('../src/music/Track');

test('Queue adds tracks and returns them in FIFO order', () => {
    const queue = new Queue();
    const first = { title: 'First' };
    const second = { title: 'Second' };

    queue.add(first);
    queue.add(second);

    assert.equal(queue.size, 2);
    assert.equal(queue.current, first);
    assert.equal(queue.next(), first);
    assert.equal(queue.next(), second);
    assert.equal(queue.next(), undefined);
    assert.equal(queue.size, 0);
});

test('Queue clear removes all tracks', () => {
    const queue = new Queue();
    queue.add({ title: 'Track' });

    queue.clear();

    assert.equal(queue.size, 0);
    assert.equal(queue.current, undefined);
});

test('Queue randomize preserves every track', () => {
    const queue = new Queue();
    const tracks = [
        { title: 'First' },
        { title: 'Second' },
        { title: 'Third' }
    ];

    tracks.forEach(track => queue.add(track));
    const originalRandom = Math.random;

    try {
        Math.random = () => 0;
        queue.randomize();
    } finally {
        Math.random = originalRandom;
    }

    assert.deepEqual(
        queue.items.slice().sort((left, right) =>
            left.title.localeCompare(right.title)
        ),
        tracks.slice().sort((left, right) =>
            left.title.localeCompare(right.title)
        )
    );
    assert.notDeepEqual(queue.items, tracks);
});

test('Playlist stores tracks and reports its size', () => {
    const playlist = new Playlist('radio');
    const track = { title: 'Track' };

    playlist.add(track);

    assert.equal(playlist.name, 'radio');
    assert.equal(playlist.size, 1);
    assert.equal(playlist.tracks[0], track);
});

test('Track displayName combines artist and title when both exist', () => {
    const track = new Track({
        title: 'Song',
        artist: 'Artist',
        album: 'Album',
        duration: 120,
        fileName: 'song.mp3'
    });

    assert.equal(track.displayName, 'Artist - Song');
    assert.equal(track.artwork, null);
});

test('Track displayName falls back to title without an artist', () => {
    const track = new Track({
        title: 'Song',
        artist: null,
        album: null,
        duration: 0,
        fileName: 'song.mp3'
    });

    assert.equal(track.displayName, 'Song');
});