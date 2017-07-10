var assert = require('assert');
var dbutils = require('./TestDBUtils.js');
var blogService = require('../app/blog/BlogService.js');
var authenticationService = require('../app/blog/UserBundle/SessionManager.js');
var User = require('../app/blog/UserBundle/Model/User.js');
var userService = require('../app/blog/UserBundle/UserService.js');
var hash = require('../app/blog/Hash.js');

describe('TestsWithMongoose', function () {

dbutils.dbInitialization();

describe('UserService', function () {

  describe('#AddUser()', function () {
    it('Should add user to database and not throw error', function (done) {
        userService.AddUser('user1','password');
        userService.AddUser('user2','password', function(err, result) {
            assert.strictEqual(err, null)
            done();
        });
    });
    it('Should throw error if duplicate username', function (done) {
        userService.AddUser('user1','bbb', function(err, result) {
            userService.AddUser('user1','bcc', function(err, result) {
                assert.ok(err instanceof Error);
                assert.ok(err.message.includes("E11000 duplicate key error"));
                assert.ok(err.message.includes("dup key: { : \"user1\" }"));
                done();
            }); 
        });   
    })
  });
   describe('#FindUser()', function () {
        it('Should return null if user is not found',function (done) {
            userService.FindUser("admin", function(err, actualUser) {
                assert.equal(actualUser, null);
                done();
            });
        });
        it('Should find user from database',function (done) {
            var expectedName = "Kassu"; var expectedPassword = "kekHash";
            dbutils.fixtures(new userService.User({username: expectedName, password: expectedPassword}));
            
            userService.FindUser(expectedName, function(err, actualUser) {
                assert.equal(actualUser.username, expectedName);
                assert.equal(actualUser.password, expectedPassword);
                done();
            });
        });
  });
   describe('#RemoveUser()', function () {
        it.skip('Should remove user from database, and not throw error', function(done){
            var expectedName = "removeUser"; var expectedPassword = "kekHash"; 
            dbutils.fixtures(new userService.User({username: expectedName, password: expectedPassword}));
            
            userService.RemoveUser(expectedName, function(err, ready) {
                
                console.log(err + "_" + ready);
                
                userService.FindUser(expectedName, function(err, actualUser) {
                    assert.equal(actualUser, null);
                    done();
                });
            });
        });
  });
    describe('#ValidateLogin()', function () {
        it('Should return true if login infomation is correct', function(done){
            var username = "dude1"; var password = "kekHash";
            dbutils.fixtures(new User({username: username, password: hash.HashSync(password)}));
            
            userService.ValidateLogin(username, password, function(err, result) {
              assert.strictEqual(result, true);
              done();  
            });
        });
        it('Should return false if login infomation is incorrect', function(done){
            var username = "dude2"; var password = "kekHash";
            dbutils.fixtures(new User({username: username, password: hash.HashSync(password)}));
            
            userService.ValidateLogin(username, "notMyPassword", function(err, result) {
              assert.strictEqual(result, false);
              done();  
            });
        });
        it('Should return false if login infomation is incorrect', function(done){
            var username = "dude2"; var password = "kekHash";
            dbutils.fixtures(new User({username: username, password: hash.HashSync(password)}));
            
            userService.ValidateLogin(username, "kekhash", function(err, result) {
              assert.strictEqual(result, false);
              done();  
            });
        });
        it('Should return false if login infomation is incorrect', function(done){
            var username = "dude2"; var password = "kekHash";
            dbutils.fixtures(new User({username: username, password: hash.HashSync(password)}));
            
            userService.ValidateLogin("Dude2", password, function(err, result) {
              assert.strictEqual(result, false);
              done();  
            });
        });
  });
});
});