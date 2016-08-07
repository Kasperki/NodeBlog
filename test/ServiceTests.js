var assert = require('assert');
var dbutils = require('./TestDBUtils.js');
var blogService = require('../blog/BlogService.js');
var authenticationService = require('../blog/UserBundle/AuthenticationService.js');
var userService = require('../blog/UserBundle/UserService.js');
var hash = require('../blog/Hash.js');

describe('TestsWithMongoose', function () {

dbutils.dbInitialization();

describe('BlogService', function () {

  describe('#AddBlogPost()', function () {
    it('Should add blog to database, and not throw error', function (done) {
        blogService.AddBlogPost('a','b','c','d','e','f');
        blogService.AddBlogPost('b','b','c','d','e','f', function(err, result) {
             assert.strictEqual(err, null)
             done();
        });
    });
    it('Should throw error if duplicate title', function (done) {
        blogService.AddBlogPost('a','b','c','d','e','f');   
        blogService.AddBlogPost('a','b','c','d','e','f', function(err, result) {
            assert.ok(err instanceof Error);
            assert.ok(err.message.includes("E11000 duplicate key error"));
            assert.ok(err.message.includes("dup key: { : \"a\" }"));
            done();
        }); 
    });
  });

  describe('#GetLatestBlogPost()', function () {
        it('Should return empty array if no blog posts', function (done) {        
            blogService.GetLatestBlogPost(1, function(err, result) {
                assert.equal(result.length, 0);
                done();
            });
        });
        it('Should throw error if limit is negative', function (done) {        
            assert.throws(
            () => {
                blogService.GetLatestBlogPost(-1, function(err, result) {});
            },
            /Limit can't be negative/
            );
            done();
        });
        it('Should return all blogs when limit is 0', function (done) {        
            
            var expected = 10;
            for (var i = 0; i < 10; i++) {
                dbutils.fixtures(new blogService.Blog({title:i}));
            }
            
            blogService.GetLatestBlogPost(0, function(err, result) {
                assert.equal(result.length, expected);
                done();
            });
        });
        it('Should return expected number of blog posts', function (done) {        
            
            var expected = 5;
            for (var i = 0; i < 10; i++) {
                dbutils.fixtures(new blogService.Blog({title:i}));
            }
            
            blogService.GetLatestBlogPost(expected, function(err, result) {
                assert.equal(result.length, expected);
                done();
            });
        });
        it('Should return sorted by datetime array');
    });
    
    describe('#GetBlogPostById()', function () {
        it('Should return Error if id is not valid', function (done) {        
            blogService.GetBlogPostById("666", function(err, result) {
                assert.equal(err.message, "id: 666 is not valid");
                done();
            });
        });
        it('Should return null if no blog posts found', function (done) {        
            blogService.GetBlogPostById('56cb91bdc3464f14678934ca', function(err, result) {
                assert.equal(result, null);
                done();
            });
        });
        it('Should return searched blog post by id', function (done) {        
                      
            var expectedBlog = new blogService.Blog({title:"expected", image: "image", text:"text", description: "txt", category:"c"});
            var notExpectedBlog = new blogService.Blog({title:"NotExpected", image: "image3", text:"tex_t", description: "tx_t", category:"c"});

            dbutils.fixtures(expectedBlog);
            dbutils.fixtures(notExpectedBlog);
                       
            blogService.GetBlogPostById(expectedBlog.id, function(err, result) {
                             
                assert.equal(result.title, expectedBlog.title);
                assert.equal(result.image, expectedBlog.image);
                assert.equal(result.text, expectedBlog.text);
                assert.equal(result.description, expectedBlog.description);
                assert.equal(result.category, expectedBlog.category);
                
                assert.notEqual(result.title, notExpectedBlog.title);
                done();
            });
        });
    });
    
    describe('#GetBlogPostByTitle()', function () {
        it('Should return Error if title is not valid', function (done) {        
            blogService.GetBlogPostByTitle(true, function(err, result) {
                assert.equal(err.message, "title: true is not string");
                done();
            });
        });
        it('Should return null if no blog posts found', function (done) {        
            blogService.GetBlogPostByTitle('TEST', function(err, result) {
                assert.equal(result, null);
                done();
            });
        });
        it('Should return searched blog post by title', function (done) {        
                      
            var expectedBlog = new blogService.Blog({title:"expected", image: "image", text:"text", description: "txt", category:"c"});
            var notExpectedBlog = new blogService.Blog({title:"NotExpected", image: "image3", text:"tex_t", description: "tx_t", category:"c"});

            dbutils.fixtures(expectedBlog);
            dbutils.fixtures(notExpectedBlog);
                       
            blogService.GetBlogPostByTitle(expectedBlog.title, function(err, result) {
                             
                assert.equal(result.title, expectedBlog.title);
                assert.equal(result.image, expectedBlog.image);
                assert.equal(result.text, expectedBlog.text);
                assert.equal(result.description, expectedBlog.description);
                assert.equal(result.category, expectedBlog.category);
                
                assert.notEqual(result.title, notExpectedBlog.title);
                done();
            });
        });
    });
});

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
            dbutils.fixtures(new userService.User({username: username, password: hash.HashSync(password)}));
            
            userService.ValidateLogin(username, password, function(err, result) {
              assert.strictEqual(result, true);
              done();  
            });
        });
        it('Should return false if login infomation is incorrect', function(done){
            var username = "dude2"; var password = "kekHash";
            dbutils.fixtures(new userService.User({username: username, password: hash.HashSync(password)}));
            
            userService.ValidateLogin(username, "notMyPassword", function(err, result) {
              assert.strictEqual(result, false);
              done();  
            });
        });
        it('Should return false if login infomation is incorrect', function(done){
            var username = "dude2"; var password = "kekHash";
            dbutils.fixtures(new userService.User({username: username, password: hash.HashSync(password)}));
            
            userService.ValidateLogin(username, "kekhash", function(err, result) {
              assert.strictEqual(result, false);
              done();  
            });
        });
        it('Should return false if login infomation is incorrect', function(done){
            var username = "dude2"; var password = "kekHash";
            dbutils.fixtures(new userService.User({username: username, password: hash.HashSync(password)}));
            
            userService.ValidateLogin("Dude2", password, function(err, result) {
              assert.strictEqual(result, false);
              done();  
            });
        });
  });
});

