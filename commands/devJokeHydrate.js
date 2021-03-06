const DevJoke = require('../models/devJoke');

const {prefix} = require('../config');
const rp = require('request-promise');
const $ = require('cheerio');

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

module.exports = {
    name: 'devjokehydrate',
    aliases: ['djh'],
    description: '',
    args: false,
    guildOnly: false,
    moderatorOnly: false,
    creatorOnly: true,
    cooldown: 1800,
    execute(message, args) {
        let messageCount = 0;

        for(let i = 0 ; i < url.length; i++) {
            rp(url[i])
                .then(html => {
                    const myLoader = $.load(html);
                    const images = url[i] !== 'http://devhumor.com/category/gifs' ? $('div[data-id]>div.item-large>a>img', html) :
                        $('div[data-id]>div.item-large>div.animated-gif>img', html);
                    let newEntryAdded = false;

                    for (let j = 0; j < images.length; j++) {

                        DevJoke.findOne({url: images[j].attribs.src})
                            .then(devJoke => {
                                // If the media is not present in the DB...
                                if (!devJoke) {
                                    let $caption = images[j].attribs.alt || 'IMAGE_GIF';
                                    const newJoke = new DevJoke({
                                        caption: $caption,
                                        url: images[j].attribs.src
                                    });
                                    // ...saves the new media in the DB
                                    newJoke.save();
                                    newEntryAdded = true;
                                }
                                if(j === images.length - 1) {
                                    if (newEntryAdded) {
                                        messageCount++;
                                        message.reply(`Nouvelle(s) image(s) ajoutée(s) depuis la source ${url[i]}`);
                                    } else {
                                        messageCount++;
                                        message.channel.send(`Aucune entrée rajoutée depuis la source ${url[i]}`);
                                    }
                                    if( messageCount === url.length) {
                                        return message.reply("Mise à jour terminée avec succès !");
                                    }
                                }
                            }).catch(error => console.error(error));
                    }
                }).catch(err => {
                    console.error(err);
                });
        }
        return message.reply(`Mise à jour en cours depuis ${url.length} source(s) différente(s)...`)
    }
};