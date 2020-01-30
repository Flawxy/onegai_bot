const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const devJokeSchema = mongoose.Schema({
    caption: {type: String},
    url: {type: String, required: true, unique: true},
});

devJokeSchema.plugin(uniqueValidator);

module.exports = mongoose.model('devJoke', devJokeSchema);