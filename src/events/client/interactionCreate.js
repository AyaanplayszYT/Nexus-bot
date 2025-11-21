const { Events } = require('discord.js');
const { hasModeratorAccess } = require('../../utils/permissions');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        try {
            if (command.modOnly && interaction.inGuild()) {
                let member = interaction.member;
                if (!member || !member.roles || !member.roles.cache) {
                    member = await interaction.guild.members.fetch(interaction.user.id);
                }
                if (!hasModeratorAccess(member)) {
                    return interaction.reply({ content: 'You need a moderator role to use this command.', ephemeral: true });
                }
            }

            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
    },
};
