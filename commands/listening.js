module.exports = {
    name: 'listening',
    description: '',
    args: false,
    usage: '',
    guildOnly: false,
    adminOnly: true,
    cooldown: 60,
    execute(message, args) {
        if(process.env.BOT_TOKEN) {
            message.channel.send('Listening from heroku server.');
        }else {
            message.channel.send('Listening from localhost.');
        }

    }
};