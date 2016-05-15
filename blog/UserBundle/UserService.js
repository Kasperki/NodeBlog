var crypto = require('crypto');
var mongoose = require('mongoose');
var config = require('../../config.js');
var hash = require('../Hash.js');
var exports = module.exports = {};

//Create a schema for User
var userSchema = mongoose.Schema({
    username: { type: String, index: true, unique: true },
    password: String
});

//User model
var User = mongoose.model('User', userSchema, "user");
exports.User = User;

/**
 * Save user to db
 * @param string username
 * @param string password
 * @param callback (err, true)
 */
exports.AddUser = function (username, password, callback) 
{
    passwdHash = hash.HashSync(password);
    
    var user = new User({
        username: username,
        password: passwdHash
    });

    user.save(function (err) {
        if (typeof callback === "function") {
            callback(err, true);
        }
    });
};

/**
 * Get user from database
 * @param string username
 * @return User
 */
exports.FindUser = function (username, callback) 
{
    User.find({ 'username': username }, 'username password', function (err, result) {
        if (err) throw err;
                
        if (typeof callback === "function") {
            callback(null, result[0]);
        }
    });
}

/**
 * Remove user from database
 * @param string username
 * @param function callback
 */
exports.RemoveUser = function (username, callback) 
{
    User.remove({ username : username }, function (err) {
     if (typeof callback === "function") {
            callback(err, true);
        }
    });
}

/**
 * Validates is login information correct
 * @param string username
 * @param string password
 * @return boolean
 */
exports.ValidateLogin = function (username, password, callback) 
{
    if (!username || !password) {
        if (typeof callback === "function") {
            callback(null, false);
            return;
        }
    }
    
    exports.FindUser(username, function (err, user) {
           
        if (typeof user === 'undefined' || user === null) {
            if (typeof callback === "function") {
                callback(err, false);
                return;
            }
        }

        if (user.username === username && hash.CompareSync(password, user.password))
        {
            if (typeof callback === "function") {
                callback(err, true);
                return;
            }
        }
    
         if (typeof callback === "function") {
            callback(err, false);
        }
    });
}