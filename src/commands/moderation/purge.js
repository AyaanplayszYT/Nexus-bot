const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const logger = require('../../utils/logger');
const database = require('../../utils/database');

module.exports = {
    category: 'Moderation',
    modOnly: true,
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Bulk delete recent messages in the current channel.')
        .addIntegerOption(option =>
            option
                .setName('amount')
                .setDescription('Number of messages to delete (max 100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100),
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .setDMPermission(false),
    async execute(interaction) {
        const amount = interaction.options.getInteger('amount');
        await interaction.deferReply({ ephemeral: true });

        const deleted = await interaction.channel.bulkDelete(amount, true);

        await logger.sendLog({
            client: interaction.client,
            guildId: interaction.guildId,
            type: 'mod',
            title: 'Messages Purged',
            description: `${interaction.user.tag} deleted ${deleted.size} message(s) in #${interaction.channel.name}.`,
            color: 0x10b981,
        });

        const responseEmbed = new EmbedBuilder()
            .setTitle('Messages Purged')
            .setColor(0x10b981)
            .addFields(
                { name: 'Channel', value: `#${interaction.channel.name}`, inline: true },
                { name: 'Deleted', value: `${deleted.size}`, inline: true },
            )
            .setFooter({ text: `Moderator: ${interaction.user.tag}` })
            .setTimestamp();

        return interaction.editReply({ embeds: [responseEmbed] });
    },
};
