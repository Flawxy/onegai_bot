const fs = require('fs');
const Discord = require('discord.js');
const {prefix, botAvatar} = require('./config');
const {token} = process.env.BOT_TOKEN || require('./auth.json');
const {adminID} = process.env.ADMIN_ID || require('./auth.json');
const {dbLogin} = process.env.DB_LOGIN || require('./auth.json');
const {dbPassword} = process.env.DB_PASSWORD || require('./auth.json');
const mongoose = require('mongoose');
const bot = new Discord.Client();
bot.commands = new Discord.Collection();

const cooldowns = new Discord.Collection();





const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    bot.commands.set(command.name, command);
}

mongoose.connect(`mongodb+srv://${process.env.DB_LOGIN || dbLogin}:${process.env.DB_PASSWORD || dbPassword}@onegaidb-tj9rb.mongodb.net/test?retryWrites=true&w=majority`,
    { useNewUrlParser: true,
        useUnifiedTopology: true })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(error => console.error("Impossible de se connecter à la BDD : " + error));


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

/* ------------------------------ 🢃 AUTOMATISATION DE L'AFFICHAGE DU NOUVEAU CHANGELOG 🢃 ------------------------------ */
const fetch = require('node-fetch');
const docUrl = 'http://onegai-site.herokuapp.com/doc';
const Changelog = require('./models/changelog');
const changelogChannel = 'onegai-changelog';

bot.setInterval(() => {
    fetch('http://onegai-site.herokuapp.com/api/changelog')
        .then(res => res.json())
        .then(json => {
            Changelog.findOne({version: json.botVersion})
                .then(changelog => {
                    // Si le changelog existe déjà, on arrête tout
                    if(changelog) return;

                    const newChangelog = new Changelog({
                        title: json.title,
                        version: json.botVersion,
                        introduction: json.introduction,
                        image: json.image,
                        url: 'https://onegai-site.herokuapp.com/posts/' + json.slug
                    });

                    // On ajoute le changelog en nouvelle entrée de BDD
                    newChangelog.save();

                    // On parcourt tous les serveurs où se trouve OnegAI
                    bot.guilds.forEach(guild => {
                        const channel = guild.channels.find(ch => ch.name === changelogChannel);
                        // Si le channel n'existe pas on contacte en DM le propriétaire du Discord
                        if(!channel) {
                            return guild.owner.user.send("Désolé de t'importuner mais il me semble que tu es " +
                                "le propriétaire du Discord **" + guild.name + "** et je n'ai pas réussi à y " +
                                "envoyer un message car ce Discord ne dispose pas de salon textuel nommé \"**" + changelogChannel + "**\"." +
                                "\nCe salon me permet de prévenir ta communauté quand une nouvelle mise à jour est disponible" +
                                "\nTu peux remédier à ce problème en créant un salon textuel \"**" + changelogChannel + "**\" et " +
                                "m'y donner les droits d'écriture. Où tu peux ignorer ce message si tu ne désires pas " +
                                "être informé de mes mises à jour." +
                                "\n Bonne journée et merci encore d'utiliser OnegAI !");
                        }
                        // Si le channel existe on prépare un embed message à envoyer
                        const embedMessage = new Discord.RichEmbed()
                            .setColor('#e2bc9e')
                            .setTitle(newChangelog.title)
                            .setURL(newChangelog.url)
                            .setDescription(newChangelog.introduction)
                            .setThumbnail(botAvatar)
                            .addField("Lien vers l'article", newChangelog.url)
                            .addField("Lien vers la documentation", docUrl)
                            .setImage(newChangelog.image);

                        channel.send("@everyone OnegAI vient d'être mis à jour !");
                        return channel.send(embedMessage);
                    });
                });
        });
},1000*60);
/* ------------------------------ 🢁 AUTOMATISATION DE L'AFFICHAGE DU NOUVEAU CHANGELOG 🢁 ------------------------------ */


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