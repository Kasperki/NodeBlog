const assert = require('assert');
var hash = require('../app/blog/Hash.js');

describe('Hash', function () {
    describe('GenSalt()', function () {
        it('should generate random salt string', function(){
            var actual = hash.GenSalt();
            
            assert.strictEqual(typeof actual, "string");        
            assert.strictEqual(actual.length, 128);
        });
    });
    describe('HashSync()', function () {
        it('should hash data', function() {
            var data = "myPassword";
            var salt = "salt";
            var actual = hash.HashSync(data, salt);
            
            assert.notEqual(actual, data);
            assert.strictEqual(actual.length, 256 + salt.length);
        });
        it('should produce same hash data with same salt', function() {
            var data = "myPassword";
            var salt = "salt";
            var actual = hash.HashSync(data, salt);
            var actual2 = hash.HashSync(data, salt);
            
            assert.strictEqual(actual, actual2);
        });
        it('should produce different hash data with different salt', function() {
            var data = "myPassword";
            var salt = "salt";
            var salt2 = "suga";
            var actual = hash.HashSync(data, salt);
            var actual2 = hash.HashSync(data, salt2);
            
             assert.notEqual(actual, actual2);
        });
        it('should produce different hash data with different data', function() {
            var data = "myPassword";
            var data2 = "mypassword";
            var salt = "salt";
            var actual = hash.HashSync(data, salt);
            var actual2 = hash.HashSync(data2, salt);
            
             assert.notEqual(actual, actual2);
        });
        it('should join salt to hash', function(){
            var data = "myPassword";
            var salt = "mySaltIsGreatxD"
            var actual = hash.HashSync(data, salt);
            
            assert.strictEqual(actual.substr(0, salt.length), salt);
        });
        it('should generate salt if not salt given', function(){
            var data = "myPassword";
            var actual = hash.HashSync(data);
            
            assert.strictEqual(actual.length, 128 + 256);
        });
    });
    describe('CompareSync()', function () {
        it('should return true if data & hash are equal | noSalt', function(){
            var data = "myPassword";
            var encrypted = hash.HashSync(data);
            
            assert.strictEqual(hash.CompareSync(data, encrypted), true);
        });
        it('should return true if data & hash are equal | givenSalt', function(){
            var data = "myPassword";
            var encrypted = hash.HashSync(data, "ImSweetnotSalty11");
            
            assert.strictEqual(hash.CompareSync(data, encrypted), true);
        });
        it('should return false if original data & hash data are not equal', function(){
            var data = "myPassword";
            var encrypted = hash.HashSync(data);
            
            assert.strictEqual(hash.CompareSync("mypassword", encrypted), false);
        });
        it('should return false if original data & hash data are not equal', function(){
            var data = "myPassword";
            var encrypted = hash.HashSync(data);
            
            assert.strictEqual(hash.CompareSync("myPassword1", encrypted), false);
        });
        it('should return false if original data & hash data are not equal', function(){
            var data = "myPassword";
            var encrypted = hash.HashSync(data);
            
            assert.strictEqual(hash.CompareSync("myPasswor", encrypted), false);
        });
    });
});