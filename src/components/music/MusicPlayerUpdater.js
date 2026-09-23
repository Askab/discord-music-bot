const {
    AttachmentBuilder
} = require('discord.js');

const {
    renderMusicPlayer
} = require('./MusicPlayerCardRenderer');

const {
    createMusicPlayerButtons
} = require('./MusicPlayerButtons');

const UPDATE_INTERVAL = 5_000;

class MusicPlayerUpdater {
    
    constructor(player) {
        this.player = player;
        this.message = null;
        this.interval = null;
        this.isUpdating = false;
    }

    setMessage(message) {
        this.message = message;
    }

    start() {
        if (this.interval) {
            return;
        }

        this.interval = setInterval(
            () => this.update(),
            UPDATE_INTERVAL
        );
    }

    stop() {
        if (!this.interval) {
            return;
        }

        clearInterval(this.interval);
        this.interval = null;
    }

    async update() {
        if (
            !this.message ||
            this.isUpdating
        ) {
            return;
        }

        this.isUpdating = true;

        try {
            const image =
                await renderMusicPlayer(
                    this.player
                );

            const attachment =
                new AttachmentBuilder(
                    image,
                    {
                        name: 'music-player.png'
                    }
                );

            const buttons =
                createMusicPlayerButtons(
                    this.player
                );

            await this.message.edit({
                embeds: [],
                files: [attachment],
                components: buttons
            });
        } catch (error) {
            console.error(
                'Failed to update music player:',
                error
            );
        } finally {
            this.isUpdating = false;
        }
    }
}

module.exports = MusicPlayerUpdater;