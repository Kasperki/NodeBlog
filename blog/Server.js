/*
* Node server
*/

//Using
var http = require('http');
var fs = require('fs');
var config = require('../config.js'); 
var BlogController = require('./BlogController.js');
var Database = require('./Database.js');
var ErrorPage = require('./ErrorPage.js');
var FileServer = require('./FileServer.js');
var Logger = require('./Logger.js');

//Initialize controllers
var controllers = [new BlogController()];

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
                
        for (var i = 0; i < controllers.length; i++) {
            for (var controllerRoute in controllers[i].getRoute()) {
                if (controllerRoute === route) {
                    controllers[i].getRoute()[controllerRoute](response, incomingData, url['query']);
                    return;
                }
            }
        }
        
        FileServer(response, route);      
    });
}).listen(8081);

//Error logging
process.on('uncaughtException', (err) => {
    var message = "Referer: " + Request.headers['referer'] + " -- " + Request.connection.remoteAddress + " - Exception: " + err.stack;
    Logger.Error(config.log.error, message);
    process.exit(1);
});

console.log("Server running!");
