import { BaseController } from "../BaseController";
import { Route } from "../BaseController";

import * as https from "https";
import * as querystring from "querystring";
var config = require('../../config.js');
var loadHtml = require('../HtmlLoader.js');
import { SessionManager } from "./AuthenticationService";
import * as UserService from "./UserService.js";
import { AccessLogger } from "../Logger";
import { ErrorLogger } from "../Logger";

export class UserController extends BaseController
{

    authenticate = () =>
    {
        //TODO NEEDS BRUTE FORCE LOGIN PROTECTION.
        let userInfo = this.requestData.data.length ? JSON.parse(this.requestData.data) : '';

        this.verifyReCapthca(String(userInfo.recaptcha), this.requestData.request.connection.remoteAddress, (e: Error | null, validCapthca: boolean): void =>
        {
            if (validCapthca)
            {
                let success = UserService.ValidateLogin(userInfo.username, userInfo.password);

                if (success)
                {
                    var session = SessionManager.Instance.CreateSession(this.requestData.response, userInfo.username);

                    AccessLogger().Log("User: " + userInfo.username + " logged in from: " + this.requestData.request.connection.remoteAddress);
                    this.Response("Ok");
                }
                else
                {
                    ErrorLogger().Warning("Invalid login: " + userInfo.username + " from: " + this.requestData.request.connection.remoteAddress);
                    this.BadResponse("Invalid");
                }
            }
            else
            {
                ErrorLogger().Warning("Invalid capthca from: " + this.requestData.request.connection.remoteAddress);
                this.BadResponse("Invalid");
            }
        });
    }

    login = () => 
    {
        loadHtml.load(this.requestData, './views/login.html', null);
    }

    logout = () =>
    {
        SessionManager.Instance.RemoveSession(this.requestData.response, this.requestData.cookies.sessionId);
        loadHtml.load(this.requestData, './views/login.html', null);
    }

    /**
     * Verifys google reCaptcha response
     * @param string recaptcha
     * @param string remoteip
     * @callback (Error err,boolean isValid);
     */
    verifyReCapthca = (recaptchaResponse: string, remoteip: string, callback: (e: Error | null, validCapthca: boolean) => void): void =>
    {
        var post_data = querystring.stringify({
            'secret': config.security.rechaptasecret,
            'response': recaptchaResponse,
            'remoteip': remoteip
        });

        var post_options =
        {
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

                ErrorLogger().Warning(String(data));
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