var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

module.exports = new Schema({
    name: String,
    fileName: String,
    dateCreation: { type: Date, default: Date.now },
    content: String,
    tags: [String],
    type: String
});