var fs = require('fs');
var zlib = require('zlib');
var mime = require('mime');
var config = require('../config.js');
var ErrorPage = require('./ErrorPage.js');
var Logger = require('./Logger.js');

var dirPath;
var status;

/**
 * Generates routes to all files that are in Public directories
 * @param Response response
 * @param Request request
 * @param string route
 */
module.exports = function (response, request, route) {
   
    for (var i = 0; i < config.web.publicDirectories.length; i++) {
        
        status = null;

        var baseRoute = route.substring(0, config.web.publicDirectories[i].route.length);

        if (baseRoute === config.web.publicDirectories[i].route) {

            if (config.web.publicDirectories[i].redirect) {

                route = route.substring(baseRoute.length);

                if (route.startsWith("/") == false && route.startsWith("\\") == false) {
                    route = "/" + route;
                }

                dirPath = config.web.publicDirectories[i].redirect + route;
            } else {
                dirPath = __dirname + route;
            }
            
            try {
                status = fs.lstatSync(dirPath);
            }
            catch (e) {
                Logger.Debug(config.log.error, e);
                continue;
            }

            if (status.isDirectory()) {
                sendGeneratedHtml(response, baseRoute + route);
                break;
            }
            else if(status.isFile()) {
                sendFile(response, request);
                break;
            }  
        }
    }
    
    if (status == null) {
        ErrorPage(response, 404, "We have lost the page: " + route);
        Logger.Warning(config.log.error, "Referer: " + request.headers['referer'] + " -- " + request.connection.remoteAddress + "Path not found:" + dirPath);
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
function sendFile(response, request)
{
    try {
        var buf = fs.readFileSync(dirPath);
        var type = mime.lookup(dirPath);

        var fileExtension = dirPath.substr(dirPath.lastIndexOf('.')+1);

        response.statusCode = 200;
        response.setHeader('Content-Length', status["size"]);
        response.setHeader('Content-Type', type);
        response.setHeader('X-Content-Type-Options', 'nosniff');
        response.setHeader('X-XSS-Protection', '1; mode=block');
        response.setHeader('X-Frame-Options', 'SAMEORIGIN');
        response.setHeader('Cache-Control', 'private, max-age=10800');

        //Check for Gzip support
        if (request.headers['accept-encoding'] && request.headers['accept-encoding'].match(/\bgzip\b/)) 
        {
            if (fileExtension === "css" || fileExtension === "js" || fileExtension === "html") 
            {
                buf = encodeToGZIP(buf, response);
            }
        }

        response.end(buf, 'binary');
    }
    catch (e) {
        Logger.Debug(config.log.error, e);
    }
}

function encodeToGZIP (buffer, response) 
{
    var buf = zlib.gzipSync(buffer);
    response.setHeader('Content-Encoding', 'gzip');
    response.setHeader('Content-Length', buf.length);
    return buf;
}