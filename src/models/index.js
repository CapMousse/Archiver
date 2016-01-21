var mongoose = require(__dirname + '/../utils/mongodb.js'),
    DocSchema = require(__dirname + '/document.js'),
    TagSchema = require(__dirname + '/tag.js');

module.exports = {
    Document: mongoose.model('Document', DocSchema),
    Tag: mongoose.model('Tag', TagSchema)
};
