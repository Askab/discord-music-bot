const {
    REST,
    Routes
} = require('discord.js');

const config = require('../src/config/config');
const CommandHandler = require('../src/commands/CommandHandler');

async function deployCommands() {
    const commandHandler = new CommandHandler();

    commandHandler.loadCommands();

    const commands = Array.from(commandHandler.commands.values())
        .map(command => command.data.toJSON());

    console.log(`Deploying ${commands.length} commands...`);

    const rest = new REST({ version: '10' })
        .setToken(config.discordToken);

    try {
        await rest.put(
            Routes.applicationGuildCommands(
                config.clientId,
                config.guildId
            ),
            {
                body: commands
            }
        );

        console.log(`Successfully deployed ${commands.length} commands.`);
    } catch (error) {
        console.error('Failed to deploy commands:', error);
    }
}

deployCommands();