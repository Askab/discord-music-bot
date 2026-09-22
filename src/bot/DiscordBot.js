const {
    Client,
    GatewayIntentBits,
} = require('discord.js');

const config = require('../config/config');
const EventHandler = require('./EventHandler');
const CommandHandler = require('../commands/CommandHandler');

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

        this.eventHandler = new EventHandler(this.client);
    }

    async start() {
        this.commandHandler.loadCommands();
        this.eventHandler.loadEvents();

        await this.client.login(config.discordToken);
    }
}

module.exports = DiscordBot;