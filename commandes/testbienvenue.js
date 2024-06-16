const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const path = require('path');

module.exports = {
    name: "testbienvenue",
    async run(client, message, args) {
        const member = message.member;
        const channel = message.channel;

        const imagePath = path.join(__dirname, '../images/bienvenue.png');
        const attachment = new AttachmentBuilder(imagePath, { name: 'bienvenue.png' });

        const welcomeEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('Bienvenue sur le serveur !')
            .setDescription(`Bienvenue sur le serveur, ${member}!`)
            .setThumbnail(member.user.displayAvatarURL({ format: 'png', dynamic: true }))
            .setImage('attachment://bienvenue.png')
            .setTimestamp();

        channel.send({ embeds: [welcomeEmbed], files: [attachment] });
    }
};
