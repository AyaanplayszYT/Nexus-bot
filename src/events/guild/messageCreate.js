const { Events, Collection } = require('discord.js');
const database = require('../../utils/database');
const logger = require('../../utils/logger');
const { hasModeratorAccess } = require('../../utils/permissions');

const mentionLimit = Number(process.env.SPAM_MENTION_LIMIT || 5);
const defaultBannedWords = process.env.BANNED_WORDS ? process.env.BANNED_WORDS.split(',').map(word => word.trim().toLowerCase()).filter(Boolean) : [];
const userStrikeMap = new Collection();

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (!message.guild || message.author.bot) return;

        // Check if bot is mentioned
        if (message.mentions.has(message.client.user)) {
            await message.reply('https://tenor.com/view/zakir-naik-muslim-candles-fierce-point-gif-17453203').catch(() => null);
            return;
        }

        const reasons = [];
        const contentRaw = message.content || '';
        const massMention = contentRaw.includes('@everyone') || contentRaw.includes('@here');
        const mentionCount = message.mentions.users.size + message.mentions.roles.size;
        if (mentionCount >= mentionLimit) {
            reasons.push(`Mention spam (${mentionCount} mentions)`);
        }

        if (defaultBannedWords.length) {
            const contentLower = (message.content || '').toLowerCase();
            const matched = defaultBannedWords.find(word => word && contentLower.includes(word));
            if (matched) {
                reasons.push(`Blacklisted word detected (${matched})`);
            }
        }

        if (massMention) {
            reasons.push('Mass mention (@everyone/@here)');
        }

        if (!reasons.length) {
            return;
        }

        // Check if user has moderator access - if so, skip moderation
        let member = message.member;
        if (!member || !member.roles || !member.roles.cache) {
            member = await message.guild.members.fetch(message.author.id).catch(() => null);
        }
        if (member && hasModeratorAccess(member)) {
            return;
        }

        await message.delete().catch(() => null);

        const strikes = (userStrikeMap.get(message.author.id) || 0) + 1;
        userStrikeMap.set(message.author.id, strikes);
        const timeoutMs = Math.min(strikes * 5 * 60 * 1000, 60 * 60 * 1000);
        await message.member?.timeout(timeoutMs, `Auto-moderation triggered: ${reasons.join(', ')}`).catch(() => null);

        // Send DM to user
        const dmMessage = `**${message.author.username}**, your not allowed to ping. You have been muted. Your actions have been logged.`;
        await message.author.send(dmMessage).catch(() => null);

        const detail = `Reasons: ${reasons.join(', ')} | Strikes: ${strikes}`;
        if (massMention) {
            await logger.sendLog({
                client: message.client,
                guildId: message.guild.id,
                type: 'mod',
                title: 'Mass Mention Detected',
                description: `${message.author.tag} used @everyone/@here in #${message.channel.name}.`,
                color: 0xed4245,
                fields: [
                    { name: 'Action', value: `Timeout ${Math.round(timeoutMs / 60000)} minute(s)` },
                ],
            });
        } else {
            await logger.sendLog({
                client: message.client,
                guildId: message.guild.id,
                type: 'spam',
                title: 'Auto-Moderation Triggered',
                description: `${message.author.tag} triggered auto-moderation in #${message.channel.name}.`,
                color: 0xfcd34d,
                fields: [
                    { name: 'Reasons', value: reasons.join('\n') },
                    { name: 'Action', value: `Timeout ${Math.round(timeoutMs / 60000)} minute(s)` },
                ],
            });
        }
    },
};
