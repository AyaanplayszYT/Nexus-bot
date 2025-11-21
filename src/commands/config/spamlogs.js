const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const database = require('../../utils/database');

module.exports = {
    category: 'Configuration',
    data: new SlashCommandBuilder()
        .setName('spamlogs')
        .setDescription('View the latest spam/auto-mod events recorded by the bot.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setDMPermission(false),
    async execute(interaction) {
        const logs = database.getLogs('spam', interaction.guildId, 10);
        if (!logs.length) {
            return interaction.reply({ content: 'No spam logs available yet.', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle('Recent Spam Logs')
            .setColor(0xf1c40f);

        logs.forEach(log => {
            embed.addFields({
                name: `${log.type} • ${log.user}`,
                value: `Detail: ${log.detail}\nAction: ${log.action || 'Logged'}\nTime: <t:${Math.floor(new Date(log.timestamp).getTime() / 1000)}:R>`,
            });
        });

        return interaction.reply({ embeds: [embed], ephemeral: true });
    },
};
