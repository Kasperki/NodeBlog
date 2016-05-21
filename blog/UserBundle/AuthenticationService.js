var crypto = require('crypto');
var mongoose = require('mongoose');
var config = require('../../config.js');
var Logger = require('../Logger.js');
var exports = module.exports = {};

var Sessions = [];

function Session(id, token, expires) 
{
    this.id = id;
    this.token = token;
    this.expires = expires;
}

/**
 * Creates new session
 * @returns Session
 */
exports.CreateSession = function() 
{
    session = new Session();
    session.id = new mongoose.Types.ObjectId;
    session.id = session.id.toString();
    session.token = crypto.randomBytes(64).toString('hex');
    session.expires = new Date(new Date().getTime() + 3600000).toUTCString();
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
 * @returns boolean
 */
exports.IsTokenValid = function(id, token)
{
    if (!id || !token)
        return false;
    
    for (var i = 0; i < Sessions.length; i++) {
        if (Sessions[i].id === id && Sessions[i].token === token) {            
            if (new Date() > new Date(Sessions[i].expires)) {
                Sessions.splice(i, 1);
                return false;
            }
            return true;
        }
    }
    
    Logger.Warning(config.log.error, "Invalid token: id:" + id + " token: " + token);
    return false;
}

/**
 * Get Session array
 * @return Session[]
 */
exports.GetSessions = function() 
{
    return Sessions;
}