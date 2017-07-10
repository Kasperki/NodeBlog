import "mocha";
import * as assert from "assert";
//let dbutils = require('./TestDBUtils.js');
import * as authenticationService from "../../blog/UserBundle/SessionManager";

describe('AuthenticationService', () => {
    describe('#CreateSession()', () => {
        it('Should create new session with +1 hour expire time', () => {

            let actualSession = authenticationService.SessionManager.prototype.CreateSession();
            let expectedExpireDate = new Date(new Date().getTime() + 3600000).toUTCString();
            let expectedTokenLength = 128;
            
            assert.strictEqual(actualSession.expires, expectedExpireDate);
            assert.strictEqual(actualSession.token.length, expectedTokenLength);
        });
        it('Should create new session & add that to Sessions array', () => {
            let actualSession = authenticationService.SessionManager.prototype.CreateSession();

            assert.strictEqual(actualSession, authenticationService.SessionManager.prototype.GetSessions()[1]);
        });
        it('Should create new session with username', () => {
            let actualSession = authenticationService.SessionManager.prototype.CreateSession("dude");
            assert.strictEqual(actualSession.username, "dude");
        });
    });
    describe('#RemoveSession()', () => {
        it('Should remove session by id from valid Sessions', () => {
            let actualSession = authenticationService.SessionManager.prototype.CreateSession();
            authenticationService.SessionManager.prototype.RemoveSession(actualSession.id);

            assert.strictEqual(authenticationService.SessionManager.prototype.GetSessions().length, 0);
        });
    });
    describe('#IsTokenValid()', () => {
        it('Should return Session in question if token is valid', () => {
            let expectedSession = authenticationService.SessionManager.prototype.CreateSession("Dude123");
            authenticationService.SessionManager.prototype.CreateSession("NotThisDude");

            assert.strictEqual(authenticationService.SessionManager.prototype.IsTokenValid(expectedSession.id, expectedSession.token), expectedSession);
        });
        it('Should return false if token is invalid', () => {
            let actualSession = authenticationService.SessionManager.prototype.CreateSession();

            assert.strictEqual(authenticationService.SessionManager.prototype.IsTokenValid(actualSession.id, "notValidToken:)"), null);
        });
    });
});