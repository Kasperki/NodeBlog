import "mocha";
import * as assert from "assert";
import * as cookies from "../blog/Cookies";
import * as httpMocks from "node-mocks-http";
import { IDictionary } from "../blog/Infastructure/Dictionary";

describe('Cookies', () => {
    describe('ParseCookies()', () => {
        it('should parse cookies from request to list', () => {

            let request = httpMocks.createRequest({ headers: { cookie: "A=B; B=C; C=XD" } });

            let expectedList: IDictionary<string> = { A: "B", B: "C", C: "XD" };
            let actualList = cookies.ParseCookies(request);

            assert.deepEqual(actualList, expectedList);
        });
    });
    describe('SetCookies()', () => {
        it('should set correct http headers', () => {
            let response = httpMocks.createResponse();

            let date0 = new Date(0);
            let date1 = new Date(new Date().getTime() + 3600000);
            let cookieArray = [new cookies.Cookie("A", "A", date0, { secure: false, httponly: false }), new cookies.Cookie("token", "", date1, { secure: true, httponly: true })]

            cookies.SetCookies(response, cookieArray);
            assert.deepEqual(response._getHeaders(), { "Set-Cookie": ["A=A; expires=" + date0 + ";", "token=; expires=" + date1 + "; secure; httponly;"] })
        });
    });
});