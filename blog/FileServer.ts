import * as http from "http";
import * as fs from "fs";
import * as zlib from "zlib";
var mime = require('mime');
var config = require('../config.js');
import { RequestData } from './BaseController';
import * as ErrorPage from './ErrorPage';
var Logger = require('./Logger.js');

var directoryPath: string;
var status: fs.Stats;

/**
 * Generates routes to all files that are in Public directories
 * @param Response response
 * @param Request request
 * @param string route
 */
export function TryLoadResourceFromRoute(requestData: RequestData, route: string)
{
    for (var i = 0; i < config.web.publicDirectories.length; i++)
    {
        var baseRoute = route.substring(0, config.web.publicDirectories[i].route.length);
        if (baseRoute === config.web.publicDirectories[i].route)
        {
            if (config.web.publicDirectories[i].redirect)
            {
                route = route.substring(baseRoute.length);

                if (route.startsWith("/") == false && route.startsWith("\\") == false)
                {
                    route = "/" + route;
                }

                directoryPath = config.web.publicDirectories[i].redirect + route;
            }
            else
            {
                directoryPath = __dirname + route;
            }
            
            try
            {
                status = fs.lstatSync(directoryPath);
            }
            catch (e)
            {
                Logger.Debug(config.log.error, e);
                continue;
            }

            if (status.isDirectory())
            {
                sendGeneratedHtml(requestData.response, baseRoute + route);
                break;
            }
            else if (status.isFile())
            {
                sendFile(requestData.response, requestData.request);
                break;
            }
        }
    }
    
    if (status == null)
    {
        ErrorPage.ThrowErrorPage(requestData, 404, "We have lost the page: " + route);
        Logger.Warning(config.log.error, "Referer: " + requestData.request.headers['referer'] + " -- " + requestData.request.connection.remoteAddress + "Path not found:" + directoryPath);
    }
};

/**
 * Generates html tree for the directory
 * @param Response response
 * @param string route
 */
function sendGeneratedHtml(response: http.ServerResponse, route: string)
{
    var paths = fs.readdirSync(directoryPath);

    var generatedHtml = "<html>";
    generatedHtml += "<a href=\"" + route.substring(0,route.lastIndexOf("/")) + "\">..</a><br>";

    for (let i = 0; i < paths.length; i++)
    {
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
function sendFile(response: http.ServerResponse, request: http.ServerRequest)
{
    try
    {
        var buf = fs.readFileSync(directoryPath);
        var type = mime.lookup(directoryPath);

        var fileExtension = directoryPath.substr(directoryPath.lastIndexOf('.')+1);

        response.statusCode = 200;
        response.setHeader('Content-Length', status["size"].toString());
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
    catch (e)
    {
        Logger.Debug(config.log.error, e);
    }
}

function encodeToGZIP(buffer: Buffer, response: http.ServerResponse) 
{
    var buf = zlib.gzipSync(buffer);
    response.setHeader('Content-Encoding', 'gzip');
    response.setHeader('Content-Length', buf.length.toString());
    return buf;
}