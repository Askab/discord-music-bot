const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    MessageFlags
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cleanup')
        .setDescription('Delete all messages sent by the bot in this channel.')
        .setDefaultMemberPermissions(
            PermissionFlagsBits.ManageMessages
        ),

    async execute(interaction) {
        const channel = interaction.channel;
        const botId = interaction.client.user.id;

        if (!channel || !channel.isTextBased()) {
            await interaction.reply({
                content: 'This command can only be used in a text channel.',
                flags: MessageFlags.Ephemeral
            });

            return;
        }

        await interaction.deferReply({
            flags: MessageFlags.Ephemeral
        });

        let deletedCount = 0;
        let lastMessageId = null;

        while (true) {
            const options = {
                limit: 100
            };

            if (lastMessageId) {
                options.before = lastMessageId;
            }

            const messages =
                await channel.messages.fetch(options);

            if (messages.size === 0) {
                break;
            }

            const botMessages =
                messages.filter(
                    message => message.author.id === botId
                );

            for (const message of botMessages.values()) {
                try {
                    await message.delete();
                    deletedCount++;
                } catch (error) {
                    console.error(
                        `Failed to delete message ${message.id}:`,
                        error
                    );
                }
            }

            lastMessageId =
                messages.last().id;

            if (messages.size < 100) {
                break;
            }
        }

        await interaction.editReply(
            `🧹 Cleanup complete. Deleted ${deletedCount} bot message${deletedCount === 1 ? '' : 's'}.`
        );
    }
};