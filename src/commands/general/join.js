const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('Belépteti a botot a voice channeledbe.'),

    async execute(interaction) {

        const member = interaction.member;
        const channel = member.voice.channel;

        if (!channel) {
            await interaction.reply({
                content: 'Join a voice channel! 🎤',
                ephemeral: true
            });

            return;
        }

        const musicManager = interaction.client.musicManager;

        const player = musicManager.getOrCreatePlayer(
            interaction.guild
        );

        try {
            await player.join(channel);

            await interaction.reply(
                `Connected to **${channel.name}** channel! 🎵`
            );

        } catch (error) {
            console.error('Failed to join voice channel:', error);

            await interaction.reply({
                content: 'Nem sikerült csatlakoznom a voice channelhez.',
                ephemeral: true
            });
        }
    }
};