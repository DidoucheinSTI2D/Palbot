const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: "ticket",
    async run(client, message) {
        const embed = new EmbedBuilder()
            .setTitle('Ticket System')
            .setDescription('Cliquez sur une des réactions pour créer un ticket.\n\n❓ - Question\n❗ - Report')
            .setColor('#00FF00');

        const msg = await message.channel.send({ embeds: [embed] });
        await msg.react('❓');
        await msg.react('❗');
    }
};
