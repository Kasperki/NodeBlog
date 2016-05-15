const assert = require('assert');
var httpMocks = require('node-mocks-http');
var cookies = require('../blog/Cookies.js');

describe('Cookies', function () {
    describe('ParseCookies()', function () {
        it('should parse cookies from request to list', function () {
            
            var request = httpMocks.createRequest({headers : {cookie: "A=B; B=C; C=XD"}});
            
            expectedList = {A:"B", B:"C", C:"XD"};
            actualList = cookies.ParseCookies(request);
            
            assert.deepEqual(actualList, expectedList);
        });
    });
    describe('SetCookies()', function () {
        it('should set correct http headers', function () {
            var response = httpMocks.createResponse();
            
            var date0 = new Date(0);
            var date1 = new Date(new Date().getTime() + 3600000).toUTCString();
            var cookieArray = [{name:"A", content:"A", expires:date1}, {name:"token", content:null, expires:date1, options:{secure:true, httponly:true}}]
            
            cookies.SetCookies(response, cookieArray);
            assert.deepEqual(response._headers,  {"Set-Cookie": ["A=A; expires="+date1+";", "token=null; expires="+date1+"; secure; httponly;"]})
        });
    });
});