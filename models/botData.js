const mongoose = require('mongoose');

const botDataSchema = mongoose.Schema({
    language: {type: String, required: true},           //PHP only for now
    title: {type: String, required: true},              // Ex : trim
    description: {type: String, required: true},        //Ex : Supprime les espaces (ou d'autres caractères) en début et fin de chaîne
    syntax: {type: Array, required: true},              // Ex :  trim ( string $str [, string $character_mask = " \t\n\r\0\x0B" ] ) : string
    url: {type: String, required: true}                 // Ex : https://www.php.net/trim
});

module.exports = mongoose.model('botData', botDataSchema);