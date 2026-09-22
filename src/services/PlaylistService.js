const fs = require('fs');
const path = require('path');

const Playlist = require('../music/Playlist');
const Track = require('../music/Track');

class PlaylistService {

    constructor(metadataService) {
        this.metadataService = metadataService;

        this.audioPath = path.join(
            process.cwd(),
            'audio'
        );

        this.playlists = new Map();
    }

    async loadPlaylists() {
        this.playlists.clear();

        const entries = fs.readdirSync(
            this.audioPath,
            {
                withFileTypes: true
            }
        );

        for (const entry of entries) {
            if (!entry.isDirectory()) {
                continue;
            }

            const playlist = await this.loadPlaylist(
                entry.name
            );

            this.playlists.set(
                playlist.name,
                playlist
            );
        }

        console.log(
            `Loaded ${this.playlists.size} playlists.`
        );
    }

    async loadPlaylist(name) {
        const playlist = new Playlist(name);

        const playlistPath = path.join(
            this.audioPath,
            name
        );

        const files = fs.readdirSync(
            playlistPath,
            {
                withFileTypes: true
            }
        );

        for (const file of files) {
            if (
                !file.isFile() ||
                path.extname(file.name).toLowerCase() !== '.mp3'
            ) {
                continue;
            }

            const relativePath = path.join(
                name,
                file.name
            );

            const metadata =
                await this.metadataService.read(
                    relativePath
                );

            const track = new Track(metadata);

            playlist.add(track);
        }

        console.log(
            `Loaded playlist "${playlist.name}" with ${playlist.size} tracks.`
        );

        return playlist;
    }

    getPlaylist(name) {
        return this.playlists.get(name);
    }

    getPlaylists() {
        return Array.from(
            this.playlists.values()
        );
    }
}

module.exports = PlaylistService;