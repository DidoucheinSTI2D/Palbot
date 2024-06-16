const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const path = require('path');
const config = require('../config.json');

module.exports = async (client, member) => {
    const channel = member.guild.channels.cache.get(config.welcomeChannel);
    if (!channel) {
        console.error(`Le canal avec l'ID ${config.welcomeChannel} n'a pas été trouvé.`);
        return;
    }


    const imagePath = path.join(__dirname, '../images/bienvenue.png');
    const attachment = new AttachmentBuilder(imagePath, { name: 'bienvenue.png' });

    const welcomeEmbed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('Bienvenue sur le serveur !')
        .setDescription(`Bienvenue sur le serveur, ${member}!`)
        .setThumbnail(member.user.displayAvatarURL({ format: 'png', dynamic: true }))
        .setImage('attachment://bienvenue.png')
        .setTimestamp();

    try {
        await channel.send({ embeds: [welcomeEmbed], files: [attachment] });
    } catch (error) {
        console.error('Erreur lors de l\'envoi du message de bienvenue:', error);
    }
};
