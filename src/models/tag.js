var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

module.exports = new Schema({
    name: String,
    filter: String,
    isRegexp: Boolean
});