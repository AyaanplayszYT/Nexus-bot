const { Events } = require('discord.js');
const logger = require('../../utils/logger');
const database = require('../../utils/database');

module.exports = {
    name: Events.GuildBanAdd,
    async execute(ban) {
        if (ban.user.bot) {
            return;
        }

        await logger.sendLog({
            client: ban.client,
            guildId: ban.guild.id,
            type: 'mod',
            title: 'User Banned',
            description: `${ban.user.tag} was banned.`,
            color: 0x992d22,
            fields: [{ name: 'Reason', value: ban.reason || 'Not provided.' }],
        });
    },
};
