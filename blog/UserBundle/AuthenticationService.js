var crypto = require('crypto');
var mongoose = require('mongoose');
var config = require('../../config.js');
var Logger = require('../Logger.js');
var exports = module.exports = {};

var Sessions = [];

function Session(id, token, expires, username) 
{
    this.id = id;
    this.token = token;
    this.expires = expires;
    this.username = username;
}

/**
 * Creates new session
 * @param string username
 * @returns Session
 */
exports.CreateSession = function(username) 
{
    session = new Session();
    var objectId = new mongoose.Types.ObjectId;
    session.id = objectId.toString();
    session.token = crypto.randomBytes(64).toString('hex');
    session.expires = new Date(new Date().getTime() + 3600000).toUTCString();
    session.username = username;
    Sessions.push(session);
    
    return session;
}

/**
 * Removes Session
 * @param string id
 */
exports.RemoveSession = function (id) 
{
    for (var i = 0; i < Sessions.length; i++) {
        if (Sessions[i].id === id) {
            Sessions.splice(i, 1);
        }
    }
}

/**
 * Checks if id & token belongs to valid session
 * @param string id
 * @param string token
 * @returns Session
 */
exports.IsTokenValid = function(id, token)
{
    if (!id || !token)
        return null;
    
    for (var i = 0; i < Sessions.length; i++) {
        if (Sessions[i].id === id && Sessions[i].token === token) {            
            if (new Date() > new Date(Sessions[i].expires)) {
                Sessions.splice(i, 1);
                return null;
            }
            return Sessions[i];
        }
    }
    
    Logger.Warning(config.log.error, "Invalid token: id:" + id + " token: " + token);
    return null;
}

/**
 * Get Session array
 * @return Session[]
 */
exports.GetSessions = function() 
{
    return Sessions;
}