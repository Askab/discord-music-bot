class Track {

    constructor({
        title,
        artist,
        album,
        duration,
        fileName,
        artwork
    }) {
        this.title = title;
        this.artist = artist;
        this.album = album;
        this.duration = duration;
        this.fileName = fileName;
        this.artwork = artwork ?? null;
    }

    get displayName() {
        if (this.artist && this.title) {
            return `${this.artist} - ${this.title}`;
        }

        return this.title;
    }
}

module.exports = Track;