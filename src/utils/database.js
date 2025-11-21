const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', '..', 'data');
const dataFile = path.join(dataDir, 'storage.json');
const DEFAULT_CONFIG = Object.freeze({
    modLogChannelId: null,
    spamLogChannelId: null,
    aiChannelId: null,
    modRoleIds: [],
    coloredRoleIds: [],
    welcomeEnabled: true,
    welcomeChannelId: null,
    welcomeMessage: 'Welcome to the server, {user}! Please read the rules.',
    rulesType: 'normal',
});

function ensureStore() {
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(dataFile)) {
        fs.writeFileSync(dataFile, JSON.stringify({ servers: {} }, null, 2));
    }
}

function readStore() {
    ensureStore();
    const raw = fs.readFileSync(dataFile, 'utf8');
    return JSON.parse(raw);
}

function writeStore(data) {
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

function getServerConfig(guildId) {
    const data = readStore();
    return { ...DEFAULT_CONFIG, ...(data.servers[guildId] || {}) };
}

function setServerConfig(guildId, config) {
    const data = readStore();
    const existing = { ...DEFAULT_CONFIG, ...(data.servers[guildId] || {}) };
    const next = { ...existing, ...config };
    next.modRoleIds = [...new Set((next.modRoleIds || []).map(id => String(id)))];
    data.servers[guildId] = next;
    writeStore(data);
    return next;
}

function addModRole(guildId, roleId) {
    if (!roleId) {
        return getServerConfig(guildId);
    }
    const config = getServerConfig(guildId);
    const modRoleIds = [...new Set([...(config.modRoleIds || []), roleId])];
    return setServerConfig(guildId, { modRoleIds });
}

function removeModRole(guildId, roleId) {
    if (!roleId) {
        return getServerConfig(guildId);
    }
    const config = getServerConfig(guildId);
    const modRoleIds = (config.modRoleIds || []).filter(id => id !== roleId);
    return setServerConfig(guildId, { modRoleIds });
}

function addColoredRole(guildId, roleId) {
    if (!roleId) {
        return getServerConfig(guildId);
    }
    const config = getServerConfig(guildId);
    const coloredRoleIds = [...new Set([...(config.coloredRoleIds || []), roleId])];
    return setServerConfig(guildId, { coloredRoleIds });
}

function removeColoredRole(guildId, roleId) {
    if (!roleId) {
        return getServerConfig(guildId);
    }
    const config = getServerConfig(guildId);
    const coloredRoleIds = (config.coloredRoleIds || []).filter(id => id !== roleId);
    return setServerConfig(guildId, { coloredRoleIds });
}

module.exports = {
    getServerConfig,
    setServerConfig,
    addModRole,
    removeModRole,
    addColoredRole,
    removeColoredRole,
};
