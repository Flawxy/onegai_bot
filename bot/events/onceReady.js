const Discord = require('discord.js');

module.exports = botClient => {
    botClient.once('ready', () => {
        // Sets the bot's presence (status + game played)
        return botClient.user.setPresence({game: {name: 'rapporter la baballe'}, status: 'online'})
            .then((clientUser) => console.log(`Statut du bot attribué : "Joue à ${clientUser.localPresence.game.name} + Statut : ${clientUser.localPresence.status}"`))
            .catch(error => {
                console.log('Erreur lors de l\'attribution du statut du bot : ' + error)
            });
    });

};