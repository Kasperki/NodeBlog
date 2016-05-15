var crypto = require('crypto');
var exports = module.exports = {};

const SALTLENGHT = 64;
const HASHLENGHT = 128;

/**
 * Generate random salt
 * @return string
 */
exports.GenSalt = function() 
{
    return crypto.randomBytes(SALTLENGHT).toString('hex');
}

/**
 * Hash string
 * @param string data
 * @return string
 */
exports.HashSync = function(data, salt)
{
    if (typeof salt === 'undefined' || !salt) {
        salt = exports.GenSalt();
    }
    
    const key = crypto.pbkdf2Sync(data, salt, 100000, HASHLENGHT, 'sha512').toString('hex');
    return salt + key;
}

/**
 * Compare data and hash are they same
 * @param string data
 * @param string hash
 * @return boolean
 */
exports.CompareSync = function (data, hash) 
{    
	var same = true;
        
    var salt = hash.substr(0, hash.length - 256);
	var data_hash = exports.HashSync(data, salt);
	var data_hash_length = data_hash.length;

	same = data_hash_length == hash.length;

	var max_length = (data_hash_length < hash.length) ? data_hash_length : hash.length;

	// to prevent timing attacks, should check entire string
	// don't exit after found to be false
	for (var i = 0; i < max_length; ++i) {
		if (data_hash_length >= i && hash.length >= i && data_hash[i] != hash[i]) {
			same = false;
		}
	}

	return same;
}