/*
* Node server
*/

//Using
var http = require('http');
var fs = require('fs');
var BlogController = require('./BlogController.js');

//Initialize controllers
var controllers = [new BlogController()];

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

        for (var i = 0; i < controllers.length; i++) {
            for (var controllerRoute in controllers[i].getRoute()) {
                if (controllerRoute === route) {
                    controllers[i].getRoute()[controllerRoute](response, incomingData, url['query']);
                    routeFound = true;
                }
            }
        }
        
        if (!routeFound) {
            if (route.substring(0,4) === "/web") //Sallitut directoryt
            {
                var dirPath = __dirname + route;
                var status;
                
                try {
                    status = fs.lstatSync(dirPath);
                }
                catch (e) {
                    console.log(e);
                    RouteNotFound(response, route);
                    return;
                }

                if (status.isDirectory())
                {
                    var paths = fs.readdirSync(dirPath);
                    
                    var generatedHtml = "<html>";
                    generatedHtml += "<a href=\"" + route.substring(0,route.lastIndexOf("/")) + "\">..</a><br>";
                    
                    for (i = 0; i < paths.length; i++) {
                        generatedHtml += "<a href=\"" + route + "/" + paths[i] + "\">" + paths[i] + "</a><br>";
                    }
                                        
                    generatedHtml += "</html>";

                    response.writeHead(200, {'Content-Type': 'text/html'});
                    response.write(generatedHtml); 
                    response.end();
                }
                else if(status.isFile()) {
                    try {
                        var buf = fs.readFileSync(dirPath, "utf8");
                        response.writeHead(200, {'Content-Type': 'text/plain'});
                        response.write(buf);  
                        response.end();
                    }
                    catch (e) {
                        console.log(e);
                    }
                }
            }
        }
		
        if (!routeFound) {
            RouteNotFound(response, route);
        }
    });
}).listen(8081);

console.log("Server running!");

function RouteNotFound(response, route)
{
    response.writeHead(404, {'Content-Type': 'text/plain'});
    response.end('Page not found: ' + route);
}







