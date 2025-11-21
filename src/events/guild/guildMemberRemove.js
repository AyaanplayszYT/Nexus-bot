const { Events } = require('discord.js');
const logger = require('../../utils/logger');
const database = require('../../utils/database');

module.exports = {
    name: Events.GuildMemberRemove,
    async execute(member) {
        if (member.user?.bot) {
            return;
        }

        await logger.sendLog({
            client: member.client,
            guildId: member.guild.id,
            type: 'mod',
            title: 'Member Left',
            description: `${member.user?.tag || 'A member'} left the server.`,
            color: 0xed4245,
        });
    },
};
