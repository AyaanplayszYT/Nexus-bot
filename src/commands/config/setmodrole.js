const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const database = require('../../utils/database');

module.exports = {
    category: 'Configuration',
    data: new SlashCommandBuilder()
        .setName('setmodrole')
        .setDescription('Manage which roles can run Nexus moderation commands.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setDMPermission(false)
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add a role to the Nexus moderator list.')
                .addRoleOption(option => option.setName('role').setDescription('Role to add').setRequired(true)),
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove a role from the Nexus moderator list.')
                .addRoleOption(option => option.setName('role').setDescription('Role to remove').setRequired(true)),
        )
        .addSubcommand(subcommand =>
            subcommand.setName('list').setDescription('View the current Nexus moderator roles.')),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guildId;
        let config;

        if (subcommand === 'add') {
            const role = interaction.options.getRole('role');
            config = database.addModRole(guildId, role.id);
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Moderator Role Added')
                        .setColor(0x57f287)
                        .setDescription(`${role} can now use Nexus moderation commands.`)
                        .addFields({ name: 'Total Roles', value: `${config.modRoleIds.length}` })
                        .setTimestamp(),
                ],
                ephemeral: true,
            });
        }

        if (subcommand === 'remove') {
            const role = interaction.options.getRole('role');
            config = database.removeModRole(guildId, role.id);
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Moderator Role Removed')
                        .setColor(0xed4245)
                        .setDescription(`${role} can no longer run Nexus moderation commands.`)
                        .addFields({ name: 'Total Roles', value: `${config.modRoleIds.length}` })
                        .setTimestamp(),
                ],
                ephemeral: true,
            });
        }

        config = database.getServerConfig(guildId);
        const roles = config.modRoleIds.map(roleId => {
            const role = interaction.guild.roles.cache.get(roleId);
            return role ? role.toString() : `<@&${roleId}> (missing)`;
        });

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Configured Moderator Roles')
                    .setColor(0x5865f2)
                    .setDescription(roles.length ? roles.join('\n') : 'No custom moderator roles configured yet.')
                    .setTimestamp(),
            ],
            ephemeral: true,
        });
    },
};
