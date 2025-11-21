const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    category: 'Utility',
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Display information about the current server.'),
    async execute(interaction) {
        const { guild } = interaction;
        const embed = new EmbedBuilder()
            .setTitle(guild.name)
            .setThumbnail(guild.iconURL({ size: 256 }))
            .setColor(0x57f287)
            .addFields(
                { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
                { name: 'Members', value: `${guild.memberCount}`, inline: true },
                { name: 'Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: false },
            );

        return interaction.reply({ embeds: [embed] });
    },
};
