const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } = require('discord.js');
const database = require('../../utils/database');

module.exports = {
    category: 'Configuration',
    data: new SlashCommandBuilder()
        .setName('setspamlog')
        .setDescription('Set the channel where spam/auto-mod logs will be sent.')
        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('Text channel for spam logs')
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
            spamLogChannelId: channel.id,
        });

        const embed = new EmbedBuilder()
            .setTitle('Spam Log Channel Set')
            .setDescription(`Spam and auto-mod events will be delivered to ${channel}.`)
            .setColor(0xf1c40f)
            .setTimestamp();

        return interaction.reply({ embeds: [embed], ephemeral: true });
    },
};
