const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const logger = require('../../utils/logger');
const database = require('../../utils/database');

module.exports = {
    category: 'Moderation',
    modOnly: true,
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a member from the server.')
        .addUserOption(option => option.setName('user').setDescription('Member to kick').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('Reason for the kick'))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .setDMPermission(false),
    async execute(interaction) {
        const target = interaction.options.getMember('user');
        const reason = interaction.options.getString('reason') || 'No reason provided.';

        if (!target) {
            return interaction.reply({ content: 'Unable to find that member.', ephemeral: true });
        }

        if (!target.kickable) {
            return interaction.reply({ content: 'I cannot kick that member.', ephemeral: true });
        }

        await target.kick(reason);

        await logger.sendLog({
            client: interaction.client,
            guildId: interaction.guildId,
            type: 'mod',
            title: 'Member Kicked',
            description: `${target.user.tag} was kicked by ${interaction.user.tag}.`,
            color: 0xf59e0b,
            fields: [{ name: 'Reason', value: reason }],
        });

        const responseEmbed = new EmbedBuilder()
            .setTitle('Kick Issued')
            .setColor(0xf59e0b)
            .setDescription(`**Target:** ${target.user.tag}\n**Moderator:** ${interaction.user.tag}`)
            .addFields({ name: 'Reason', value: reason })
            .setTimestamp();

        return interaction.reply({ embeds: [responseEmbed] });
    },
};
