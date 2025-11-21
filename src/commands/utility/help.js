const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const categoryDecorations = {
    Moderation: { emoji: '🛡️' },
    Utility: { emoji: '🛠️' },
    Configuration: { emoji: '⚙️' },
    AI: { emoji: '🤖' },
};

module.exports = {
    category: 'Utility',
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Display all available commands grouped by category.'),
    async execute(interaction) {
        const commands = [...interaction.client.commands.values()];
        const commandsByCategory = commands.reduce((acc, command) => {
            const category = command.category || 'Other';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(command);
            return acc;
        }, {});

        const embed = new EmbedBuilder()
            .setTitle('Nexus Command Panel')
            .setColor(0x5865f2)
            .setDescription('`/` prefix commands grouped by focus area.')
            .setThumbnail(interaction.client.user.displayAvatarURL({ size: 256 }))
            .setFooter({ text: `Made by Mistiz911 • Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ size: 64 }) })
            .setTimestamp();

        Object.entries(commandsByCategory)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .forEach(([category, categoryCommands]) => {
                const decoration = categoryDecorations[category] || { emoji: '✨' };
                const value = categoryCommands
                    .sort((a, b) => a.data.name.localeCompare(b.data.name))
                    .map(cmd => `• \`/${cmd.data.name}\` — ${cmd.data.description ?? 'No description provided.'}`)
                    .join('\n');

                embed.addFields({
                    name: `${decoration.emoji} ${category}`,
                    value: value.slice(0, 1024) || '*No commands yet.*',
                });
            });

        return interaction.reply({ embeds: [embed] });
    },
};
