/*require('dotenv').config();

const {
    Client,
    GatewayIntentBits,
    REST,
    Routes,
    SlashCommandBuilder
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ]
});

client.once('ready', () => {
    console.log(`Logged in as: ${client.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);*/


const DiscordBot = require('./bot/DiscordBot');

const bot = new DiscordBot();

bot.start();