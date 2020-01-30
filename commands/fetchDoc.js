const Discord = require('discord.js');

const PhpDoc = require('../models/phpDoc');

const {prefix, botAvatar} = require('../config');
const rp = require('request-promise');
const $ = require('cheerio');

function normalizeSyntax(array) {
    array = array.replace('é', ',');
    array = array.replace('[', ' [');
    array = array.replace('(',' (');
    array = array.replace(']', ' ]');
    array = array.replace(')',' )');
    array = array.replace('  ', ' ');
    return array;
}

function displayResponse(docRequest, args) {

    return new Discord.RichEmbed()
        .setColor('#8585c2')
        .setTitle(docRequest.name)
        .setURL(`https://www.php.net/${args[1]}`)
        .setDescription(docRequest.description)
        .setThumbnail(botAvatar)
        .addField('Syntaxe :', '```c++\n' + docRequest.syntax + "```")
        .setImage('https://i.ibb.co/qmfr51w/logo-php-color.png')
        .setFooter('Source : https://www.php.net/', 'https://i.ibb.co/YL0VybJ/php-Favicon.png');
}


module.exports = {
    name: 'fetchdoc',
    aliases: ['fd'],
    description: 'Cherche la documentation de la notion précisée dans le langage précisé (PHP uniquement actuellement).',
    args: true,
    usage: '<langage> <notion>',
    guildOnly: false,
    adminOnly: false,
    cooldown: 0,
    execute(message, args) {
        if (!args[1]) return message.channel.send(`\nLa bonne syntaxe est : \`${prefix}${this.name} ${this.usage}\``);
        if (args[0].toLowerCase() === 'php' && args[1]) {
            //Tout ce qui concerne la documentation PHP
            const url = `https://www.php.net/fr/${args[1]}`;

            rp(url)
                .then(html => {
                    //success!
                    const myLoader = $.load(html);
                    if($('.methodsynopsis', html).length === 0){
                        const closestMatch = $('#quickref_functions > li', html).eq(0).text();
                        message.reply("Il semblerait que cette fonction n\'existe pas..." +
                            `\nRésultat le plus proche : **${closestMatch}**`);
                        return this.execute(message, ['php', closestMatch]);

                    }
                    const refName = $('.refname', html).eq(0).text().trim();
                    const description = $('.dc-title', html).text().trim() ;
                    let syntax = '';

                    for (let i = 0; i < $('.methodsynopsis', html).length; i++){
                        let tab = $('.methodsynopsis', html).eq(i).text().trim().replace(',','é').split(/\n */);
                        let tab2 = '';
                        for (let j = 0; j < tab.length; j++)
                        {
                            tab2 += tab[j].replace('\,', '');
                        }

                        syntax += `${normalizeSyntax(tab2)}`;

                    }
                    PhpDoc.findOne({ name: refName })
                        .then(phpDoc =>{
                        // Si la recherche n'existe pas dans la BDD
                        if(!phpDoc) {
                            const newDoc = new PhpDoc({
                                name: refName,
                                description: description,
                                syntax: syntax,
                                url: url
                            });
                            // On ajoute la recherche en nouvelle entrée de BDD
                            newDoc.save()
                                // Puis on affiche le résultat à l'utilisateur
                                .then((newDoc) => {
                                    console.log(`L'entrée ${newDoc.name} a bien été ajoutée à la BDD !`);

                                    return message.reply(displayResponse(newDoc, args));
                                }).catch(error => console.error('Erreur lors de l\'enregistrement dans la BDD : '+error));
                        // Si la recherche est présente dans la BDD on l'affiche directement
                        }else {
                            return message.reply(displayResponse(phpDoc, args));
                        }
                        }).catch(error => console.error(error));
                }).catch(err =>{ console.log(err); });
        }
    }
};