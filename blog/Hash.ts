import * as crypto from "crypto";

const SALTLENGHT = 64;
const HASHLENGHT = 128;

/**
 * Generate random salt
 * @return string
 */
export function GenSalt()
{
    return crypto.randomBytes(SALTLENGHT).toString('hex');
}

/**
 * Hash string
 * @param string data
 * @return string
 */
export function HashSync(data: string, salt?: string)
{

    if (typeof salt === 'undefined' || !salt)
    {
        salt = GenSalt();
    }

    const key = crypto.pbkdf2Sync(data, salt, 150000, HASHLENGHT, 'sha512').toString('hex');
    return salt + key;
}

/**
 * Compare data and hash are they same
 * @param string data
 * @param string hash
 * @return boolean
 */
export function CompareSync(data: string, hash: string)
{
    let same = true;

    let salt = hash.substr(0, hash.length - 256);
    let data_hash = HashSync(data, salt);
    let data_hash_length = data_hash.length;

    same = data_hash_length == hash.length;

    var max_length = (data_hash_length < hash.length) ? data_hash_length : hash.length;

    // to prevent timing attacks, should check entire string
    // don't exit after found to be false
    for (let i = 0; i < max_length; ++i)
    {
        if (data_hash_length >= i && hash.length >= i && data_hash[i] != hash[i])
        {
            same = false;
        }
    }

    return same;
}