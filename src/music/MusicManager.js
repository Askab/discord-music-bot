const GuildMusicPlayer = require('./GuildMusicPlayer');
const AudioService = require('../services/AudioService');
const MetadataService = require('../services/MetadataService');
const PlaylistService = require('../services/PlaylistService');

class MusicManager {

    constructor(client) {
        this.client = client;

        this.players = new Map();
        this.audioService = new AudioService();
        this.metadataService = new MetadataService();
        this.playlistService = new PlaylistService(
            this.metadataService
        );
    }

    getPlayer(guildId) {
        return this.players.get(guildId);
    }

    createPlayer(guild) {

        const player = new GuildMusicPlayer(
            guild,
            this.audioService
        );

        this.players.set(guild.id, player);

        return player;
    }

    getOrCreatePlayer(guild) {
        return this.getPlayer(guild.id)
            ?? this.createPlayer(guild);
    }

    removePlayer(guildId) {
        const player = this.players.get(guildId);

        if (!player) {
            return false;
        }

        player.leave();
        this.players.delete(guildId);

        return true;
    }
}

module.exports = MusicManager;