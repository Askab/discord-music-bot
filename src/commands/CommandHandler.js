const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');
const { MessageFlags } = require('discord.js');

const {
    handleMusicPlayerButton
} = require('../components/music/MusicPlayerButtons');

const {
    handleQueueButton
} = require('../components/music/QueueButtons');

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

        if (interaction.isButton()) {

            if (
                interaction.customId.startsWith('music_')
            ) {
                await handleMusicPlayerButton(
                    interaction
                );

                return;
            }

            if (
                interaction.customId.startsWith(
                    'queue_'
                )
            ) {
                return handleQueueButton(
                    interaction
                );
            }
        }

        if (interaction.isAutocomplete()) {
            const command =
                this.commands.get(
                    interaction.commandName
                );

            if (
                !command ||
                typeof command.autocomplete !== 'function'
            ) {
                return;
            }

            try {
                await command.autocomplete(
                    interaction
                );
            } catch (error) {
                console.error(
                    `Error handling autocomplete for "${interaction.commandName}":`,
                    error
                );

                await interaction
                    .respond([])
                    .catch(() => {});
            }

            return;
        }

        if (!interaction.isChatInputCommand()) {
            return;
        }

        const command =
            this.commands.get(
                interaction.commandName
            );

        if (!command) {
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(
                `Error executing command "${interaction.commandName}":`,
                error
            );

            const message = {
                content: 'An error occurred while executing this command.',
                flags: MessageFlags.Ephemeral
            };

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(message);
            } else {
                await interaction.reply(message);
            }
        }
    }
}

module.exports = CommandHandler;