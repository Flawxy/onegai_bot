const Discord = require('discord.js');

const DevJoke = require('../models/devJoke');

const {prefix, botAvatar} = require('../config');
const rp = require('request-promise');
const $ = require('cheerio');

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

module.exports = {
    name: 'devjoke',
    aliases: ['dj'],
    description: 'Affiche un meme cherché au hasard dans la BDD',
    args: false,
    guildOnly: true,
    moderatorOnly: false,
    creatorOnly: false,
    cooldown: 10,
    execute(message, args) {
        DevJoke.countDocuments()
            .then((count) => {
                message.channel.send(`J'ai mémorisé \` ${count} images\` pour le moment !`);
                message.channel.send("En voici une choisie au hasard par mes soins :");
            });
        DevJoke.find()
            .then(devJoke => {
                const randomNumber = getRandomInt(devJoke.length);

                // If the media is a .gif, displays it differently...
                if(devJoke[randomNumber].url.includes('.gif')){
                    message.channel.send(devJoke[randomNumber].url);

                // ...else, the media is whether .jpeg or .png : displays it with a rich embed message
                }else {
                    const embedMessage = new Discord.RichEmbed()
                        .setColor('#0099ff')
                        .setTitle("Source de l'image")
                        .setURL('http://devhumor.com/')
                        .setDescription(devJoke[randomNumber].caption)
                        .setThumbnail(botAvatar)
                        .setImage(devJoke[randomNumber].url);

                    return message.channel.send(embedMessage);
                }
            }).catch(error => {
                console.error('L\'entrée ne se trouve pas dans la BDD...');
            message.channel.send("Une erreur s'est produite. Je n'ai pas trouvé d'image...")
            });
    }
};