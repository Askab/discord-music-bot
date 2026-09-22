const {
    createAudioPlayer,
    joinVoiceChannel,
    VoiceConnectionStatus,
    entersState
} = require('@discordjs/voice');

class GuildMusicPlayer {

    constructor(guild) {
        this.guild = guild;
        this.guildId = guild.id;

        this.connection = null;
        this.audioPlayer = createAudioPlayer();
    }

    async join(channel) {
        if (this.connection) {
            this.connection.destroy();
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

        return this.connection;
    }

    leave() {
        if (!this.connection) {
            return;
        }

        this.connection.destroy();
        this.connection = null;
    }
}

module.exports = GuildMusicPlayer;