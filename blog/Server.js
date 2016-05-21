/*
* Node server
*/

//Using
var http = require('http');
var fs = require('fs');
var config = require('../config.js'); 
var Cookies = require('./Cookies.js'); 
var BlogController = require('./BlogController.js');
var UserController = require('./UserBundle/UserController.js');
var AuthenticationService = require('../blog/UserBundle/AuthenticationService.js');
var Database = require('./Database.js');
var ErrorPage = require('./ErrorPage.js');
var FileServer = require('./FileServer.js');
var Logger = require('./Logger.js');
var Routing = require('./Routing.js');

//Initialize controllers
var controllers = [new BlogController(), new UserController()];

//Initialize database connection
Database.connectToDatabase();

var Request;
var Response;

var server = http.createServer(function (request, response)
{	
    Request = request;
    Response = response;
    
    var access = request.connection.remoteAddress + " " + request.headers['user-agent']  + "  " + request.method + " HTTP:" + request.httpVersion + " " + request.url;  
    Logger.Log(config.log.access, access);
    
    var incomingData = '';
    request.on('data', function (data) {
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
                                  
                if (Routing.parseRoute(controllerRoute, route) && (!controllerRouteInfo.protected || authenticated)) {       
                    controllerRouteInfo.route[controllerRoute](response, incomingData, url['query'], cookies, request);
                    return;
                }
            }
        }
        
        FileServer(response, request, route);      
    });
}).listen(8081);

//Error logging
process.on('uncaughtException', (err) => {
    var message = "Referer: " + Request.headers['referer'] + " -- " + Request.connection.remoteAddress + " - Exception: " + err.stack;
    Logger.Error(config.log.error, message);
    process.exit(1);
});

console.log("Server running!");
