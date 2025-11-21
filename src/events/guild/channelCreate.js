const { Events } = require('discord.js');
const logger = require('../../utils/logger');

module.exports = {
    name: Events.ChannelCreate,
    async execute(channel) {
        if (!channel.guild) return;

        await logger.sendLog({
            client: channel.client,
            guildId: channel.guild.id,
            type: 'mod',
            title: 'Channel Created',
            description: `Channel #${channel.name} was created.`,
            color: 0x57f287,
            fields: [
                { name: 'Channel Type', value: channel.type || 'Unknown' },
                { name: 'Channel ID', value: channel.id },
            ],
        });
    },
};
