import { BaseController } from "../BaseController";
import { Route } from "../BaseController";

import * as https from "https";
import * as querystring from "querystring";
import * as config from "../../config";
import * as loadHtml from "../HtmlLoader";
import { SessionManager } from "./SessionManager";
import UserService from "./UserService";
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
                if (UserService.prototype.ValidateLogin(userInfo.username, userInfo.password))
                {
                    SessionManager.Instance.CreateSession(this.requestData.response, userInfo.username);

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

    login = (): void => 
    {
        loadHtml.load(this.requestData, './views/login.html', null);
    }

    logout = (): void =>
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
        let post_data = querystring.stringify({
            'secret': config.security.rechaptasecret,
            'response': recaptchaResponse,
            'remoteip': remoteip
        });
        
        let post_options =
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

        let post_req = https.request(post_options, function (res)
        {
            res.setEncoding('utf8');
            res.on('data', function (data)
            {
                if (res.statusCode === 200)
                {
                    let response = data.length ? JSON.parse(String(data)) : '';
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