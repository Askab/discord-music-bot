const {
    Client,
    GatewayIntentBits,
} = require('discord.js');

const config = require('../config/config');
const EventHandler = require('./EventHandler');
const CommandHandler = require('../commands/CommandHandler');
const MusicManager = require('../music/MusicManager');

class DiscordBot {

    constructor() {

        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildVoiceStates
            ]
        });

        this.commandHandler = new CommandHandler();
        this.client.commandHandler = this.commandHandler;

        this.musicManager = new MusicManager(this.client);
        this.client.musicManager = this.musicManager;

        this.eventHandler = new EventHandler(this.client);
    }

    async start() {
        this.commandHandler.loadCommands();
        this.eventHandler.loadEvents();

        await this.client.login(config.discordToken);
    }
}

module.exports = DiscordBot;