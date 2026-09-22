module.exports = {
    name: 'interactionCreate',
    once: false,

    async execute(interaction) {
        //console.log(`Interaction received: ${interaction.commandName}`);

        await interaction.client.commandHandler.handle(interaction);
    }
};