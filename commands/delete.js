module.exports = {
    name: 'delete',
    aliases: ['del'],
    description: 'Supprime le nombre précisé de commentaires',
    args: true,
    usage: '<nombre>',
    guildOnly: false,
    adminOnly: false,
    cooldown: 1,
    execute(message, args) {
        if(message.member.hasPermission('MANAGE_CHANNELS')) {
            const amount = parseInt(args[0]) + 1;

            if (isNaN(amount)) {
                return message.reply('Ça n\'a pas l\'air d\'être un nombre valide...');
            } else if (amount <= 1 || amount > 100) {
                return message.reply('Il faut préciser un nombre entre 1 et 99');
            }

            let generatedError = false;
            message.channel.bulkDelete(amount, true)
                .catch(err => {
                    generatedError = true;
                    console.error(err);
                    message.channel.send('J\'ai rencontré une erreur en essayant de supprimer des messages sur ce chan...');
                });

            if(!generatedError) {
                if(amount - 1 > 1) {
                    return message.reply(`${amount - 1} messages supprimés !`)
                        .then(sentMessage => {sentMessage.delete(3000)});
                }else {
                    return message.reply(`${amount - 1} message supprimé !`)
                        .then(sentMessage => {sentMessage.delete(3000)});
                }

            }


        }else return message.reply('Désolé mais je n\'obéis qu\' à mon maître !');
    }

};