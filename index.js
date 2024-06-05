const { token } = require('./config.json');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const loader = require("./loader.js");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();

loader(client);

client.once(Events.ClientReady, readyClient => {
    console.log(`Palclient est bien ON en tant que ${readyClient.user.tag}`);
});

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
  
    const prefix = "!"; 
    if (message.content.startsWith(prefix)) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        if (client.commands.has(command)) {
            try {
                await client.commands.get(command).run(client, message, args);
            } catch (error) {
                console.error(error);
                message.reply("Une erreur est survenue lors de l'exécution de la commande.");
            }
        }
    }
});

client.login(token);
