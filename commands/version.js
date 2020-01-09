module.exports = {
    name: 'version',
    description: 'Affiche la version du bot',
    args: false,
    usage: '',
    guildOnly: true,
    cooldown: 60,
    execute(message, args) {
        const {version} = require('../package');
        return message.channel.send("`Version actuelle de onegAI : " +version+ "`");
    }
};