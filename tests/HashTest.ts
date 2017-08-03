import "mocha";
import * as assert from "assert";
import * as hash from "../blog/Hash";

describe('Hash', () => {
    describe('GenSalt()', () => {
        it('should generate random salt string', () => {
            let actual = hash.GenSalt();
            
            assert.strictEqual(typeof actual, "string");
            assert.strictEqual(actual.length, 128);
        });
    });
    describe('HashSync()', () => {
        it('should hash data', () => {
            let data = "myPassword";
            let salt = "salt";
            let actual = hash.HashSync(data, salt);

            assert.notEqual(actual, data);
            assert.strictEqual(actual.length, 256 + salt.length);
        });
        it('should produce same hash data with same salt', () => {
            let data = "myPassword";
            let salt = "salt";
            let actual = hash.HashSync(data, salt);
            let actual2 = hash.HashSync(data, salt);

            assert.strictEqual(actual, actual2);
        });
        it('should produce different hash data with different salt', () => {
            let data = "myPassword";
            let salt = "salt";
            let salt2 = "suga";
            let actual = hash.HashSync(data, salt);
            let actual2 = hash.HashSync(data, salt2);

            assert.notEqual(actual, actual2);
        });
        it('should produce different hash data with different data', () => {
            let data = "myPassword";
            let data2 = "mypassword";
            let salt = "salt";
            let actual = hash.HashSync(data, salt);
            let actual2 = hash.HashSync(data2, salt);

            assert.notEqual(actual, actual2);
        });
        it('should join salt to hash', () => {
            let data = "myPassword";
            let salt = "mySaltIsGreatxD"
            let actual = hash.HashSync(data, salt);

            assert.strictEqual(actual.substr(0, salt.length), salt);
        });
        it('should generate salt if not salt given', () => {
            let data = "myPassword";
            let actual = hash.HashSync(data);

            assert.strictEqual(actual.length, 128 + 256);
        });
    });
    describe('CompareSync()', () => {
        it('should return true if data & hash are equal | noSalt', () => {
            let data = "myPassword";
            let encrypted = hash.HashSync(data);

            assert.strictEqual(hash.CompareSync(data, encrypted), true);
        });
        it('should return true if data & hash are equal | givenSalt', () => {
            let data = "myPassword";
            let encrypted = hash.HashSync(data, "ImSweetnotSalty11");

            assert.strictEqual(hash.CompareSync(data, encrypted), true);
        });
        it('should return false if original data & hash data are not equal', () => {
            let data = "myPassword";
            let encrypted = hash.HashSync(data);

            assert.strictEqual(hash.CompareSync("mypassword", encrypted), false);
        });
        it('should return false if original data & hash data are not equal', () => {
            let data = "myPassword";
            let encrypted = hash.HashSync(data);

            assert.strictEqual(hash.CompareSync("myPassword1", encrypted), false);
        });
        it('should return false if original data & hash data are not equal', () => {
            let data = "myPassword";
            let encrypted = hash.HashSync(data);

            assert.strictEqual(hash.CompareSync("myPasswor", encrypted), false);
        });
    });
});