describe('AuthenticationService', function () {

    describe('#CreateSession()', function () {
        it('Should create new session with +1 hour expire time', function(){
            var actualSession = authenticationService.CreateSession();
            var expectedExpireDate = new Date(new Date().getTime() + 3600000).toUTCString();
            var expectedTokenLength = 128;
            
            assert.strictEqual(typeof actualSession, "object");
            assert.strictEqual(typeof actualSession.id, "string");
            assert.strictEqual(actualSession.expires, expectedExpireDate);
            assert.strictEqual(actualSession.token.length, expectedTokenLength);
        });
        it('Should create new session & add that to Sessions array', function(){
            var actualSession = authenticationService.CreateSession();
            assert.strictEqual(actualSession, authenticationService.GetSessions()[1]);
        });
        it('Should create new session with username', function(){
            var actualSession = authenticationService.CreateSession("dude");
            assert.strictEqual(actualSession.username, "dude");
        });
    });
    describe('#RemoveSession()', function () {
        it('Should remove session by id from valid Sessions', function(){
            var actualSession = authenticationService.CreateSession();
            authenticationService.RemoveSession(actualSession.id);
            assert.strictEqual(authenticationService.GetSessions.length, 0);
        });
    });
    describe('#IsTokenValid()', function () {
        it('Should return Session in question if token is valid', function() {
            var expectedSession = authenticationService.CreateSession("Dude123");
            var otherSession = authenticationService.CreateSession("NotThisDude");
            assert.strictEqual(authenticationService.IsTokenValid(expectedSession.id, expectedSession.token), expectedSession);
        });
        it('Should return false if token is invalid', function() {
            var actualSession = authenticationService.CreateSession();
            assert.strictEqual(authenticationService.IsTokenValid(actualSession.id, "notValidToken:)"), null);
        });
    });
});
});