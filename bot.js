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
/* ------------------------------ 🢃 CONNEXION DU BOT ET DE LA BDD 🢃 ------------------------------ */
bot.login(process.env.BOT_TOKEN || token);

mongoose.connect(`mongodb+srv://${process.env.DB_LOGIN || dbLogin}:${process.env.DB_PASSWORD || dbPassword}@onegaidb-tj9rb.mongodb.net/test?retryWrites=true&w=majority`,
    { useNewUrlParser: true,
        useUnifiedTopology: true })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(error => console.error("Impossible de se connecter à la BDD : " + error));
/* ------------------------------ 🢁 CONNEXION DU BOT ET DE LA BDD 🢁 ------------------------------ */

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
const onegaiChannel = 'onegai';

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
                        const channel = guild.channels.find(ch => ch.name === onegaiChannel);
                        // Si le channel n'existe pas on contacte en DM le propriétaire du Discord
                        if(!channel) {
                            return guild.owner.user.send("Désolé de t'importuner mais il me semble que tu es " +
                                "le propriétaire du Discord **" + guild.name + "** et je n'ai pas réussi à y " +
                                "envoyer un message car ce Discord ne dispose pas de salon textuel nommé \"**" + onegaiChannel + "**\"." +
                                "\nCe salon me permet de communiquer avec ta communauté en la tenant au courant de mes dernières informations" +
                                "\nTu peux remédier à ce problème en créant un salon textuel \"**" + onegaiChannel + "**\" et " +
                                "m'y donner les droits d'écriture. Où tu peux ignorer ce message si tu ne désires pas " +
                                "être informé de mon actualité." +
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

                        channel.send("@here OnegAI vient d'être mis à jour !");
                        return channel.send(embedMessage);
                    });
                });
        });
},1000*60); // Toutes les minutes
/* ------------------------------ 🢁 AUTOMATISATION DE L'AFFICHAGE DU NOUVEAU CHANGELOG 🢁 ------------------------------ */

/* ------------------------- 🢃 AUTOMATISATION DE LA MISE À JOURS DE LA BDD POUR LES DEVJOKES 🢃 ------------------------- */
const DevJoke = require('./models/devJoke');

const rp = require('request-promise');
const $ = require('cheerio');
const onegaiUpdateChannel = 'onegai-maj';

const devHumorCategory = "http://devhumor.com/category";
const url = [
    devHumorCategory + "/comics",
    devHumorCategory + "/gifs",
    devHumorCategory + "/memes",
    devHumorCategory + "/motivational",
    devHumorCategory + "/code",
    devHumorCategory + "/git",
    devHumorCategory + "/bugs",
    devHumorCategory + "/mrw",
    devHumorCategory + "/quote",
    devHumorCategory + "/tests",
    devHumorCategory + "/uncategorized"
];

bot.setInterval(() => {
    let messageCount = 0;
    let updateMessage = true;

    for(let i = 0 ; i < url.length; i++) {
        rp(url[i])
            .then(html => {
                //success!
                const myLoader = $.load(html);
                const images = url[i] !== 'http://devhumor.com/category/gifs' ? $('div[data-id]>div.item-large>a>img', html) :
                    $('div[data-id]>div.item-large>div.animated-gif>img', html);
                let newEntryAdded = false;
                bot.guilds.forEach(guild => {
                    const channel = guild.channels.find(ch => ch.name === onegaiUpdateChannel);
                    // Si le channel n'existe pas on stop tout
                    if(!channel) return;

                        for (let j = 0; j < images.length; j++) {

                            DevJoke.findOne({url: images[j].attribs.src})
                                .then(devJoke => {
                                    // Si la recherche n'existe pas dans la BDD
                                    if (!devJoke) {
                                        let $caption = images[j].attribs.alt || 'IMAGE_GIF';
                                        const newJoke = new DevJoke({
                                            caption: $caption,
                                            url: images[j].attribs.src
                                        });
                                        // On ajoute la recherche en nouvelle entrée de BDD
                                        newJoke.save();
                                        newEntryAdded = true;
                                    }
                                    if(j === images.length - 1) {
                                        if (newEntryAdded) {
                                            messageCount++;
                                            channel.send(`${guild.owner} **Nouvelle(s) image(s) ajoutée(s) depuis la source ${url[i]}**`);
                                        } else {
                                            messageCount++;
                                            channel.send(`Aucune entrée rajoutée depuis la source ${url[i]}`);
                                        }
                                        if( messageCount === url.length) {
                                            return channel.send(`${guild.owner}Mise à jour terminée avec succès !`);
                                        }
                                    }
                                }).catch(error => console.error(error));
                        }
                        if(updateMessage) {
                            updateMessage = false;
                            return channel.send(`${guild.owner} Mise à jour en cours depuis ${url.length} source(s) différente(s)...`)
                        }

                });
                }).catch(err => {
            console.error(`Erreur lors de la mise à jour de la BDD pour les devJokes : ${err}`);
        });
    }
},1000*60*60*8); // Toutes les 8 heures
/* ------------------------- 🢁 AUTOMATISATION DE LA MISE À JOURS DE LA BDD POUR LES DEVJOKES 🢁 ------------------------- */


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