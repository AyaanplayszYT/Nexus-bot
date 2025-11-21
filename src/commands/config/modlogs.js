const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const database = require('../../utils/database');

module.exports = {
    category: 'Configuration',
    data: new SlashCommandBuilder()
        .setName('modlogs')
        .setDescription('View the latest moderation actions recorded by the bot.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .setDMPermission(false),
    async execute(interaction) {
        const logs = database.getLogs('mod', interaction.guildId, 10);
        if (!logs.length) {
            return interaction.reply({ content: 'No moderation logs available yet.', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle('Recent Moderation Logs')
            .setColor(0xed4245);

        logs.forEach(log => {
            embed.addFields({
                name: `${log.action} • ${log.target}`,
                value: `Moderator: **${log.moderator}**\nReason: ${log.reason || 'N/A'}\nTime: <t:${Math.floor(new Date(log.timestamp).getTime() / 1000)}:R>`,
            });
        });

        return interaction.reply({ embeds: [embed], ephemeral: true });
    },
};
