module.exports = (botClient, welcomeChannelName) => {
    botClient.on('guildMemberAdd', member => {
        // Selects the proper channel
        const channel = member.guild.channels.find(ch => ch.name === welcomeChannelName);
        // If the channel doesn't exist, stops the function
        if (!channel) return;
        // Displays a welcome message if the channel exists
        channel.send(`Bienvenue sur le serveur de ${member.guild.owner}, ${member} !`);
    });
};