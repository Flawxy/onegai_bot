const {token} = process.env.BOT_TOKEN || require('../auth.json');

module.exports = botClient => {
    return botClient.login(process.env.BOT_TOKEN || token)
        .then(() => {
            console.log('onegAI is ready to go!');
            process.env.BOT_TOKEN ?
                console.log('Currently listening from heroku server!') :
                console.log('Currently listening from local host!');
        })
        .catch(console.error);
};