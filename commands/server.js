const Discord = require('discord.js');
const {botAvatar} = require('../config');

const daysFr = [
    "Dimanche",
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
];

const monthsFr = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre"
];

function embedMessage(message, creationDate){
    return new Discord.RichEmbed()
        .setColor('#0099ff')
        .setTitle(message.guild.name)
        .setAuthor(`Propriétaire : ${message.guild.owner.user.username}`, message.guild.owner.user.avatarURL)
        .setDescription(`Serveur créé le ${creationDate}`)
        .setThumbnail(botAvatar)
        .addField("Nombre de membres", message.guild.memberCount, true)
        .addField("Nombre d'emojis", message.guild.emojis.size, true)
        .setImage(message.guild.iconURL || message.guild.nameAcronym)
}

module.exports = {
    name: 'server',
    aliases: ['sv'],
    description: 'Affiche de nombreuses informations sur le serveur',
    args: false,
    usage: 'o*server',
    guildOnly: true,
    moderatorOnly: false,
    creatorOnly: false,
    cooldown: 60,
    execute(message, args) {
        const dateRaw = message.guild.createdAt;

        const dayFr = daysFr[dateRaw.getDay()];
        const dayNumber = dateRaw.getDate();
        const monthFr = monthsFr[dateRaw.getMonth()];
        const year = dateRaw.getFullYear();

        const dateFr = `${dayFr} ${dayNumber} ${monthFr} ${year}`;

        const finalMessage = embedMessage(message, dateFr);

        message.channel.send(finalMessage);
    }
};