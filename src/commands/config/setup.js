const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } = require('discord.js');
const database = require('../../utils/database');

const presetChannels = [
    {
        key: 'modLogChannelId',
        name: 'nexus-mod-logs',
        topic: 'Moderation actions recorded by Nexus.',
        type: ChannelType.GuildText,
    },
    {
        key: 'spamLogChannelId',
        name: 'nexus-spam-logs',
        topic: 'Spam and auto-moderation events.',
        type: ChannelType.GuildText,
    },
    {
        key: 'aiChannelId',
        name: process.env.AI_CHANNEL_NAME || 'nexus-ai-lab',
        topic: 'Chat with the Nexus AI assistant.',
        type: ChannelType.GuildText,
    },
];

module.exports = {
    category: 'Configuration',
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Create recommended Nexus channels and wire up logging automatically.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setDMPermission(false),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const guild = interaction.guild;
        const summary = [];
        const updates = {};
        let config = database.getServerConfig(guild.id);

        for (const preset of presetChannels) {
            let channel = null;

            if (config[preset.key]) {
                channel = guild.channels.cache.get(config[preset.key]) || null;
            }

            if (!channel) {
                channel = guild.channels.cache.find(
                    c => c.name === preset.name && c.type === preset.type,
                );
            }

            if (!channel) {
                channel = await guild.channels.create({
                    name: preset.name,
                    type: preset.type,
                    topic: preset.topic,
                    reason: 'Nexus setup preset channel',
                });
                summary.push(`✅ Created ${channel}.`);
            } else {
                summary.push(`♻️ Reused ${channel}.`);
            }

            updates[preset.key] = channel.id;
        }

        const finalConfig = database.setServerConfig(guild.id, updates);

        const embed = new EmbedBuilder()
            .setTitle('Nexus Setup Complete')
            .setColor(0x57f287)
            .setDescription(summary.join('\n'))
            .addFields(
                { name: 'Mod Logs', value: `<#${finalConfig.modLogChannelId}>`, inline: true },
                { name: 'Spam Logs', value: `<#${finalConfig.spamLogChannelId}>`, inline: true },
                { name: 'AI Channel', value: `<#${finalConfig.aiChannelId}>`, inline: true },
            )
            .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
    },
};
