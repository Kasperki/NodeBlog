var loadHtml = require('./HtmlLoader.js');
var AuthenticationService = require('../blog/UserBundle/AuthenticationService.js');

var route;

function MainController()
{
    route = [
	    { route: {"/": MainController.prototype.main }},
        { route: {"/validateToken": MainController.prototype.validateToken }}
    ];
}

MainController.prototype.getRoute = function()
{
    return route;
};

//MainRoute
MainController.prototype.main = function (requestInfo)
{
    loadHtml.load(requestInfo, '/html/index.html', {});
};

//ValidationTest
MainController.prototype.validateToken = function (requestInfo)
{
    requestInfo.response.writeHead(200, {'Content-Type': 'application/json'});  

    if (requestInfo.request.connection.remoteAddress.startsWith("::ffff:127.0.0.1"))
        var session = AuthenticationService.IsTokenValid(requestInfo.queryParameters["sessionId"], requestInfo.queryParameters["authToken"]);
    
    var jsonResponse = "NotValid";

    if (session !== null) {
        console.log(session);
        jsonResponse = JSON.stringify(session);
    }

    requestInfo.response.end(jsonResponse);
};


module.exports = MainController;
