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
var ErrorPage = require('./ErrorPage.js');
import * as FileServer from "./FileServer";
var Logger = require('./Logger.js');
var Routing = require('./Routing.js');

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

var server = https.createServer(options, function (request: http.ServerRequest, response: http.ServerResponse)
{	
    Request = request;
    Response = response;
        
    let incomingData: string = '';
    request.on('data', function (data: string) {
        incomingData += data;
    });

    request.on('end', function () {

        var url: urlModule.Url = urlModule.parse(String(request.url), true);
        var route = url.pathname;        
                
        var cookies = Cookies.ParseCookies(request);      
        var authenticated = AuthenticationService.IsTokenValid(cookies.sessionId, cookies.authToken, request);

        for (var i = 0; i < controllers.length; i++) {
            for (var j = 0; j < controllers[i].GetRoutes.length; j++) {

                var controllerRoute = controllers[i].GetRoutes[j];
                var keys = Routing.parseRoute(controllerRoute.route, route); //Keys from route .../{key}/{key}/... test

                let requestData = new RequestData(request, response);
                requestData.data = incomingData;
                requestData.queryParameters = url.query;
                requestData.cookies = cookies;
                requestData.keys = keys;
                requestData.parameters = { loggedIn: authenticated ? true : false, userName: authenticated ? authenticated.username : null, "NODE.ENV": String(config.env) };

                if (keys && (!controllerRoute.authenticated || authenticated)) {

                    var access = request.connection.remoteAddress + " " + request.headers['user-agent']  + "  " + request.method + " HTTP:" + request.httpVersion + " " + request.url;  
                    Logger.Log(config.log.access, access);

                    controllerRoute.action(requestData);
                    return;
                }
            }
        }

        FileServer.TryLoadResourceFromRoute(request, response, String(route));      
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
