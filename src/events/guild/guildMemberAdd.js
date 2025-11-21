const { Events } = require('discord.js');
const logger = require('../../utils/logger');
const database = require('../../utils/database');
const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { generateWelcomeImage } = require('../../utils/welcome-generator');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        if (member.user.bot) {
            return;
        }

        const autoRoleId = process.env.AUTO_ROLE_ID;
        if (autoRoleId) {
            const role = member.guild.roles.cache.get(autoRoleId);
            if (role) {
                await member.roles.add(role).catch(() => null);
            }
        }

        await logger.sendLog({
            client: member.client,
            guildId: member.guild.id,
            type: 'mod',
            title: 'Member Joined',
            description: `${member.user.tag} joined the server.`,
            color: 0x57f287,
        });

        // Welcome message with image
        const cfg = database.getServerConfig(member.guild.id);
        if (cfg.welcomeEnabled && cfg.welcomeChannelId) {
            const ch = member.guild.channels.cache.get(cfg.welcomeChannelId) || (await member.guild.channels.fetch(cfg.welcomeChannelId).catch(() => null));
            if (ch) {
                try {
                    // Generate welcome image with user avatar
                    const image = await generateWelcomeImage(member.user);
                    if (image) {
                        const buffer = await image.toBuffer('image/png');
                        const attachment = new AttachmentBuilder(buffer, { name: 'welcome.png' });
                        const text = (cfg.welcomeMessage || 'Welcome to the server, {user}!')
                            .replaceAll('{user}', `<@${member.id}>`)
                            .replaceAll('{server}', member.guild.name);
                        const emb = new EmbedBuilder()
                            .setTitle('Welcome!')
                            .setDescription(text)
                            .setImage('attachment://welcome.png')
                            .setColor(0x57f287)
                            .setTimestamp();
                        await ch.send({ embeds: [emb], files: [attachment] }).catch(() => null);
                    } else {
                        // Fallback to text-only welcome if image generation fails
                        const text = (cfg.welcomeMessage || 'Welcome to the server, {user}!')
                            .replaceAll('{user}', `<@${member.id}>`)
                            .replaceAll('{server}', member.guild.name);
                        const emb = new EmbedBuilder()
                            .setTitle('Welcome!')
                            .setDescription(text)
                            .setThumbnail(member.user.displayAvatarURL())
                            .setColor(0x57f287)
                            .setTimestamp();
                        await ch.send({ embeds: [emb] }).catch(() => null);
                    }
                } catch (error) {
                    console.error('Error sending welcome message:', error);
                }
            }
        }
    },
};
