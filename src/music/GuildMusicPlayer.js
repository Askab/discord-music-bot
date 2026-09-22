class GuildMusicPlayer {

    constructor(guildId) {
        this.guildId = guildId;

        this.queue = [];
        this.connection = null;
        this.audioPlayer = null;
    }

    async play() {
        // ...
    }

    pause() {
        // ...
    }

    resume() {
        // ...
    }

    skip() {
        // ...
    }

    stop() {
        // ...
    }
}

module.exports = GuildMusicPlayer;