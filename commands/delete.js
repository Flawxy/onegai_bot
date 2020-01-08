module.exports = {
    name: 'delete',
    description: 'Supprime le nombre précisé de commentaires',
    args: true,
    usage: '<nombre>',
    guildOnly: false,
    cooldown: 15,
    execute(message, args) {
        if(message.member.hasPermission('MANAGE_CHANNELS')) {
            const amount = parseInt(args[0]) + 1;

            if (isNaN(amount)) {
                return message.reply('Ça n\'a pas l\'air d\'être un nombre valide...');
            } else if (amount <= 1 || amount > 100) {
                return message.reply('Il faut préciser un nombre entre 1 et 99');
            }

            message.channel.bulkDelete(amount, true).catch(err => {
                console.error(err);
                message.channel.send('J\'ai rencontré une erreur en essayant de supprimer des messages sur ce chan...');
            });

            message.reply(`${amount - 1} message supprimés !`)

        }else return message.reply('Désolé mais je n\'obéis qu\' à mon maître !');
    }
  
};