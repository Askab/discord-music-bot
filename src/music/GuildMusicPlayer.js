const {
    createAudioPlayer,
    joinVoiceChannel,
    VoiceConnectionStatus,
    AudioPlayerStatus,
    entersState
} = require('@discordjs/voice');

const Queue = require('./Queue');

class GuildMusicPlayer {

    constructor(guild, audioService) {
        this.guild = guild;
        this.guildId = guild.id;

        this.audioService = audioService;

        this.connection = null;
        this.channelId = null;

        this.audioPlayer = createAudioPlayer();

        this.queue = new Queue();
        this.currentTrack = null;
        this.currentTrackStartedAt = null;

        this.setupAudioPlayerEvents();
    }

    setupAudioPlayerEvents() {
        this.audioPlayer.on(
            AudioPlayerStatus.Playing,
            () => {
                console.log(
                    `[${this.guildId}] Audio playback started.`
                );
            }
        );

        this.audioPlayer.on(
            AudioPlayerStatus.Idle,
            () => {
                console.log(
                    `[${this.guildId}] Audio playback finished.`
                );

                this.playNext();
            }
        );

        this.audioPlayer.on(
            'error',
            error => {
                console.error(
                    `[${this.guildId}] Audio player error:`,
                    error
                );

                this.playNext();
            }
        );
    }

    async join(channel) {
        
        if (
            this.connection &&
            this.channelId === channel.id
        ) {
            return this.connection;
        }

        if (this.connection) {
            this.connection.destroy();
            this.connection = null;
        }

        this.connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: this.guildId,
            adapterCreator: this.guild.voiceAdapterCreator
        });

        this.connection.subscribe(this.audioPlayer);

        await entersState(
            this.connection,
            VoiceConnectionStatus.Ready,
            10_000
        );

        this.channelId = channel.id;

        return this.connection;
    }

    addTrack(track) {
        this.queue.add(track);

        if (!this.currentTrack) {
            this.playNext();
        }
    }

    playNext() {
        const track = this.queue.next();

        if (!track) {
            this.currentTrack = null;
            this.currentTrackStartedAt = null;

            console.log(
                `[${this.guildId}] Queue is empty.`
            );

            return;
        }

        this.currentTrack = track;
        this.currentTrackStartedAt = Date.now();

        console.log(
            `[${this.guildId}] Playing: ${track.displayName}`
        );

        const resource = this.audioService.createResource(
            track.fileName
        );

        this.audioPlayer.play(resource);
    }

    stop() {
        this.currentTrack = null;
        this.currentTrackStartedAt = null;

        this.queue.clear();

        this.audioPlayer.stop();
    }

    skip() {

        if (!this.currentTrack) {
            return false;
        }

        this.audioPlayer.stop();

        return true;
    }

    pause() {
        if (!this.currentTrack) {
            return false;
        }

        return this.audioPlayer.pause();
    }

    resume() {
        if (!this.currentTrack) {
            return false;
        }

        return this.audioPlayer.unpause();
    }

    leave() {
        if (!this.connection) {
            return;
        }

        this.stop();

        this.connection.destroy();
        this.connection = null;
        this.channelId = null;
    }
}

module.exports = GuildMusicPlayer;