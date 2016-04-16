/*
* Node server
*/

//Using
var http = require('http');
var fs = require('fs');
var BlogController = require('./BlogController.js');
var FileServer = require('./FileServer.js');
var ErrorPage = require('./ErrorPage.js');
var Database = require('./Database.js');

//Initialize controllers
var controllers = [new BlogController()];

//Initialize database connection
Database.connectToDatabase();

http.createServer(function (request, response)
{	
    var incomingData = '';
    request.on('data', function (data) {
        incomingData += data;
    });

    request.on('end', function () {

        var url = require('url').parse(request.url, true);
        var route = url['pathname'];
        var routeFound = false;
        
        console.log("route:"+route);
        
        for (var i = 0; i < controllers.length; i++) {
            for (var controllerRoute in controllers[i].getRoute()) {
                if (controllerRoute === route) {
                    controllers[i].getRoute()[controllerRoute](response, incomingData, url['query']);
                    routeFound = true;
                }
            }
        }
        
        if (!routeFound) {
            FileServer(response, route);
            ErrorPage(response, "Page not found:" + route);
        }
    });
}).listen(8081);

console.log("Server running!");
