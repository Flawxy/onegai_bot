const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const changelogSchema = mongoose.Schema({
    title: {type: String, required: true, unique: true},        // Ex : "Changelog 0.5.0"
    version: {type: String, required: true, unique: true},     // Ex : "0.5.0"
    introduction: {type: String, required: true},            // Ex : "OnegAI passe en version 0.5.0 !"
    image: {type: String, required: true},                  // Ex :  trim ( string $str [, string $character_mask = " \t\n\r\0\x0B" ] ) : string
    url: {type: String, required: true}                     // Ex : http://onegai-site.herokuapp.com/posts/changelog-0-5-0
});

changelogSchema.plugin(uniqueValidator);

module.exports = mongoose.model('changelog', changelogSchema);