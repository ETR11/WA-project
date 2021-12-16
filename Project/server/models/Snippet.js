const mongoose = require('mongoose')

const Schema = mongoose.Schema;

let snippetSchema = new Schema ({
    username: {type: String},
    title: {type: String},
    description: {type: String},
    code: {type: String},
    votes: {type: Number},
    voters: {type: [String], default: undefined},
    date: {type: Date}

});

module.exports = mongoose.model("Snippet", snippetSchema);