import "mocha";
import * as assert from "assert";
import * as User from "../../blog/UserBundle/Model/User";
import userService from "../../blog/UserBundle/UserService";
import * as hash from "../../blog/Hash";
import * as testUtility from "../TestUtility";

describe('UserService', function () {

  testUtility.DBInitialization();

  describe('#AddUser()', function () {

      it('Should add user to database and not throw error', function (done) {
        let service = new userService();

        service.AddUser('user1', 'password', (err, valid) => { });
        service.AddUser('user2','password', function(err, result) {
            assert.strictEqual(err, null)
            done();
        });
    });
      it('Should throw error if duplicate username', function () {

        var service = new userService();

        service.AddUser('user1', 'bbb', (err, valid) => {
            service.AddUser('user1','bcc', function(err, result) {
                assert.ok(err instanceof Error);
                assert.ok(err.message.includes("E11000 duplicate key error"));
                assert.ok(err.message.includes("dup key: { : \"user1\" }"));
            }); 
        });   
    })
  });
   describe('#FindUser()', function () {
       it('Should return null if user is not found', async function () {
            var service = new userService();
            let actualUser = await service.FindUser("NONEXISTENTUSER");
            assert.equal(actualUser, null);
        });
        it('Should find user from database', async function () {
            var expectedName = "Kassu";
            var expectedPassword = "kekHash";

            testUtility.fixtures(new User({username: expectedName, password: expectedPassword}));

            var service = new userService();
            let actualUser = await service.FindUser(expectedName);
            assert.equal(actualUser.username, expectedName);
            assert.equal(actualUser.password, expectedPassword);
        });
  });
   describe('#RemoveUser()', function () {
        it.skip('Should remove user from database, and not throw error', function(done){
            var expectedName = "removeUser"; var expectedPassword = "kekHash"; 
            testUtility.fixtures(new User({username: expectedName, password: expectedPassword}));

            userService.prototype.RemoveUser(expectedName, async function (err, ready) {
                
                console.log(err + "_" + ready);

                let actualUser = await userService.prototype.FindUser(expectedName);
                assert.equal(actualUser, null);
                done();
            });
        });
  });
    describe('#ValidateLogin()', function () {
        it('Should return true if login infomation is correct', async function(){
            var username = "dude1"; var password = "kekHash";
            testUtility.fixtures(new User({username: username, password: hash.HashSync(password)}));

            var service = new userService();
            let result = await service.ValidateLogin(username, password)
            assert.strictEqual(result, true);
        });
        it('Should return false if login infomation is incorrect', async function(){
            var username = "dude2"; var password = "kekHash";
            testUtility.fixtures(new User({username: username, password: hash.HashSync(password)}));

            var service = new userService();
            let result = await service.ValidateLogin(username, "notMyPassword");
            assert.strictEqual(result, false);
        });
        it('Should return false if login infomation is incorrect', async function(){
            var username = "dude2"; var password = "kekHash";
            testUtility.fixtures(new User({username: username, password: hash.HashSync(password)}));

            var service = new userService();
            let result = await service.ValidateLogin(username, "kekhash");
            assert.strictEqual(result, false);
        });
        it('Should return false if login infomation is incorrect', async function(){
            var username = "dude2"; var password = "kekHash";
            testUtility.fixtures(new User({username: username, password: hash.HashSync(password)}));

            var service = new userService();
            let result = await service.ValidateLogin("Dude2", password)
            assert.strictEqual(result, false);
        });
  });
});