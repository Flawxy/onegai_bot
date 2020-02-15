const { prefix } = require('../config.json');

module.exports = {
    name: 'help',
    aliases: ['?'],
    description: 'Liste des commandes disponibles.',
    args: false,
    usage: '[command name]',
    guildOnly: false,
    moderatorOnly: false,
    creatorOnly: false,
    cooldown: 5,
    execute(message, args) {
        let commandName = [];
        const { commands } = message.client;
        if (!args.length) {

            commands.forEach(command => {
                if(!command.creatorOnly){
                    commandName.push(command.name);
                }
            });

            return message.channel.send("Voici une liste de mes commandes :")
                .then(message.channel.send(`\`${commandName.join(' | ')}\``))
                .then(message.channel.send(`Tu peux utiliser \`${prefix}${this.name} <nom d'une commande>\` pour avoir plus d'informations sur une commande !`));
        }

        const name = args[0].toLowerCase();
        const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

        if (!command) {
            return message.reply('Ce n\'est pas une commande valide !');
        }
        if(command.creatorOnly) { return; }

        const data = [];

        data.push(`**Nom :** ${command.name}`);

        if (command.aliases) data.push(`**Raccourci :** ${command.aliases}`);
        if (command.description) data.push(`**Description :** ${command.description}`);
        if (command.usage) data.push(`**Utilisation :** ${prefix}${command.name} ${command.usage}`);

        data.push(`**Cooldown :** ${command.cooldown || 1} seconde(s)`);

        message.channel.send(data, { split: true });
    }
};