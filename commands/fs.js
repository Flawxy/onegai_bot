const {prefix} = require('../config');

module.exports = {
    name: 'fs',
    description: 'Raccourci de fetchSyntax',
    args: true,
    usage: '<langage> <notion>',
    guildOnly: false,
    cooldown: 0,
    execute(message, args) {
        if (!args[1]) return message.channel.send(`\nLa bonne syntaxe est : \`${prefix}${this.name} ${this.usage}\``);
        if (args[0].toLowerCase() === 'php' && args[1]) {
            //Tout ce qui concerne la documentation PHP

            const rp = require('request-promise');
            const url = `https://www.php.net/${args[1]}`;

            rp(url)
                .then(function(html){
                    //success!
                    console.log(html);
                })
                .catch(function(err){
                    //handle error
                });





            return message.reply(`<https://www.php.net/${args[1]}>`);
        }

    }
};