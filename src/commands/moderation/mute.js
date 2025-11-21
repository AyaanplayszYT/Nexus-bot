const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const logger = require('../../utils/logger');
const database = require('../../utils/database');

module.exports = {
    category: 'Moderation',
    modOnly: true,
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Temporarily timeout a member.')
        .addUserOption(option => option.setName('user').setDescription('Member to timeout').setRequired(true))
        .addIntegerOption(option =>
            option
                .setName('duration')
                .setDescription('Duration in minutes (1-4320)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(4320),
        )
        .addStringOption(option => option.setName('reason').setDescription('Reason for the timeout'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .setDMPermission(false),
    async execute(interaction) {
        const target = interaction.options.getMember('user');
        const durationMinutes = interaction.options.getInteger('duration');
        const reason = interaction.options.getString('reason') || 'No reason provided.';

        if (!target) {
            return interaction.reply({ content: 'Unable to find that member.', ephemeral: true });
        }

        if (!target.moderatable) {
            return interaction.reply({ content: 'I cannot timeout that member.', ephemeral: true });
        }

        const durationMs = durationMinutes * 60 * 1000;
        await target.timeout(durationMs, reason);

        await logger.sendLog({
            client: interaction.client,
            guildId: interaction.guildId,
            type: 'mod',
            title: 'Member Timed Out',
            description: `${target.user.tag} was timed out for ${durationMinutes} minute(s).`,
            color: 0x3b82f6,
            fields: [{ name: 'Reason', value: reason }],
        });

        const responseEmbed = new EmbedBuilder()
            .setTitle('Timeout Applied')
            .setColor(0x3b82f6)
            .setDescription(`**Target:** ${target.user.tag}\n**Moderator:** ${interaction.user.tag}`)
            .addFields(
                { name: 'Duration', value: `${durationMinutes} minute(s)`, inline: true },
                { name: 'Reason', value: reason, inline: false },
            )
            .setTimestamp();

        return interaction.reply({ embeds: [responseEmbed] });
    },
};
