const { Events } = require('discord.js');
const logger = require('../../utils/logger');
const database = require('../../utils/database');

module.exports = {
    name: Events.MessageUpdate,
    async execute(oldMessage, newMessage) {
        if (!newMessage.guild || newMessage.author?.bot) return;

        if (oldMessage.partial) {
            try {
                await oldMessage.fetch();
            } catch (error) {
                console.error('Failed to fetch partial message:', error);
            }
        }

        if (oldMessage.content === newMessage.content) {
            return;
        }

        await logger.sendLog({
            client: newMessage.client,
            guildId: newMessage.guild.id,
            type: 'spam',
            title: 'Message Edited',
            description: `${newMessage.author?.tag || 'Unknown user'} edited a message in #${newMessage.channel?.name || 'unknown'}.`,
            fields: [
                { name: 'Before', value: oldMessage.content?.slice(0, 1024) || 'N/A' },
                { name: 'After', value: newMessage.content?.slice(0, 1024) || 'N/A' },
            ],
        });
    },
};
