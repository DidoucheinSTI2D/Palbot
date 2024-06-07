const Discord = require("discord.js");
const config = require("../config.json");

module.exports = {
    name: "ban",
    async run(client, message, args) {
        const staff = config.staff;
        const userRoles = message.member.roles.cache.map(role => role.id);

        if (!userRoles.includes(staff)) {
            return message.reply("Vous n'avez pas la permission d'utiliser cette commande.");
        }

        const user = message.mentions.users.first();
        const duration = args[1] ? parseInt(args[1], 10) : null;

        if (!user) {
            return message.reply("Veuillez mentionner un utilisateur à bannir.");
        }

        const member = message.guild.members.cache.get(user.id);
        if (!member) {
            return message.reply("L'utilisateur mentionné n'est pas dans le serveur.");
        }

        const deleteMessages = async (user) => {
            const fetchedMessages = await message.channel.messages.fetch({ limit: 100 });
            const userMessages = fetchedMessages.filter(m => m.author.id === user.id);

            message.channel.bulkDelete(userMessages, true).catch(err => {
                console.error(err);
                message.reply("Une erreur s'est produite lors de la suppression des messages de l'utilisateur.");
            });
        };

        await deleteMessages(user);

        await member.ban({ reason: `Banni par ${message.author.tag}${duration ? ` pour une durée de ${duration} minutes` : ''}.` }).catch(err => {
            console.error(err);
            message.reply("Une erreur s'est produite lors du bannissement de l'utilisateur.");
        });

        message.reply(`${user.tag} a été banni${duration ? ` pour une durée de ${duration} minutes` : ' de manière permanente'}.`);

        message.delete();

        if (duration) {
            setTimeout(async () => {
                await message.guild.members.unban(user.id).catch(err => {
                    console.error(err);
                    message.channel.send(`Une erreur s'est produite lors du débanissement de ${user.tag}.`);
                });

                message.channel.send(`${user.tag} a été débanni après ${duration} minutes.`);
            }, duration * 60 * 1000);
        }
    }
};
