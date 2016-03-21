var fs = require('fs');
var mime = require('mime');
var config = require('../config.js');
var ErrorPage = require('./ErrorPage.js');

var dirPath;
var status;

/**
 * Generates routes to all files that are in Public directories
 * @param Response response
 * @param string route
 */
module.exports = function (response, route) {
   
    for (var i = 0; i < config.web.publicDirectories.length; i++) {
        
        if (route.substring(0, config.web.publicDirectories[i].length) === config.web.publicDirectories[i]) {
            dirPath = __dirname + route;
            
            try {
                status = fs.lstatSync(dirPath);
            }
            catch (e) {
                console.log(e);
                ErrorPage(response, "Page not found:" + route);
                return;
            }

            if (status.isDirectory()) {
                sendGeneratedHtml(response, route);
            }
            else if(status.isFile()) {
                sendFile(response);
            }  
        }
    }    
};

/**
 * Generates html tree for the directory
 * @param Response response
 * @param string route
 */
function sendGeneratedHtml(response, route)
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

/**
 * Sends the file in response
 * @param Response response
 */
function sendFile(response)
{
    try {
        var buf = fs.readFileSync(dirPath, "utf8");
        var type = mime.lookup(dirPath);

        response.writeHead(200, {'Content-Length' : status["size"], 'Content-Type': type, 'X-Content-Type-Options' : 'nosniff', 'X-XSS-Protection': '1; mode=block', 'X-Frame-Options': 'SAMEORIGIN'});
        response.write(buf);
        response.end();
    }
    catch (e) {
        console.log(e);
    }
}