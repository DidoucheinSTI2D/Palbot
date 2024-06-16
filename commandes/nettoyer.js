const Discord = require('discord.js');
const config = require("../config.json");

module.exports = {
    name: "nettoyer",
    async run(client, message) {
        const staffRole = message.guild.roles.cache.get(config.staff);

        if (!message.member.roles.cache.has(staffRole.id)) {
            return message.reply("Vous n'avez pas la permission d'utiliser cette commande.");
        }

        try {
            const fetched = await message.channel.messages.fetch({ limit: 100 });
            await message.channel.bulkDelete(fetched);
            message.channel.send("Le canal a été nettoyé.").then(msg => {
                setTimeout(() => msg.delete(), 5000);
            });
        } catch (error) {
            console.error('Error cleaning the channel:', error);
            message.reply("Une erreur est survenue lors du nettoyage du canal. Veuillez réessayer.");
        }
    }
};
