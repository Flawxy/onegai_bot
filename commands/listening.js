module.exports = {
    name: 'listening',
    description: '',
    args: false,
    usage: '',
    guildOnly: false,
    moderatorOnly: false,
    creatorOnly: true,
    cooldown: 60,
    execute(message, args) {
        process.env.BOT_TOKEN ?
            message.channel.send('Listening from heroku server.') :
            message.channel.send('Listening from localhost.');
    }
};