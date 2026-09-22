const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');
const { MessageFlags } = require('discord.js');

class CommandHandler {

    constructor() {
        this.commands = new Collection();
    }

    loadCommands() {
        const commandsPath = path.join(__dirname);
        const commandFiles = this.getCommandFiles(commandsPath);

        for (const filePath of commandFiles) {
            const command = require(filePath);

            if (!command.data || !command.execute) {
                console.warn(`Skipping command without data/execute! File: ${filePath}`);
                continue;
            }

            this.commands.set(command.data.name, command);

            console.log(`Loaded command: ${command.data.name}`);
        }
    }

    getCommandFiles(directory) {
        const files = [];

        for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {

            const fullPath = path.join(directory, entry.name);

            if (entry.isDirectory()) {
                files.push(...this.getCommandFiles(fullPath));
                continue;
            }

            if (
                entry.isFile() &&
                entry.name.endsWith('.js') &&
                entry.name !== 'CommandHandler.js' &&
                entry.name !== 'index.js'
            ) {
                files.push(fullPath);
            }
        }

        return files;
    }

    async handle(interaction) {
        if (!interaction.isChatInputCommand()) {
            return;
        }

        const command = this.commands.get(interaction.commandName);

        if (!command) {
            console.warn(`Unknown command: ${interaction.commandName}`);
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {

            console.error(
                `Error executing command: ${interaction.commandName}`,
                error
            );

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    content: 'Error while executing command.',
                    ephemeral: MessageFlags.Ephemeral
                });
            } else {
                await interaction.reply({
                    content: 'Error while executing command.',
                    ephemeral: MessageFlags.Ephemeral
                });
            }
        }
    }
}

module.exports = CommandHandler;