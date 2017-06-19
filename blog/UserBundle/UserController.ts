import { BaseController } from "../BaseController";
import { Route } from "../BaseController";

import * as https from "https";
import * as querystring from "querystring";
var config = require('../../config.js');
var loadHtml = require('../HtmlLoader.js');
import * as Cookies from '../Cookies';
var AuthenticationService = require('./AuthenticationService.js');
import * as UserService from "./UserService.js";
var Logger = require('../Logger.js');

export class UserController extends BaseController
{
    authenticate = () =>
    {
        //TODO NEEDS BRUTE FORCE LOGIN PROTECTION.
        let userInfo = this.requestData.data.length ? JSON.parse(this.requestData.data) : '';

        this.verifyReCapthca(String(userInfo.recaptcha), this.requestData.request.connection.remoteAddress, function (e, validCapthca) =>
        {
            if (validCapthca)
            {
                let success = UserService.ValidateLogin(userInfo.username, userInfo.password);

                if (success)
                {
                    var session = AuthenticationService.CreateSession(userInfo.username);
                    Cookies.SetCookies(this.requestData.response, [
                        new Cookies.Cookie("sessionId", session.id, session.expires),
                        new Cookies.Cookie("authToken", session.token, session.expires),
                    ]);

                    Logger.Log(config.log.access, "User: " + userInfo.username + " logged in from: " + this.requestData.request.connection.remoteAddress);
                    this.Response("Ok");
                }
                else
                {
                    Logger.Warning(config.log.error, "Invalid login: " + userInfo.username + " from: " + this.requestData.request.connection.remoteAddress);
                    this.Response("Invalid");
                }
            }
            else
            {
                Logger.Warning(config.log.error, "Invalid capthca from: " + this.requestData.request.connection.remoteAddress);
                this.requestData.response.writeHead(403, { 'Content-Type': 'text/plain' });
                this.requestData.response.end("Invalid");
            }
        });
    }

    login = () => 
    {
        loadHtml.load(this.requestData, './views/login.html', null);
    }

    logout = () =>
    {
        AuthenticationService.RemoveSession(this.requestData.cookies.sessionId);
        Cookies.SetCookies(this.requestData.response, [new Cookies.Cookie("sessionId", "", new Date(0)), new Cookies.Cookie("authToken", "", new Date(0))])
        loadHtml.load(this.requestData, './views/login.html', null);
    }

    /**
     * Verifys google reCaptcha response
     * @param string recaptcha
     * @param string remoteip
     * @callback (Error err,boolean isValid);
     */
    verifyReCapthca = () => (recaptchaResponse: string, remoteip: string, callback: (e: Error | null, validCapthca: boolean)) =>
    {
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

        var post_req = https.request(post_options, function (res)
        {
            res.setEncoding('utf8');
            res.on('data', function (data)
            {
                if (res.statusCode === 200)
                {
                    var response = data.length ? JSON.parse(String(data)) : '';
                    if (response.success === true)
                    {
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

    routes: Route[] = [
        new Route("/auth", this.authenticate),
        new Route("/login", this.login),
        new Route("/logout", this.logout)
    ];
}