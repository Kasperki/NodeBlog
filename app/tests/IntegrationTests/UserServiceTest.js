"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
require("mocha");
const assert = require("assert");
const User = require("../../blog/UserBundle/Model/User");
const UserService_1 = require("../../blog/UserBundle/UserService");
const hash = require("../../blog/Hash");
const testUtility = require("../TestUtility");
describe('UserService', function () {
    testUtility.DBInitialization();
    describe('#AddUser()', function () {
        it('Should add user to database and not throw error', function (done) {
            let service = new UserService_1.default();
            service.AddUser('user1', 'password', (err, valid) => { });
            service.AddUser('user2', 'password', function (err, result) {
                assert.strictEqual(err, null);
                done();
            });
        });
        it('Should throw error if duplicate username', function (done) {
            var service = new UserService_1.default();
            service.AddUser('user1', 'bbb', (err, valid) => {
                service.AddUser('user1', 'bcc', function (err, result) {
                    assert.ok(err instanceof Error);
                    assert.ok(err.message.includes("E11000 duplicate key error"));
                    assert.ok(err.message.includes("dup key: { : \"user1\" }"));
                    done();
                });
            });
        });
    });
    describe('#FindUser()', function () {
        it('Should return null if user is not found', function () {
            return __awaiter(this, void 0, void 0, function* () {
                var service = new UserService_1.default();
                let actualUser = yield service.FindUser("admin");
                assert.equal(actualUser, null);
            });
        });
        it('Should find user from database', function () {
            return __awaiter(this, void 0, void 0, function* () {
                var expectedName = "Kassu";
                var expectedPassword = "kekHash";
                testUtility.fixtures(new User({ username: expectedName, password: expectedPassword }));
                var service = new UserService_1.default();
                let actualUser = yield service.FindUser(expectedName);
                assert.equal(actualUser.username, expectedName);
                assert.equal(actualUser.password, expectedPassword);
            });
        });
    });
    describe('#RemoveUser()', function () {
        it.skip('Should remove user from database, and not throw error', function (done) {
            var expectedName = "removeUser";
            var expectedPassword = "kekHash";
            testUtility.fixtures(new User({ username: expectedName, password: expectedPassword }));
            UserService_1.default.prototype.RemoveUser(expectedName, function (err, ready) {
                return __awaiter(this, void 0, void 0, function* () {
                    console.log(err + "_" + ready);
                    let actualUser = yield UserService_1.default.prototype.FindUser(expectedName);
                    assert.equal(actualUser, null);
                    done();
                });
            });
        });
    });
    describe('#ValidateLogin()', function () {
        it('Should return true if login infomation is correct', function () {
            return __awaiter(this, void 0, void 0, function* () {
                var username = "dude1";
                var password = "kekHash";
                testUtility.fixtures(new User({ username: username, password: hash.HashSync(password) }));
                var service = new UserService_1.default();
                let result = yield service.ValidateLogin(username, password);
                assert.strictEqual(result, true);
            });
        });
        it('Should return false if login infomation is incorrect', function () {
            return __awaiter(this, void 0, void 0, function* () {
                var username = "dude2";
                var password = "kekHash";
                testUtility.fixtures(new User({ username: username, password: hash.HashSync(password) }));
                var service = new UserService_1.default();
                let result = yield service.ValidateLogin(username, "notMyPassword");
                assert.strictEqual(result, false);
            });
        });
        it('Should return false if login infomation is incorrect', function () {
            return __awaiter(this, void 0, void 0, function* () {
                var username = "dude2";
                var password = "kekHash";
                testUtility.fixtures(new User({ username: username, password: hash.HashSync(password) }));
                var service = new UserService_1.default();
                let result = yield service.ValidateLogin(username, "kekhash");
                assert.strictEqual(result, false);
            });
        });
        it('Should return false if login infomation is incorrect', function () {
            return __awaiter(this, void 0, void 0, function* () {
                var username = "dude2";
                var password = "kekHash";
                testUtility.fixtures(new User({ username: username, password: hash.HashSync(password) }));
                var service = new UserService_1.default();
                let result = yield service.ValidateLogin("Dude2", password);
                assert.strictEqual(result, false);
            });
        });
    });
});
