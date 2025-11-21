const { Events } = require('discord.js');
const logger = require('../../utils/logger');

module.exports = {
    name: Events.ChannelDelete,
    async execute(channel) {
        if (!channel.guild) return;

        await logger.sendLog({
            client: channel.client,
            guildId: channel.guild.id,
            type: 'mod',
            title: 'Channel Deleted',
            description: `Channel #${channel.name} was deleted.`,
            color: 0xed4245,
            fields: [
                { name: 'Channel Type', value: channel.type || 'Unknown' },
                { name: 'Channel ID', value: channel.id },
            ],
        });
    },
};
