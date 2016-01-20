var mongoose = require(__dirname + '/../utils/mongodb.js'),
	DocShema = require(__dirname + '/document.js');

module.exports = {
	Document: mongoose.model('Document', DocShema)
};
