const Discord = require('discord.js');
const bot = new Discord.Client();

// Bot connexion
const login = require('./bot/login');
login(bot);
// DB connexion
const dbConnect = require('./bot/dbConnect');
dbConnect();
// Sets the bot's presence (status + game played) once its connected
const onceReady = require('./bot/events/onceReady');
onceReady(bot);
// Sets the bot behaviour when a new member joins the Discord server
const newMember = require('./bot/events/onGuildMemberAdd');
newMember(bot, 'test-bot');
// Sets the bot behaviour for specified messages
const onMessage = require('./bot/events/onMessage');
onMessage(bot);

/* -------------------- 🢃 AUTOMATED FUNCTIONS 🢃 -------------------- */
// Displays a new changelog when it's available on the website
const changelogUpdates = require('./bot/automated/changelogUpdates');
changelogUpdates(bot, 60, 'onegai');

// Updates the DB with new devJokes images
const devJokesUpdate = require('./bot/automated/devJokesUpdate');
devJokesUpdate(bot, 60*8, 'onegai-updates');