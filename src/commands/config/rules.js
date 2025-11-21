const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const database = require('../../utils/database');

const RULES_TEMPLATES = {
    normal: {
        title: 'Server Rules',
        rules: [
            '1. Be respectful to all members',
            '2. No spam or advertising',
            '3. Keep conversations appropriate',
            '4. No hate speech or discrimination',
            '5. Follow Discord Terms of Service',
            '6. Respect server staff decisions',
            '7. Use appropriate channels for topics',
            '8. No personal information sharing',
        ],
        color: 0x3498db,
    },
    gaming: {
        title: '🎮 Gaming Server Rules',
        rules: [
            '1. Keep gaming discussions on-topic',
            '2. No game spoilers without warning',
            '3. Respect all skill levels',
            '4. No hate speech or harassment',
            '5. Competitive play must be fair and fun',
            '6. No cheating, hacking, or exploiting',
            '7. Report rule violations to staff',
            '8. Have fun and enjoy the community!',
        ],
        color: 0x9b59b6,
    },
    community: {
        title: '👥 Community Guidelines',
        rules: [
            '1. Welcome all members warmly',
            '2. Be inclusive and supportive',
            '3. No harassment or bullying',
            '4. Respect diverse opinions',
            '5. Keep discussions friendly',
            '6. Share content relevant to community',
            '7. Report issues to moderators',
            '8. Build a positive community together',
        ],
        color: 0x2ecc71,
    },
};

module.exports = {
    category: 'Configuration',
    data: new SlashCommandBuilder()
        .setName('rules')
        .setDescription('Manage and display server rules')
        .addSubcommand(sub =>
            sub
                .setName('display')
                .setDescription('Display the current server rules')
        )
        .addSubcommand(sub =>
            sub
                .setName('set')
                .setDescription('Set the rules type for this server')
                .addStringOption(option =>
                    option
                        .setName('type')
                        .setDescription('Rules template type')
                        .addChoices(
                            { name: 'Normal', value: 'normal' },
                            { name: 'Gaming', value: 'gaming' },
                            { name: 'Community', value: 'community' }
                        )
                        .setRequired(true)
                )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setDMPermission(false),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const config = database.getServerConfig(interaction.guildId);

        if (subcommand === 'display') {
            const rulesType = config.rulesType || 'normal';
            const template = RULES_TEMPLATES[rulesType] || RULES_TEMPLATES.normal;

            const embed = new EmbedBuilder()
                .setTitle(template.title)
                .setDescription(template.rules.join('\n'))
                .setColor(template.color)
                .setFooter({ text: `Rules Type: ${rulesType.charAt(0).toUpperCase() + rulesType.slice(1)}` })
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });
        }

        if (subcommand === 'set') {
            const rulesType = interaction.options.getString('type');
            database.setServerConfig(interaction.guildId, { ...config, rulesType });

            const template = RULES_TEMPLATES[rulesType];
            const embed = new EmbedBuilder()
                .setTitle('Rules Updated')
                .setDescription(`Rules type set to **${rulesType.charAt(0).toUpperCase() + rulesType.slice(1)}**`)
                .setColor(0x57f287)
                .setTimestamp();

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};
