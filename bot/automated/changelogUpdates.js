const Discord = require('discord.js');
const fetch = require('node-fetch');
const docUrl = 'http://onegai-site.herokuapp.com/doc';
const Changelog = require('../../models/changelog');
const {botAvatar} = require('../../config');
const missingChannelMessage = require('./_missingChannelMessage');

module.exports = (botClient, timeInSeconds, channelName) => {
    botClient.setInterval(() => {
        fetch('http://onegai-site.herokuapp.com/api/changelog')
            .then(res => res.json())
            .then(json => {
                Changelog.findOne({version: json.botVersion})
                    .then(changelog => {
                        // If the changelog is already present in the DB (!= new) stops the function
                        if(changelog) return;

                        const newChangelog = new Changelog({
                            title: json.title,
                            version: json.botVersion,
                            introduction: json.introduction,
                            image: json.image,
                            url: 'https://onegai-site.herokuapp.com/posts/' + json.slug
                        });

                        // Saves the new changelog in the DB
                        newChangelog.save();

                        // Browses every Discord servers onegAi is present in
                        botClient.guilds.forEach(guild => {
                            // Selects the proper channel
                            const channel = guild.channels.find(ch => ch.name === channelName);
                            // If the channel doesn't exist, contacts the server owner
                            if(!channel) {
                                return guild.owner.user.send(missingChannelMessage(guild.name, channelName));
                            }
                            // Instantiates a new rich embed message
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
    },1000*timeInSeconds);
};