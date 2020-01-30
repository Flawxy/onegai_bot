const Discord = require('discord.js');

const DevJoke = require('../models/devJoke');

const {prefix} = require('../config');
const rp = require('request-promise');
const $ = require('cheerio');

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

module.exports = {
    name: 'devjoke',
    aliases: ['dj'],
    description: '',
    args: false,
    guildOnly: true,
    adminOnly: false,
    cooldown: 10,
    execute(message, args) {
        DevJoke.countDocuments()
            .then((count) => {
                message.channel.send(`J'ai mémorisé ${count} images pour le moment !`);
                message.channel.send("En voici une choisie au hasard par mes soins :");
            });
        DevJoke.find()
            .then(devJoke => {
                const randomNumber = getRandomInt(devJoke.length);
                // Je garde une trace des nombres générés automatiquement pour tracer d'éventuelles erreurs
                console.log(`Nombre aléatoire généré par la commande devJoke : ${randomNumber}`);

                // Si l'image est un .gif, on affiche différemment
                if(devJoke[randomNumber].url.includes('.gif')){
                    message.channel.send(devJoke[randomNumber].caption);
                    message.channel.send(devJoke[randomNumber].url);

                // Sinon, l'image sera un .png ou .jpeg : on affiche en richembed text
                }else {
                    const embedMessage = new Discord.RichEmbed()
                        .setColor('#0099ff')
                        .setTitle("Source de l'image")
                        .setURL('http://devhumor.com/category')
                        .setDescription(devJoke[randomNumber].caption)
                        .setThumbnail('https://cdn.discordapp.com/avatars/662240066084798474/4b8610bda922866cc76f370987599b34.png')
                        .setImage(devJoke[randomNumber].url);

                    return message.channel.send(embedMessage);
                }

                /**/
            }).catch(error => {
                console.error('L\'entrée ne se trouve pas dans la BDD...');
            message.channel.send("Une erreur s'est produite. Je n'ai pas trouvé d'image...")
            });
    }
};