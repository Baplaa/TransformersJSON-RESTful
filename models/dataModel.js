const mongoose = require('mongoose');

const botModel = new mongoose.Schema({
    faction: {type: String},
    name: {type: String},
    position: {type: String}
});

module.exports = mongoose.model("Bot", botModel);