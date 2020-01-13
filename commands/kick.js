module.exports = {
    name: 'kick',
    description: 'Kick un membre',
    args: true,
    usage: '<user>',
    guildOnly: true,
    adminOnly: false,
    cooldown: 0,
    execute(message, args) {
        if (message.member.hasPermission('KICK_MEMBERS')) {
            const user = message.mentions.users.first();
            // If we have a user mentioned
            if (user) {
                // Now we get the member from the user
                const member = message.guild.member(user);
                // If the member is in the guild
                if (member) {
                    /**
                     * Kick the member
                     * Make sure you run this on a member, not a user!
                     * There are big differences between a user and a member
                     */
                    member.kick('Optional reason that will display in the audit logs').then(() => {
                        // We let the message author know we were able to kick the person
                        message.reply(`${user.tag} a été kick du serveur !`);
                    }).catch(err => {
                        // An error happened
                        // This is generally due to the bot not being able to kick the member,
                        // either due to missing permissions or role hierarchy
                        message.reply('Je n\'ai pas réussi à kick ce membre. His power level is over 9000!!!!');
                        // Log the error
                        console.error(err);
                    });
                } else {
                    // The mentioned user isn't in this guild
                    message.reply('Cet utilisateur n\'est pas sur ce serveur...');
                }
                // Otherwise, if no user was mentioned
            } else {
                message.reply('Tu n\'as pas précisé de membre à kick !');
            }

        }else return message.reply('Désolé mais je n\'obéis qu\' à mon maître !');
    }
};