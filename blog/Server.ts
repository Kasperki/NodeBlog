/*
* Node server
*/

import * as http from "http";
import * as https from "https";
import * as fs from "fs";
var config = require('../config.js'); 
var Cookies = require('./Cookies.js'); 
var BlogController = require('./BlogController.js');
var MainController = require('./MainController.js');
var UserController = require('./UserBundle/UserController.js');
var AuthenticationService = require('../blog/UserBundle/AuthenticationService.js');
var Database = require('./Database.js');
var ErrorPage = require('./ErrorPage.js');
import * as FileServer from "./FileServer";
var Logger = require('./Logger.js');
var Routing = require('./Routing.js');

//Initialize controllers
var controllers = [new BlogController(), new MainController(), new UserController()];

//Initialize database connection
Database.connectToDatabase();

let Request: http.ServerRequest;
let Response: http.ServerResponse;

var options: https.ServerOptions = {
    key: fs.readFileSync(config.cert.server_key), 
    cert: fs.readFileSync(config.cert.server_crt), 
    ca: fs.readFileSync(config.cert.ca_crt), 
};

class RequestData
{
    request: http.ServerRequest;
    response: http.ServerResponse;
    data: string;
    queryParameters: string[];
    cookies: any;
    keys: string[];
    parameters: any;

    constructor(request: http.ServerRequest, response: http.ServerResponse)
    {
        this.response = response;
        this.request = request;
    }
}

var server = https.createServer(options, function (request: http.ServerRequest, response: http.ServerResponse)
{	
    Request = request;
    Response = response;
        
    let incomingData: string = '';
    request.on('data', function (data: string) {
        incomingData += data;
    });

    request.on('end', function () {

        var url = require('url').parse(request.url, true);
        var route = url['pathname'];
                
        var cookies = Cookies.ParseCookies(request);      
        var authenticated = AuthenticationService.IsTokenValid(cookies.sessionId, cookies.authToken, request);

        for (var i = 0; i < controllers.length; i++) {
            for (var j = 0; j < controllers[i].getRoute().length; j++) {

                var controllerRouteInfo = controllers[i].getRoute()[j];
                var controllerRoute = Object.keys(controllerRouteInfo.route)[0];
                var keys = Routing.parseRoute(controllerRoute, route); //Keys from route .../{key}/{key}/... test

                let requestData = new RequestData(request, response);
                requestData.data = incomingData;
                requestData.queryParameters = url['query'];
                requestData.cookies = cookies;
                requestData.keys = keys;
                requestData.parameters = { loggedIn: authenticated ? true : false, userName: authenticated ? authenticated.username : null, "NODE.ENV": String(config.env) };

                if (keys && (!controllerRouteInfo.protected || authenticated)) {

                    var access = request.connection.remoteAddress + " " + request.headers['user-agent']  + "  " + request.method + " HTTP:" + request.httpVersion + " " + request.url;  
                    Logger.Log(config.log.access, access);

                    controllerRouteInfo.route[controllerRoute](requestData);
                    return;
                }
            }
        }

        FileServer.TryLoadResourceFromRoute(request, response, route);      
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
