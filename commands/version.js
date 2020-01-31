module.exports = {
    name: 'version',
    description: 'Affiche la version du bot',
    args: false,
    usage: '',
    guildOnly: false,
    adminOnly: true,
    cooldown: 60,
    execute(message, args) {
        const {version} = require('../package');
        return message.channel.send(`\`Version actuelle d'OnegAI : ${version}\``);
    }
};