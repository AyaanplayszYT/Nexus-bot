const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const logger = require('../../utils/logger');
const database = require('../../utils/database');

module.exports = {
    category: 'Moderation',
    modOnly: true,
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a member from the server.')
        .addUserOption(option => option.setName('user').setDescription('Member to ban').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('Reason for the ban'))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .setDMPermission(false),
    async execute(interaction) {
        const target = interaction.options.getMember('user');
        const reason = interaction.options.getString('reason') || 'No reason provided.';

        if (!target) {
            return interaction.reply({ content: 'Unable to find that member.', ephemeral: true });
        }

        if (!target.bannable) {
            return interaction.reply({ content: 'I cannot ban that member.', ephemeral: true });
        }

        await target.ban({ reason });

        await logger.sendLog({
            client: interaction.client,
            guildId: interaction.guildId,
            type: 'mod',
            title: 'Member Banned',
            description: `${target.user.tag} was banned by ${interaction.user.tag}.`,
            color: 0xeb4034,
            fields: [{ name: 'Reason', value: reason }],
        });

        const responseEmbed = new EmbedBuilder()
            .setTitle('Ban Issued')
            .setColor(0xeb4034)
            .setDescription(`**Target:** ${target.user.tag}\n**Moderator:** ${interaction.user.tag}`)
            .addFields({ name: 'Reason', value: reason })
            .setTimestamp();

        return interaction.reply({ embeds: [responseEmbed] });
    },
};
