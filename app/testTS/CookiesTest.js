"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("mocha");
const assert = require("assert");
const cookies = require("../blog/Cookies");
const httpMocks = require("node-mocks-http");
describe('Cookies', () => {
    describe('ParseCookies()', () => {
        it('should parse cookies from request to list', () => {
            let request = httpMocks.createRequest({ headers: { cookie: "A=B; B=C; C=XD" } });
            let expectedList = { A: "B", B: "C", C: "XD" };
            let actualList = cookies.ParseCookies(request);
            assert.deepEqual(actualList, expectedList);
        });
    });
    describe('SetCookies()', () => {
        it('should set correct http headers', () => {
            let response = httpMocks.createResponse();
            let date0 = new Date(0);
            let date1 = new Date(new Date().getTime() + 3600000);
            let cookieArray = [new cookies.Cookie("A", "A", date0, { secure: false, httponly: false }), new cookies.Cookie("token", "", date1, { secure: true, httponly: true })];
            cookies.SetCookies(response, cookieArray);
            assert.deepEqual(response._getHeaders(), { "Set-Cookie": ["A=A; expires=" + date0 + ";", "token=; expires=" + date1 + "; secure; httponly;"] });
        });
    });
});
