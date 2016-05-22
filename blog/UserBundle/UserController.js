var https = require('https');
var querystring = require("querystring");
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
    
    verifyReCapthca(userInfo.recaptcha, request.connection.remoteAddress, function(err, validCapthca) {     
        if (validCapthca) {
            UserService.ValidateLogin(userInfo.username, userInfo.password, function(err, success) {
                if (success) {
                    var session = AuthenticationService.CreateSession();
                    Cookies.SetCookies(response, [
                        {name:"sessionId", content:session.id, expires:session.expires, options : {secure : true, httponly : true}}, 
                        {name:"authToken", content:session.token, expires:session.expires, options : {secure : true, httponly : true}}
                    ]);

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
        }
        else {
            Logger.Warning(config.log.error, "Invalid capthca from: " + request.connection.remoteAddress);
            response.writeHead(403, {'Content-Type': 'text/plain'});     
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

/**
 * Verifys google reCaptcha response
 * @param string recaptcha
 * @param string remoteip
 * @callback (Error err,boolean isValid);
 */
function verifyReCapthca (recaptchaResponse, remoteip, callback) 
{
    var secret = "6LcM8R8TAAAAAAiPClKgz8x6s3-z_80pdxw4_k70";

    var post_data = querystring.stringify({
      'secret' : config.security.rechaptasecret,
      'response': recaptchaResponse,
      'remoteip' : remoteip
    });
        
    var post_options = {
      host: "www.google.com",
      port: 443,
      path: '/recaptcha/api/siteverify',
      method: 'POST',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(post_data)
      }
    };
    
    var post_req = https.request(post_options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (data) {
          if (res.statusCode === 200) {
            var response = data.length ? JSON.parse(data) : '';
            if (response.success === true) {
                callback(null, true);
                return;
            }
          }

          callback(null, false);
          return;
      });
    });
    
    post_req.write(post_data);
    post_req.end();    
}

module.exports = UserController;
