var config = require('../../config.js');
var loadHtml = require('../HtmlLoader.js');
var Cookies = require('../Cookies.js');
var AuthenticationService = require('./AuthenticationService.js');
var UserService = require('./UserService.js');
var BlogController = require('../BlogController');
var ErrorPage = require('../ErrorPage.js');
var Logger = require('../Logger.js');

var route;

function UserController()
{
    route = [
	    { route: {"/auth": UserController.prototype.authenticate }},
        { route: {"/login": UserController.prototype.login }},
        { route: {"/logout": UserController.prototype.logout }}
    ];
}

UserController.prototype.getRoute = function()
{
    return route;
};

UserController.prototype.authenticate = function (response, data, query, cookies, request)
{
    //TODO NEEDS BRUTE FORCE LOGIN PROTECTION.
    var userInfo = data.length ? JSON.parse(data) : '';
    UserService.ValidateLogin(userInfo.username, userInfo.password, function(err, success) {
        if (success) {
            var session = AuthenticationService.CreateSession();
            Cookies.SetCookies(response, [{name:"sessionId", content:session.id, expires:session.expires}, 
            {name:"authToken", content:session.token, expires:session.expires, options : {httponly : true}}]);

            Logger.Log(config.log.access, "User: " + userInfo.username + " logged in from: " + request.connection.remoteAddress);
            response.writeHead(200, {'Content-Type': 'text/plain'});     
            response.end("Ok");
        }
        else {
            Logger.Warning(config.log.error, "Invalid login: " + userInfo.username + " from: " + request.connection.remoteAddress);
            response.writeHead(200, {'Content-Type': 'text/plain'});     
            response.end("Invalid");
        }
    });
};

UserController.prototype.login = function (response, data, query)
{
    loadHtml.load(response, './html/login.html', null);
};

UserController.prototype.logout = function (response, data, query, cookies) 
{        
    AuthenticationService.RemoveSession(cookies.sessionId);
    Cookies.SetCookies(response,  [{name:"sessionId", content:null, expires:new Date(0)}, {name:"authToken", content:null, expires:new Date(0)}])
    loadHtml.load(response, './html/login.html', null);
};

module.exports = UserController;
