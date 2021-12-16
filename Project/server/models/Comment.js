const mongoose = require('mongoose')

const Schema = mongoose.Schema;

let commentSchema = new Schema ({
    username: {type: String},
    snippetId: {type: String},
    comment: {type: String},
    votes: {type: Number},
    voters: {type: [String], default: undefined},
    date: {type: Date}

});

module.exports = mongoose.model("Comment", commentSchema);