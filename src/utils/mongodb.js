var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/archiver');

module.exports = mongoose;