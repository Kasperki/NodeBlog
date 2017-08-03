"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("mocha");
const assert = require("assert");
const testUtility = require("../TestUtility");
const authenticationService = require("../../blog/UserBundle/SessionManager");
const ServerResponseStub_1 = require("../Stubs/ServerResponseStub");
describe('AuthenticationService', () => {
    testUtility.DBInitialization();
    describe('#CreateSession()', () => {
        it('Should create new session with +1 hour expire time', () => {
            let sessionManager = new authenticationService.SessionManager();
            let actualSession = sessionManager.CreateSession(new ServerResponseStub_1.default(), "t");
            let expectedExpireDate = new Date(new Date().getTime() + 3600000).toUTCString();
            let expectedTokenLength = 128;
            assert.strictEqual(actualSession.expires, expectedExpireDate);
            assert.strictEqual(actualSession.token.length, expectedTokenLength);
        });
        it('Should create new session & add that to Sessions array', () => {
            let sessionManager = new authenticationService.SessionManager();
            let actualSession = sessionManager.CreateSession(new ServerResponseStub_1.default(), "test");
            assert.strictEqual(actualSession, sessionManager.GetSessions()[1]);
        });
        it('Should create new session with username', () => {
            let sessionManager = new authenticationService.SessionManager();
            let actualSession = sessionManager.CreateSession(new ServerResponseStub_1.default(), "dude");
            assert.strictEqual(actualSession.username, "dude");
        });
    });
    describe('#RemoveSession()', () => {
        it('Should remove session by id from valid Sessions', () => {
            let sessionManager = new authenticationService.SessionManager();
            let actualSession = sessionManager.CreateSession(new ServerResponseStub_1.default(), "test");
            sessionManager.RemoveSession(new ServerResponseStub_1.default(), actualSession.id);
            assert.strictEqual(sessionManager.GetSessions().length, 0);
        });
    });
    describe('#IsTokenValid()', () => {
        it('Should return Session in question if token is valid', () => {
            let sessionManager = new authenticationService.SessionManager();
            let expectedSession = sessionManager.CreateSession(new ServerResponseStub_1.default(), "Dude123");
            sessionManager.CreateSession(new ServerResponseStub_1.default(), "NotThisDude");
            let tokenCookie = {};
            tokenCookie[expectedSession.id] = expectedSession.token;
            assert.strictEqual(sessionManager.IsTokenValid(tokenCookie), expectedSession);
        });
        it('Should return false if token is invalid', () => {
            let sessionManager = new authenticationService.SessionManager();
            let actualSession = sessionManager.CreateSession(new ServerResponseStub_1.default(), "test");
            let tokenCookie = {};
            tokenCookie[actualSession.id] = "notValidToken:)";
            assert.strictEqual(sessionManager.IsTokenValid(tokenCookie), null);
        });
    });
});
