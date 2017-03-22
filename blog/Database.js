var mongoose = require('mongoose');
var config = require('../config.js');
var Logger = require('./Logger.js');
var exports = module.exports = {};

/**
 * Makes connection to database
 * @param callback (err, boolean)
 */
exports.connectToDatabase = function(callback) 
{
    var dbHost = config.database.host + config.database.schema; 
    
    var options = {
        user: config.database.user,
        pass: config.database.password
    }
    
    mongoose.connect(dbHost, options);

    var db = mongoose.connection;
    db.on('error', function (err) {
        Logger.Warning(config.log.error, "Connection error: " + err);
    });
    
    db.once('open', function() {
        Logger.Debug(config.log.error, "Connected to DB");
        if (typeof callback === "function") {
            callback(null, true);
        }
    });
}

exports.disconnectFromDatabase = function ()
{
    mongoose.connection.close();
}