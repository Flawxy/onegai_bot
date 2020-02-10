// Contains the message to display if a server where the bot is doesn't have the correct text channel or if the bot
// doesn't have the permissions to write in it
module.exports = (serverName, missingChannelName) => {
    return `Désolé de t'importuner mais il me semble que tu es le propriétaire du Discord **${serverName}** et je n'ai \
pas réussi à y envoyer un message car ce serveur ne dispose pas de salon textuel nommé "**${missingChannelName}**" \
ou bien je n'y dispose pas des permissions d'écriture.
Ce salon me permet de communiquer avec ta communauté en la tenant au courant de mes dernières informations (comme \
mes mises à jour par exemple) !
Tu peux remédier à ce problème en créant un salon textuel "**${missingChannelName}**" et m'y donner les droits \
d'écriture. Ou tu peux ignorer ce message si tu ne désires pas être informé de mon actualité.
Bonne journée et merci encore d'utiliser OnegAI !` ;
};