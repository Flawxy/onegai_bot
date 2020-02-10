const fetch = require('node-fetch');

module.exports = {
    name: 'version',
    description: 'Affiche la version du bot',
    args: false,
    usage: '',
    guildOnly: false,
    moderatorOnly: false,
    creatorOnly: true,
    cooldown: 60,
    execute(message, args) {
        fetch('http://onegai-site.herokuapp.com/api/changelog')
            .then(res => res.json())
            .then(json => {
                return message.channel.send(`\`Version actuelle d'OnegAI : ${json.botVersion}\``);
            });
    }
};