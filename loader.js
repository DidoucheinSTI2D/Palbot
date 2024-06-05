const fs = require("fs");

module.exports = async client => {
    fs.readdirSync("./commandes").filter(f => f.endsWith(".js")).forEach(file => {
        let command = require(`./commandes/${file}`);
        if (!command.name || typeof command.name !== "string") {
            throw new TypeError(`La commande ${file.slice(0, file.length - 3)} n'a pas de nom ou le nom n'est pas une chaîne de caractères.`);
        }
        client.commands.set(command.name, command);
        console.log(`La commande ${file} est chargée.`);
    });
};
