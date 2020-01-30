const fs = require('fs');
const Discord = require('discord.js');
const {prefix} = require('./config.json');
const {token} = process.env.BOT_TOKEN || require('./auth.json');
const {adminID} = process.env.ADMIN_ID || require('./auth.json');
const mongoose = require('mongoose');
console.log(process.env.ADMIN_ID);
console.log(process.env.BOT_TOKEN);
const bot = new Discord.Client();
bot.commands = new Discord.Collection();

const cooldowns = new Discord.Collection();


const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    bot.commands.set(command.name, command);
}

mongoose.connect('mongodb+srv://Flawxy:u19vbcvgxQgOeHZ3@onegaidb-tj9rb.mongodb.net/test?retryWrites=true&w=majority',
    { useNewUrlParser: true,
        useUnifiedTopology: true })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));


bot.once('ready', () => {
    //Attribution de l'activité et du statut du bot
    bot.user.setPresence({ game: { name: 'rapporter la baballe' }, status: 'online'})
        .then((clientUser) => console.log(`Statut du bot attribué : "Joue à ${clientUser.localPresence.game.name} + Statut : ${clientUser.localPresence.status}"`))
        .catch(error => {console.log('Erreur lors de l\'attribution du statut du bot : '+error)});

    //Confirmation du bon fonctionnement du bot
    console.log('onegAI is ready to go!');
    process.env.BOT_TOKEN ?
        console.log('Currently listening from heroku server!') :
        console.log('Currently listening from local host!');
});


// Nouvel événement quand un nouvel utilisateur rejoint le serveur
bot.on('guildMemberAdd', member => {
    // Sélectionne le channel précisé
    const channel = member.guild.channels.find(ch => ch.name === 'discussion');
    // Ne fait rien si le channel n'existe pas
    if (!channel) return;
    // Si le channel existe, envoie un message de bienvenue
    channel.send(`Bienvenue sur le serveur de ${member.guild.owner}, ${member} !`);
});


// Nouvel événement sur des messages précis
bot.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = bot.commands.get(commandName)
                    || bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;
    // Si une commande guildOnly est utilisée en DM, on la bloque
    if (command.guildOnly && message.channel.type !== 'text') {
        return message.reply('Je ne peux pas utiliser cette commande dans les messages privés !');
    }
    // Si une commande adminOnly (créateur du bot) est utilisée par une autre personne, on la bloque
    if (command.adminOnly && message.author.id !== (process.env.ADMIN_ID || adminID)) {
        console.log(`Commande "${command.name}" a été bloquée : réclamée par ${message.author.username} sur le serveur ${message.guild}.`);
        return message.reply('Désolé mais cette commande est réservée à l\'administration du bot.');
    }
    // Si les arguments nécessaires à une commande n'ont pas été précisés
    if (command.args && !args.length) {
        let reply = `Tu n'as précisé aucun argument, ${message.author}!`;
        // On affiche la bonne syntaxe de la commande
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
        console.error(error);
        console.log(`Commande "${command.name}" a retourné une erreur : réclamée par ${message.author.username} sur le serveur ${message.guild}.`);
        return message.reply('Une erreur s\'est produite lors de l\'exécution de cette commande');
    }
});

bot.login(process.env.BOT_TOKEN || token);