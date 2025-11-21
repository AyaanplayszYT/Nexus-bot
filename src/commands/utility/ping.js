const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    category: 'Utility',
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with bot latency info.'),
    async execute(interaction) {
        const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        const apiLatency = Math.round(interaction.client.ws.ping);
        await interaction.editReply(`Pong! Latency: ${latency}ms | API: ${apiLatency}ms`);
    },
};
