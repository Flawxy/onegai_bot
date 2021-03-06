module.exports = {
    name: 'avatar',
    aliases: ['pp'],
    description: 'Affiche l\'avatar des utilisateurs précisés, sinon affiche son propre avatar',
    args: false,
    usage: '',
    guildOnly: false,
    moderatorOnly: false,
    creatorOnly: false,
    cooldown: 0,
    execute(message, args) {
        if (!message.mentions.users.size) {
            return message.channel.send(`Ton avatar : <${message.author.displayAvatarURL}>`);
        }

        const avatarList = message.mentions.users.map(user => {
            return `Avatar de ${user.username} : <${user.displayAvatarURL}>`;
        });

        // Sends the entire array of strings as a message
        // By default, discord.js will `.join()` the array with `\n`
        return message.channel.send(avatarList);
    }
};