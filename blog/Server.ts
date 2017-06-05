/*
* Node server
*/

import * as http from "http";
import * as https from "https";
import * as fs from "fs";
import { BaseController } from "./BaseController";
import { RequestData } from "./BaseController";
import * as urlModule from "url";

var config = require('../config.js'); 
var Cookies = require('./Cookies.js'); 
import { BlogController } from "./BlogController";
import { MainController } from "./MainController";
import { UserController } from "./UserBundle/UserController.js";
var AuthenticationService = require('../blog/UserBundle/AuthenticationService.js');
var Database = require('./Database.js');
import * as FileServer from "./FileServer";
var Logger = require('./Logger.js');
import * as Routing from "./Routing";

//Initialize controllers
var controllers: BaseController[] = [new BlogController(), new MainController(), new UserController()];

//Initialize database connection
Database.connectToDatabase();

let Request: http.ServerRequest;
let Response: http.ServerResponse;

var options: https.ServerOptions = {
    key: fs.readFileSync(config.cert.server_key), 
    cert: fs.readFileSync(config.cert.server_crt), 
    ca: fs.readFileSync(config.cert.ca_crt),
};

https.createServer(options, function (request: http.ServerRequest, response: http.ServerResponse)
{	
    Request = request;
    Response = response;
        
    let incomingData: string = '';
    request.on('data', function (data: string)
    {
        incomingData += data;
    });

    request.on('end', function ()
    {
        let url: urlModule.Url = urlModule.parse(String(request.url), true);   

        let requestData = new RequestData(request, response);
        requestData.data = incomingData;

        for (var i = 0; i < controllers.length; i++)
        {
            for (var j = 0; j < controllers[i].GetRoutes.length; j++)
            {
                let controllerRoute = controllers[i].GetRoutes[j];
                let routeData = Routing.parseRoute(controllerRoute.route, url);

                if (routeData == null)
                {
                    continue;
                }

                //TODO do once per request?
                let cookies = Cookies.ParseCookies(request);
                let authenticated = AuthenticationService.IsTokenValid(cookies.sessionId, cookies.authToken, request);

                requestData.routeData = routeData;
                requestData.cookies = cookies;
                requestData.parameters = { loggedIn: authenticated ? true : false, userName: authenticated ? authenticated.username : null, "NODE.ENV": String(config.env) };

                if (!controllerRoute.authenticated || authenticated)
                {
                    var access = request.connection.remoteAddress + " " + request.headers['user-agent']  + "  " + request.method + " HTTP:" + request.httpVersion + " " + request.url;  
                    Logger.Log(config.log.access, access);

                    controllers[i].requestData = requestData;
                    controllerRoute.action();
                    return;
                }
            }
        }

        FileServer.TryLoadResourceFromRoute(requestData, String(url.pathname));      
    });
}).listen(config.httpsPort);

http.createServer(function (request: http.ServerRequest, response: http.ServerResponse) {
    var hostname = (request.headers.host.match(/:/g)) ? request.headers.host.slice(0, request.headers.host.indexOf(":")) : request.headers.host
    response.writeHead(301, { "Location": "https://" + hostname + ":" + String(config.httpsPort) + request.url });
    response.end();
}).listen(config.httpPort);

//Error logging
process.on('uncaughtException', (err: Error) => {
    console.log(err);
    var message = "Referer: " + Request.headers['referer'] + " -- " + Request.connection.remoteAddress + " - Exception: " + err.stack;
    Logger.Error(config.log.error, message);
    process.exit(1);
});

console.log("Server running!");
