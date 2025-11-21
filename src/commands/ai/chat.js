const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { chatCompletion } = require('../../utils/openrouter-api');
const database = require('../../utils/database');

module.exports = {
    category: 'AI',
    data: new SlashCommandBuilder()
        .setName('chat')
        .setDescription('Chat with the Nexus AI assistant.')
        .addStringOption(option =>
            option
                .setName('prompt')
                .setDescription('What would you like to ask the AI?')
                .setRequired(true)
                .setMaxLength(800),
        ),
    async execute(interaction) {
        const prompt = interaction.options.getString('prompt')?.trim();
        if (!prompt) {
            return interaction.reply({ content: 'Please provide a prompt for the AI to respond to.', ephemeral: true });
        }

        if (interaction.inGuild()) {
            const config = database.getServerConfig(interaction.guildId);
            if (config.aiChannelId && interaction.channelId !== config.aiChannelId) {
                return interaction.reply({
                    content: `Please use <#${config.aiChannelId}> for AI conversations.`,
                    ephemeral: true,
                });
            }
        }

        await interaction.deferReply();

        try {
            const aiResponse = await chatCompletion([
                {
                    role: 'system',
                    content: 'You are Nexus, a helpful Discord moderation assistant. Keep responses concise and friendly.',
                },
                { role: 'user', content: prompt },
            ]);
            const safeResponse = aiResponse || 'No response received.';

            const embed = new EmbedBuilder()
                .setTitle('Nexus AI Response')
                .setDescription(safeResponse.slice(0, 4000))
                .setColor(0x9b59b6)
                .addFields(
                    { name: 'Prompt', value: prompt.slice(0, 1024) },
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [embed], allowedMentions: { parse: [] } });
        } catch (error) {
            console.error('AI command error:', error);
            const reason = error?.message ? ` Reason: ${error.message}` : '';
            await interaction.editReply(`Failed to reach the AI service. Please try again later.${reason}`);
        }
    },
};
