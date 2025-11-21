const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType, AttachmentBuilder } = require('discord.js');
const database = require('../../utils/database');
const { generateWelcomeImage } = require('../../utils/welcome-generator');

module.exports = {
    category: 'Configuration',
    data: new SlashCommandBuilder()
        .setName('welcome')
        .setDescription('Configure welcome messages for new members.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setDMPermission(false)
        .addSubcommand(sc =>
            sc
                .setName('setchannel')
                .setDescription('Set the channel where welcome messages will be sent.')
                .addChannelOption(opt =>
                    opt
                        .setName('channel')
                        .setDescription('Text channel for welcomes')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true),
                ),
        )
        .addSubcommand(sc =>
            sc
                .setName('setmessage')
                .setDescription('Set the welcome message template.')
                .addStringOption(opt =>
                    opt
                        .setName('message')
                        .setDescription('Use {user} for mention, {server} for name')
                        .setRequired(true)
                        .setMaxLength(500),
                ),
        )
        .addSubcommand(sc =>
            sc
                .setName('toggle')
                .setDescription('Enable or disable welcome messages.')
                .addBooleanOption(opt => opt.setName('enabled').setDescription('Enable?').setRequired(true)),
        )
        .addSubcommand(sc => sc.setName('preview').setDescription('Preview the current welcome message.')),
    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const guildId = interaction.guildId;
        let cfg = database.getServerConfig(guildId);

        if (sub === 'setchannel') {
            const channel = interaction.options.getChannel('channel');
            cfg = database.setServerConfig(guildId, { welcomeChannelId: channel.id });
            return interaction.reply({
                embeds: [new EmbedBuilder().setTitle('Welcome Channel Set').setColor(0x57f287).setDescription(`Welcome messages will be sent to ${channel}.`).setTimestamp()],
                ephemeral: true,
            });
        }

        if (sub === 'setmessage') {
            const message = interaction.options.getString('message');
            cfg = database.setServerConfig(guildId, { welcomeMessage: message });
            return interaction.reply({
                embeds: [new EmbedBuilder().setTitle('Welcome Message Updated').setColor(0x57f287).setDescription(`Template saved.`).addFields({ name: 'Preview', value: message }).setTimestamp()],
                ephemeral: true,
            });
        }

        if (sub === 'toggle') {
            const enabled = interaction.options.getBoolean('enabled');
            cfg = database.setServerConfig(guildId, { welcomeEnabled: enabled });
            return interaction.reply({
                embeds: [new EmbedBuilder().setTitle('Welcome Toggled').setColor(enabled ? 0x57f287 : 0xed4245).setDescription(`Welcome messages are now ${enabled ? 'enabled' : 'disabled'}.`).setTimestamp()],
                ephemeral: true,
            });
        }

        // preview
        const user = interaction.user;
        const content = (cfg.welcomeMessage || '').replaceAll('{user}', `<@${user.id}>`).replaceAll('{server}', interaction.guild.name);
        
        await interaction.deferReply({ ephemeral: true });

        try {
            // Generate welcome image with user's avatar
            const image = await generateWelcomeImage(user);
            
            if (image) {
                const buffer = await image.toBuffer('image/png');
                const attachment = new AttachmentBuilder(buffer, { name: 'welcome-preview.png' });
                
                return await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Welcome Preview')
                            .setDescription(content || 'No welcome message set.')
                            .setImage('attachment://welcome-preview.png')
                            .setColor(0x5865f2)
                            .setTimestamp(),
                    ],
                    files: [attachment],
                });
            } else {
                return await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Welcome Preview')
                            .setDescription(content || 'No welcome message set.')
                            .setColor(0x5865f2)
                            .setTimestamp(),
                    ],
                });
            }
        } catch (error) {
            console.error('Welcome preview error:', error);
            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Welcome Preview')
                        .setDescription(content || 'No welcome message set.')
                        .setColor(0x5865f2)
                        .setTimestamp(),
                ],
            });
        }
    },
};
