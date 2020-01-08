module.exports = {
    name: 'server',
    description: 'Affiche le nom du serveur et le nombre de membres',
    args: false,
    usage: '',
    guildOnly: true,
    cooldown: 60,
    execute(message, args) {
        message.channel.send(`Nom du serveur : ${message.guild.name}\nNombre de membres : ${message.guild.memberCount}`);
    }
};