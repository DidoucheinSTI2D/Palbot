const { EmbedBuilder, PermissionsBitField, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../config.json');
const fs = require('fs');
const path = require('path');

function sanitizeUsername(username) {
    return username.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}

async function createHtmlTranscription(channel) {
    let transcript = `<html><head><title>Transcription de ${channel.name}</title></head><body><h1>Transcription de ${channel.name}</h1>`;
    const messages = await channel.messages.fetch({ limit: 100 });
    messages.reverse().forEach(msg => {
        transcript += `<p><strong>${msg.author.username}</strong>: ${msg.content}</p>`;
    });
    transcript += '</body></html>';
    fs.writeFileSync(path.join(__dirname, `../transcripts/${channel.name}.html`), transcript);
}

module.exports = async (client, reaction, user) => {
    if (user.bot) return;

    const { message } = reaction;
    const embed = message.embeds[0];

    if (!embed || embed.title !== 'Ticket System') return;

    const sanitizedUsername = sanitizeUsername(user.username);

    const existingTicketChannel = message.guild.channels.cache.find(ch => 
        ch.name.includes(`ticket-question-${sanitizedUsername}`) || 
        ch.name.includes(`ticket-report-${sanitizedUsername}`)
    );

    if (existingTicketChannel) {
        user.send('Vous avez déjà un ticket ouvert.');
        reaction.users.remove(user.id);
        return;
    }

    const ticketCat = message.guild.channels.cache.get(config.ticketcat);
    const staffRole = message.guild.roles.cache.get(config.staff);

    let ticketName = '';
    if (reaction.emoji.name === '❓') {
        ticketName = `ticket-question-${sanitizedUsername}`;
    } else if (reaction.emoji.name === '❗') {
        ticketName = `ticket-report-${sanitizedUsername}`;
    } else {
        reaction.users.remove(user.id);
        return;
    }

    if (!ticketName) {
        reaction.users.remove(user.id);
        return;
    }

    try {
        const ticket = await message.guild.channels.create({
            name: ticketName,
            type: ChannelType.GuildText,
            parent: ticketCat ? ticketCat.id : null,
            permissionOverwrites: [
                {
                    id: message.guild.id,
                    deny: [PermissionsBitField.Flags.ViewChannel],
                },
                {
                    id: user.id,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
                },
                {
                    id: staffRole.id,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
                },
            ],
        });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('close_ticket')
                    .setLabel('❌')
                    .setStyle(ButtonStyle.Success)
            );

        const openMessage = await ticket.send({
            content: `Bonjour ${user.username}, veuillez expliquer votre problème. Un membre du staff vous répondra bientôt.`,
            components: [row]
        });

        const filter = i => i.customId === 'close_ticket' && i.user.id === user.id;
        const collector = ticket.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async i => {
            if (i.customId === 'close_ticket') {
                await i.update({
                    content: 'Êtes-vous sûr de vouloir fermer votre ticket ? Appuyez de nouveau sur ❌ pour confirmer.',
                    components: [row]
                });

                const confirmationFilter = i => i.customId === 'close_ticket' && i.user.id === user.id;
                const confirmationCollector = ticket.createMessageComponentCollector({ confirmationFilter, time: 15000 });

                confirmationCollector.on('collect', async i => {
                    if (i.customId === 'close_ticket') {
                        await i.update({
                            content: 'Ticket fermé pour vous.',
                            components: []
                        });
                        ticket.permissionOverwrites.edit(user.id, { VIEW_CHANNEL: false });

                        const staffRow = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('delete_ticket')
                                    .setLabel('❌')
                                    .setStyle(ButtonStyle.Success),
                                new ButtonBuilder()
                                    .setCustomId('transcript_ticket')
                                    .setLabel('💾')
                                    .setStyle(ButtonStyle.Success)
                            );

                        const staffMessage = await ticket.send({
                            content: `OEE C BON IL A ARRÊTER DE CLC`,
                            components: [staffRow]
                        });

                        const staffFilter = i => ['delete_ticket', 'transcript_ticket'].includes(i.customId) && i.member.roles.cache.has(staffRole.id);
                        const staffCollector = ticket.createMessageComponentCollector({ staffFilter, time: 60000 });

                        staffCollector.on('collect', async i => {
                            if (i.customId === 'delete_ticket') {
                                await ticket.delete();
                            } else if (i.customId === 'transcript_ticket') {
                                await createHtmlTranscription(ticket);
                                const filePath = path.join(__dirname, `../transcripts/${ticket.name}.html`);
                                await i.reply({ content: 'Voici la transcription du ticket :', files: [filePath] });
                            }
                        });
                    }
                });
            }
        });

        reaction.users.remove(user.id);
    } catch (error) {
        console.error('Error creating ticket:', error);
        user.send("Une erreur est survenue lors de la création du ticket. Veuillez réessayer.");
    }
};
