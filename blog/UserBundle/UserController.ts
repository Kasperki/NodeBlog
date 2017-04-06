import { BaseController } from "../BaseController";
import { Route } from "../BaseController";
import { RequestData } from "../BaseController";

import * as https from "https";
var querystring = require("querystring");
var config = require('../../config.js');
var loadHtml = require('../HtmlLoader.js');
var Cookies = require('../Cookies.js');
var AuthenticationService = require('./AuthenticationService.js');
var UserService = require('./UserService.js');
var BlogController = require('../BlogController');
var ErrorPage = require('../ErrorPage.js');
var Logger = require('../Logger.js');

export class UserController extends BaseController
{
    routes: Route[] = [
        new Route("/auth", this.authenticate),
        new Route("/login", this.login),
        new Route("/logout", this.logout)
    ];

    authenticate(requestInfo: RequestData) {
        //TODO NEEDS BRUTE FORCE LOGIN PROTECTION.
        var userInfo = requestInfo.data.length ? JSON.parse(requestInfo.data) : '';

        this.verifyReCapthca(userInfo.recaptcha, requestInfo.request.connection.remoteAddress, function (err: Error, validCapthca) {
            if (validCapthca) {
                UserService.ValidateLogin(userInfo.username, userInfo.password, function (err: Error, success: boolean) {
                    if (success) {
                        var session = AuthenticationService.CreateSession(userInfo.username);
                        Cookies.SetCookies(requestInfo.response, [
                            { name: "sessionId", content: session.id, expires: session.expires, options: { secure: true, httponly: true } },
                            { name: "authToken", content: session.token, expires: session.expires, options: { secure: true, httponly: true } }
                        ]);

                        Logger.Log(config.log.access, "User: " + userInfo.username + " logged in from: " + requestInfo.request.connection.remoteAddress);
                        requestInfo.response.writeHead(200, { 'Content-Type': 'text/plain' });
                        requestInfo.response.end("Ok");
                    }
                    else {
                        Logger.Warning(config.log.error, "Invalid login: " + userInfo.username + " from: " + requestInfo.request.connection.remoteAddress);
                        requestInfo.response.writeHead(200, { 'Content-Type': 'text/plain' });
                        requestInfo.response.end("Invalid");
                    }
                });
            }
            else {
                Logger.Warning(config.log.error, "Invalid capthca from: " + requestInfo.request.connection.remoteAddress);
                requestInfo.response.writeHead(403, { 'Content-Type': 'text/plain' });
                requestInfo.response.end("Invalid");
            }
        });
    };

    login(requestInfo: RequestData) {
        loadHtml.load(requestInfo, './views/login.html', null);
    };

    logout(requestInfo: RequestData) {
        AuthenticationService.RemoveSession(requestInfo.cookies.sessionId);
        Cookies.SetCookies(requestInfo.response, [{ name: "sessionId", content: null, expires: new Date(0) }, { name: "authToken", content: null, expires: new Date(0) }])
        loadHtml.load(requestInfo, './views/login.html', null);
    };

    /**
     * Verifys google reCaptcha response
     * @param string recaptcha
     * @param string remoteip
     * @callback (Error err,boolean isValid);
     */
    verifyReCapthca(recaptchaResponse: string, remoteip: string, callback: (e: Error | null, message: boolean) => void) {
        var post_data = querystring.stringify({
            'secret': config.security.rechaptasecret,
            'response': recaptchaResponse,
            'remoteip': remoteip
        });

        var post_options = {
            host: "www.google.com",
            port: 443,
            path: '/recaptcha/api/siteverify',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(post_data)
            }
        };

        var post_req = https.request(post_options, function (res) {
            res.setEncoding('utf8');
            res.on('data', function (data) {
                if (res.statusCode === 200) {
                    var response = data.length ? JSON.parse(String(data)) : '';
                    if (response.success === true) {
                        callback(null, true);
                        return;
                    }
                }

                callback(null, false);
                return;
            });
        });

        post_req.write(post_data);
        post_req.end();
    }
}