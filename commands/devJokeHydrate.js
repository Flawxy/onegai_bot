const DevJoke = require('../models/devJoke');

const {prefix} = require('../config');
const rp = require('request-promise');
const $ = require('cheerio');

module.exports = {
    name: 'devjokehydrate',
    aliases: ['djh'],
    description: '',
    args: false,
    guildOnly: false,
    adminOnly: true,
    cooldown: 1800,
    execute(message, args) {
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
        let messageCount = 0;


        for(let i = 0 ; i < url.length; i++) {
            rp(url[i])
                .then(html => {
                    //success!
                    const myLoader = $.load(html);
                    const images = url[i] !== 'http://devhumor.com/category/gifs' ? $('div[data-id]>div.item-large>a>img', html) :
                        $('div[data-id]>div.item-large>div.animated-gif>img', html);
                    let newEntryAdded = false;

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
                                        message.reply(`Nouvelle(s) image(s) ajoutée(s) depuis la source ${url[i]}`);
                                    } else {
                                        messageCount++;
                                        message.channel.send(`Aucune entrée rajoutée depuis la source ${url[i]}`);
                                    }
                                    if( messageCount === url.length) {
                                        return message.reply("Hydratation terminée avec succès !");
                                    }
                                }
                            }).then(() => {

                            }).catch(error => console.error(error));
                    }
                }).catch(err => {
                    console.error(err);
                });
        }
        return message.reply(`Hydratation en cours depuis ${url.length} source(s) différente(s)...`)
    }
};