const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const database = require('../../utils/database');

module.exports = {
    category: 'Configuration',
    data: new SlashCommandBuilder()
        .setName('coloredroles')
        .setDescription('Manage colored roles that users can self-assign')
        .addSubcommand(sub =>
            sub
                .setName('add')
                .setDescription('Add a role to the colored roles list')
                .addRoleOption(option =>
                    option
                        .setName('role')
                        .setDescription('Role to add')
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName('remove')
                .setDescription('Remove a role from the colored roles list')
                .addRoleOption(option =>
                    option
                        .setName('role')
                        .setDescription('Role to remove')
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName('list')
                .setDescription('List all colored roles')
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .setDMPermission(false),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'add') {
            const role = interaction.options.getRole('role');
            database.addColoredRole(interaction.guildId, role.id);

            const embed = new EmbedBuilder()
                .setTitle('Colored Role Added')
                .setDescription(`${role} has been added to colored roles.`)
                .setColor(0x57f287)
                .setTimestamp();

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (subcommand === 'remove') {
            const role = interaction.options.getRole('role');
            database.removeColoredRole(interaction.guildId, role.id);

            const embed = new EmbedBuilder()
                .setTitle('Colored Role Removed')
                .setDescription(`${role} has been removed from colored roles.`)
                .setColor(0xed4245)
                .setTimestamp();

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (subcommand === 'list') {
            const config = database.getServerConfig(interaction.guildId);
            const coloredRoleIds = config.coloredRoleIds || [];

            if (!coloredRoleIds.length) {
                return interaction.reply({
                    content: 'No colored roles have been configured yet.',
                    ephemeral: true,
                });
            }

            const roles = coloredRoleIds
                .map(id => interaction.guild.roles.cache.get(id))
                .filter(Boolean);

            if (!roles.length) {
                return interaction.reply({
                    content: 'Some configured roles could not be found.',
                    ephemeral: true,
                });
            }

            const embed = new EmbedBuilder()
                .setTitle('Colored Roles')
                .setDescription(roles.map(r => `• ${r}`).join('\n'))
                .setColor(0x3498db)
                .setTimestamp();

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};
