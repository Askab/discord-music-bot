class Playlist {

    constructor(name, tracks = []) {
        this.name = name;
        this.tracks = tracks;
    }

    add(track) {
        this.tracks.push(track);
    }

    remove(track) {
        // később
    }

    randomize() {
        // később
    }

    get size() {
        return this.tracks.length;
    }
}

module.exports = Playlist;