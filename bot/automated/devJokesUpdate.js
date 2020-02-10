const DevJoke = require('../../models/devJoke');
const rp = require('request-promise');
const $ = require('cheerio');
const {adminServerId} = process.env.ADMIN_SERVER_ID || require('../../auth.json');

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
module.exports = (botClient, timeInMinutes, channelName) => {
    botClient.setInterval(() => {
        let messageCount = 0;
        let updateMessage = true;

        for (let i = 0; i < url.length; i++) {
            rp(url[i])
                .then(html => {
                    const myLoader = $.load(html);
                    const images = url[i] !== 'http://devhumor.com/category/gifs' ? $('div[data-id]>div.item-large>a>img', html) :
                        $('div[data-id]>div.item-large>div.animated-gif>img', html);
                    let newEntryAdded = false;
                    botClient.guilds.forEach(guild => {
                        const channel = guild.channels.find(ch => ch.name === channelName);
                        // If the channel doesn't exist or is not part of the admin server, stops everything
                        if (!channel || (guild.id !== process.env.ADMIN_SERVER_ID && guild.id !== adminServerId)) return;

                        for (let j = 0; j < images.length; j++) {

                            DevJoke.findOne({url: images[j].attribs.src})
                                .then(devJoke => {
                                    // If the media is not present in the DB
                                    if (!devJoke) {
                                        let $caption = images[j].attribs.alt || 'IMAGE_GIF';
                                        const newJoke = new DevJoke({
                                            caption: $caption,
                                            url: images[j].attribs.src
                                        });
                                        // Saves the new media in the DB
                                        newJoke.save();
                                        newEntryAdded = true;
                                    }
                                    if (j === images.length - 1) {
                                        if (newEntryAdded) {
                                            messageCount++;
                                            channel.send(`${guild.owner} **Nouvelle(s) image(s) ajoutée(s) depuis la source ${url[i]}**`);
                                        } else {
                                            messageCount++;
                                            channel.send(`Aucune entrée rajoutée depuis la source \`${url[i]}\``);
                                        }
                                        if (messageCount === url.length) {
                                            return channel.send(`${guild.owner}Mise à jour terminée avec succès !`);
                                        }
                                    }
                                }).catch(error => console.error(error));
                        }
                        if (updateMessage) {
                            updateMessage = false;
                            return channel.send(`${guild.owner} Mise à jour en cours depuis ${url.length} source(s) différente(s)...`)
                        }
                    });
                }).catch(err => {
                console.error(`Erreur lors de la mise à jour de la BDD pour les devJokes : ${err}`);
            });
        }
    }, 1000 * 60 * timeInMinutes);
};