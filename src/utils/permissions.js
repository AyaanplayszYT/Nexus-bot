const { PermissionFlagsBits } = require('discord.js');
const database = require('./database');

const MOD_PERMISSION_CHECKS = [
    PermissionFlagsBits.Administrator,
    PermissionFlagsBits.ManageGuild,
    PermissionFlagsBits.KickMembers,
    PermissionFlagsBits.BanMembers,
    PermissionFlagsBits.ModerateMembers,
    PermissionFlagsBits.ManageMessages,
];

function getEnvModeratorRoles() {
    return (process.env.MOD_ROLE_IDS || '')
        .split(',')
        .map(id => id.trim())
        .filter(Boolean);
}

function hasModeratorAccess(member) {
    if (!member) {
        return false;
    }

    if (MOD_PERMISSION_CHECKS.some(perm => member.permissions?.has(perm))) {
        return true;
    }

    const config = database.getServerConfig(member.guild.id);
    const configuredRoles = new Set([...(config.modRoleIds || []), ...getEnvModeratorRoles()]);

    if (!configuredRoles.size) {
        return false;
    }

    return member.roles.cache.some(role => configuredRoles.has(role.id));
}

module.exports = {
    hasModeratorAccess,
};
