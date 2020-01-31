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
    description: 'Affiche le nom du serveur et le nombre de membres',
    args: false,
    usage: 'o*server',
    guildOnly: true,
    adminOnly: false,
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