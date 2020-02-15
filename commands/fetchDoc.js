const Discord = require('discord.js');
const PhpDoc = require('../models/phpDoc');
const {prefix, botAvatar} = require('../config');
const rp = require('request-promise');
const $ = require('cheerio');

// Formats the function syntax(es) display (adds some colors!)
function formatSyntax(string) {
    return `\`\`\`scss\n${string}\`\`\``;
}

// Formats the response to return (Discord rich embed message)
function displayResponse(docRequest, args) {

    const syntaxNumber = docRequest.syntax.length;

    let response = new Discord.RichEmbed()
        .setColor('#8585c2')
        .setTitle(docRequest.name)
        .setURL(`https://www.php.net/${args[1]}`)
        .setDescription(docRequest.description)
        .setThumbnail(botAvatar)
        .setImage('https://i.ibb.co/qmfr51w/logo-php-color.png')
        .setFooter(`Source : https://www.php.net/${args[1]}`, 'https://i.ibb.co/YL0VybJ/php-Favicon.png');

    if(syntaxNumber === 1) {
        response.addField("Syntaxe :", formatSyntax(docRequest.syntax))
    }else {
        for(let i =0; i < syntaxNumber; i++) {
            response.addField(`Syntaxe ${i+1} :`, formatSyntax(docRequest.syntax[i]));
        }
    }

    return response;
}

// Formats a syntax to fit in the response
function normalizeSyntax(string) {
    return string.trim()
        .replace(/ {2,}/g, ' ')
        .replace(/\n/g, '');
}

module.exports = {
    name: 'fetchdoc',
    aliases: ['fd'],
    description: 'Cherche la documentation de la fonction précisée dans le langage précisé (PHP uniquement actuellement).',
    args: true,
    usage: '<langage> <notion>',
    guildOnly: false,
    moderatorOnly: false,
    creatorOnly: false,
    cooldown: 0,
    execute(message, args) {
        if (!args[1]) return message.channel.send(`\nLa bonne syntaxe est : \`${prefix}${this.name} ${this.usage}\``);

        // PHP category
        if (args[0].toLowerCase() === 'php' && args[1]) {
            const url = `https://www.php.net/fr/${args[1]}`;

            rp(url)
                .then(html => {
                    const myLoader = $.load(html);
                    const result = $('.methodsynopsis', html)
                    if(result.length === 0){
                        const closestMatch = $('#quickref_functions > li', html).eq(0).text();
                        message.reply("Il semblerait que cette fonction n'existe pas...");
                        if(!closestMatch) return message.channel.send("Je n'ai pas trouvé de résultat ressemblant...");

                        message.reply(`Résultat le plus proche : **${closestMatch}**`);
                        return this.execute(message, ['php', closestMatch]);

                    }
                    const refName = $('.refname', html).eq(0).text().trim();
                    const description = $('.dc-title', html).text().trim() ;

                    const syntaxes = $('div.methodsynopsis.dc-description', html);
                    let syntax = [];
                    for(let i =0; i < syntaxes.length; i++) {
                        syntax = syntax.concat(normalizeSyntax(syntaxes.eq(i).text()));
                    }

                    PhpDoc.findOne({ name: refName })
                        .then(phpDoc =>{
                        // If the searched function is not present in the DB...
                        if(!phpDoc) {
                            const newDoc = new PhpDoc({
                                name: refName,
                                description: description,
                                syntax: syntax,
                                url: url
                            });
                            // ...saves the new function in the DB...
                            newDoc.save()
                                // ...then displays the result
                                .then((newDoc) => {
                                    console.log(`L'entrée ${newDoc.name} a bien été ajoutée à la BDD !`);

                                    return message.channel.send(displayResponse(newDoc, args));
                                }).catch(error => console.error('Erreur lors de l\'enregistrement dans la BDD : '+error));
                        // If the searched function already exists in the DB, displays it
                        }else {
                            return message.reply(displayResponse(phpDoc, args));
                        }
                        }).catch(error => console.error(error));
                }).catch(err =>{ console.log(err); });
        }else {
            return message.reply(`Je ne connais pas encore le langage ${args[0]} ! Je ne prends en charge que le langage PHP actuellement.`)
        }
    }
};