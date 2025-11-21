const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const logger = require('../../utils/logger');
const database = require('../../utils/database');

module.exports = {
    category: 'Moderation',
    modOnly: true,
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Issue a warning to a member.')
        .addUserOption(option => option.setName('user').setDescription('Member to warn').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('Reason for the warning').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .setDMPermission(false),
    async execute(interaction) {
        const target = interaction.options.getMember('user');
        const reason = interaction.options.getString('reason');

        if (!target) {
            return interaction.reply({ content: 'Unable to find that member.', ephemeral: true });
        }

        await target.send(`You have been warned in **${interaction.guild.name}**. Reason: ${reason}`).catch(() => null);

        await logger.sendLog({
            client: interaction.client,
            guildId: interaction.guildId,
            type: 'mod',
            title: 'Member Warned',
            description: `${target.user.tag} was warned by ${interaction.user.tag}.`,
            color: 0xf97316,
            fields: [{ name: 'Reason', value: reason }],
        });

        const responseEmbed = new EmbedBuilder()
            .setTitle('Warning Issued')
            .setColor(0xf97316)
            .setDescription(`**Target:** ${target.user.tag}\n**Moderator:** ${interaction.user.tag}`)
            .addFields({ name: 'Reason', value: reason })
            .setTimestamp();

        return interaction.reply({ embeds: [responseEmbed], ephemeral: true });
    },
};
