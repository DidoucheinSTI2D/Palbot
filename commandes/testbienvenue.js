const Canvas = require('canvas');
const Discord = require('discord.js');
const path = require('path');

module.exports = {
    name: "testbienvenue",
    async run(client, message, args) {
        const member = message.member;
        const channel = message.channel;

        const canvas = Canvas.createCanvas(700, 250);
        const ctx = canvas.getContext('2d');

        try {
            const background = await Canvas.loadImage(path.join(__dirname, '../images/bienvenue.jpg'));
            ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
        } catch (error) {
            console.error('Erreur lors du chargement de l\'image de fond:', error);
            return message.reply('Une erreur s\'est produite lors du chargement de l\'image de fond.');
        }

        ctx.strokeStyle = '#74037b';
        ctx.strokeRect(0, 0, canvas.width, canvas.height);

        ctx.font = '28px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Bienvenue sur le serveur,', canvas.width / 2.5, canvas.height / 3.5);

        ctx.font = '40px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(member.displayName, canvas.width / 2.5, canvas.height / 1.8);

        ctx.beginPath();
        ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();

        try {
            const avatar = await Canvas.loadImage(member.user.displayAvatarURL());
            ctx.drawImage(avatar, 25, 25, 200, 200);
        } catch (error) {
            console.error('Erreur lors du chargement de l\'avatar:', error);
            return message.reply('Une erreur s\'est produite lors du chargement de l\'avatar.');
        }

        const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'bienvenue.jpg');

        channel.send(`Bienvenue sur le serveur, ${member}!`, attachment);
    }
};
