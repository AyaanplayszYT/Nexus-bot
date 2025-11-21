const { EmbedBuilder } = require('discord.js');
const database = require('./database');

async function sendLog(options) {
    const { client, guildId, type, title, description, color = 0x2b2d31, fields = [] } = options;
    const config = database.getServerConfig(guildId);
    const channelId = type === 'mod' ? config.modLogChannelId : config.spamLogChannelId;
    if (!channelId) {
        return false;
    }

    const channel = await client.channels.fetch(channelId).catch(() => null);
    if (!channel) {
        return false;
    }

    const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color)
        .setTimestamp(new Date());

    fields.forEach(field => embed.addFields(field));

    await channel.send({ embeds: [embed] });
    return true;
}

module.exports = {
    sendLog,
};
