const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    category: 'Utility',
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Display information about a user.')
        .addUserOption(option => option.setName('user').setDescription('User to inspect')),
    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;
        const member = interaction.guild.members.cache.get(user.id) || (await interaction.guild.members.fetch(user.id).catch(() => null));

        const roles = member ? member.roles.cache.filter(role => role.name !== '@everyone').map(role => role.toString()).join(', ') || 'None' : 'Not found';

        const embed = new EmbedBuilder()
            .setTitle(`${user.tag}`)
            .setThumbnail(user.displayAvatarURL({ size: 256 }))
            .setColor(0xeb459e)
            .addFields(
                { name: 'ID', value: user.id, inline: true },
                { name: 'Bot', value: user.bot ? 'Yes' : 'No', inline: true },
                { name: 'Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
            );

        if (member) {
            embed.addFields(
                { name: 'Joined', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
                { name: 'Roles', value: roles, inline: false },
            );
        }

        return interaction.reply({ embeds: [embed] });
    },
};
