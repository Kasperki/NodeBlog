import "mocha";
import * as assert from "assert";
import * as testUtility from "../TestUtility";
import * as authenticationService from "../../blog/UserBundle/SessionManager";
import { IDictionary } from "../../blog/Infastructure/Dictionary";
import ServerResponseStub from "../Stubs/ServerResponseStub";

describe('AuthenticationService', () => {

    testUtility.DBInitialization();

    describe('#CreateSession()', () => {
        it('Should create new session with +1 hour expire time', () => {
            let sessionManager = new authenticationService.SessionManager();

            let actualSession = sessionManager.CreateSession(new ServerResponseStub(), "t");
            let expectedExpireDate = new Date(new Date().getTime() + 3600000).toUTCString();
            let expectedTokenLength = 128;
            
            assert.strictEqual(actualSession.expires, expectedExpireDate);
            assert.strictEqual(actualSession.token.length, expectedTokenLength);
        });
        it('Should create new session & add that to Sessions array', () => {
            let sessionManager = new authenticationService.SessionManager();
            let actualSession = sessionManager.CreateSession(new ServerResponseStub(), "test");

            assert.strictEqual(actualSession, sessionManager.GetSessions()[1]);
        });
        it('Should create new session with username', () => {
            let sessionManager = new authenticationService.SessionManager();
            let actualSession = sessionManager.CreateSession(new ServerResponseStub(), "dude");
            assert.strictEqual(actualSession.username, "dude");
        });
    });
    describe('#RemoveSession()', () => {
        it('Should remove session by id from valid Sessions', () => {
            let sessionManager = new authenticationService.SessionManager();
            let actualSession = sessionManager.CreateSession(new ServerResponseStub(), "test");
            sessionManager.RemoveSession(new ServerResponseStub(), actualSession.id);

            assert.strictEqual(sessionManager.GetSessions().length, 0);
        });
    });
    describe('#IsTokenValid()', () => {
        it('Should return Session in question if token is valid', () => {
            let sessionManager = new authenticationService.SessionManager();
            let expectedSession = sessionManager.CreateSession(new ServerResponseStub(), "Dude123");
            sessionManager.CreateSession(new ServerResponseStub(), "NotThisDude");

            let tokenCookie: IDictionary<string> = {};
            tokenCookie[expectedSession.id] = expectedSession.token;
            assert.strictEqual(sessionManager.IsTokenValid(tokenCookie), expectedSession);
        });
        it('Should return false if token is invalid', () => {
            let sessionManager = new authenticationService.SessionManager();
            let actualSession = sessionManager.CreateSession(new ServerResponseStub(), "test");

            let tokenCookie: IDictionary<string> = {};
            tokenCookie[actualSession.id] = "notValidToken:)";
            assert.strictEqual(sessionManager.IsTokenValid(tokenCookie), null);
        });
    });
});