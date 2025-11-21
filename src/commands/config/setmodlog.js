const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } = require('discord.js');
const database = require('../../utils/database');

module.exports = {
    category: 'Configuration',
    data: new SlashCommandBuilder()
        .setName('setmodlog')
        .setDescription('Set the channel where moderation logs will be sent.')
        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('Text channel for moderation logs')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true),
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setDMPermission(false),
    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        const current = database.getServerConfig(interaction.guildId);
        database.setServerConfig(interaction.guildId, {
            ...current,
            modLogChannelId: channel.id,
        });

        const embed = new EmbedBuilder()
            .setTitle('Moderation Log Channel Set')
            .setDescription(`Logs will be delivered to ${channel}.`)
            .setColor(0x57f287)
            .setTimestamp();

        return interaction.reply({ embeds: [embed], ephemeral: true });
    },
};
