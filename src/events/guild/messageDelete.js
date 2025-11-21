const { Events } = require('discord.js');
const logger = require('../../utils/logger');
const database = require('../../utils/database');

module.exports = {
    name: Events.MessageDelete,
    async execute(message) {
        if (!message.guild || message.author?.bot) return;

        const content = message.content?.slice(0, 1024) || 'No text content';
        const attachments = [...(message.attachments?.values?.() ? message.attachments.values() : [])];
        const images = attachments.filter(att => (att.contentType && att.contentType.startsWith('image/')) || /\.(png|jpe?g|gif|webp)$/i.test(att.url));

        const fields = [{ name: 'Content', value: content }];
        if (attachments.length) {
            fields.push({ name: 'Attachments', value: attachments.map(a => a.name || a.url).slice(0, 5).join('\n') });
        }

        const sent = await logger.sendLog({
            client: message.client,
            guildId: message.guild.id,
            type: 'spam',
            title: 'Message Deleted',
            description: `${message.author?.tag || 'Unknown user'} had a message deleted in #${message.channel?.name || 'unknown'}.`,
            fields,
        });

        // If a spam-log channel is configured and there is at least one image, post the first image directly
        if (sent && images[0]) {
            const config = require('../../utils/database').getServerConfig(message.guild.id);
            const channelId = config.spamLogChannelId;
            if (channelId) {
                const ch = await message.client.channels.fetch(channelId).catch(() => null);
                if (ch) {
                    await ch.send({ content: images[0].url }).catch(() => null);
                }
            }
        }
    },
};
