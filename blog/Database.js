var mongoose = require('mongoose');
var config = require('../config.js');
var exports = module.exports = {};

/**
 * Makes connection to database
 * @param callback (err, boolean)
 */
exports.connectToDatabase = function(callback) 
{
    var dbHost = config.database.host + config.database.schema; 
    mongoose.connect(dbHost);

    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    
    db.once('open', function() {
        console.log("Connected to DB");
        if (typeof callback === "function") {
            callback(null, true);
        }
    });
}

exports.disconnectFromDatabase = function ()
{
    mongoose.connection.close();
}