const {
    ActivityType
} = require('discord.js');

class PresenceService {
    constructor(client) {
        this.client = client;
    }

    update(player) {
        if (!player.currentTrack) {
            this.client.user.setPresence({
                activities: [
                    {
                        name: 'Nothing is playing',
                        type: ActivityType.Listening
                    }
                ],
                status: 'online'
            });

            return;
        }

        const track =
            player.currentTrack;

        this.client.user.setPresence({
            activities: [
                {
                    name: `🎧 ` +track.displayName,
                    type: ActivityType.Listening
                }
            ],
            status: 'online'
        });
    }
}

module.exports = PresenceService;