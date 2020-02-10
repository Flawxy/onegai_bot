const Discord = require('discord.js');
const cooldowns = new Discord.Collection();

const {prefix} = require('../../config');
const {adminID} = process.env.ADMIN_ID || require('../../auth.json');

const fs = require('fs');
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

module.exports = botClient => {

    botClient.commands = new Discord.Collection();
    for (const file of commandFiles) {
        const command = require(`../../commands/${file}`);
        botClient.commands.set(command.name, command);
    }

    botClient.on('message', message => {
        // If a message doesn't start by the prefix or is from a bot , stops the function
        if (!message.content.startsWith(prefix) || message.author.bot) return;

        const args = message.content.slice(prefix.length).split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = botClient.commands.get(commandName)
            || botClient.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command) return;

        // Blocks a guild only command if used in a private message
        if (command.guildOnly && message.channel.type !== 'text') {
            return message.reply('Je ne peux pas utiliser cette commande dans les messages privés !');
        }
        // Blocks a moderator only command if used by a user with not enough permission
        if (command.moderatorOnly && !message.member.hasPermission('MANAGE_CHANNELS')) {
            return message.reply('Désolé mais je n\'obéis qu\' à mon maître ! (**permissions insuffisantes**)');
        }
        // Blocks a creator only command if used by a non-creator user
        if (command.creatorOnly && message.author.id !== (process.env.ADMIN_ID || adminID)) {
            console.log(`Commande "${command.name}" a été bloquée : réclamée par ${message.author.username} sur le serveur ${message.guild}.`);
            return message.reply('Désolé mais cette commande est réservée à l\'administration du bot.');
        }
        // If necessary arguments for a command are not indicated...
        if (command.args && !args.length) {
            let reply = `Tu n'as précisé aucun argument, ${message.author}!`;
            // ...displays the correct syntax of the command
            if (command.usage) {
                reply += `\nLa bonne syntaxe est : \`${prefix}${command.name} ${command.usage}\``;
            }

            return message.channel.send(reply);
        }

        if (!cooldowns.has(command.name)) {
            cooldowns.set(command.name, new Discord.Collection());
        }

        const now = Date.now();
        const timestamps = cooldowns.get(command.name);
        const cooldownAmount = (command.cooldown || 3) * 1000;

        if (timestamps.has(message.author.id)) {

            const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                return message.reply(`Merci d'attendre encore ${timeLeft.toFixed(1)} secondes avant d'utiliser la commande \`${command.name}\` de nouveau.`);
            }
        }

        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

        try {
            command.execute(message, args);
            return console.log(`Commande "${command.name}" réussie : réclamée par ${message.author.username} sur le serveur ${message.guild}.`);
        } catch (error) {
            console.log(`Commande "${command.name}" a retourné une erreur : réclamée par ${message.author.username} sur le serveur ${message.guild}.`);
            console.error(error);
            return message.reply('Une erreur s\'est produite lors de l\'exécution de cette commande');
        }
    });
};