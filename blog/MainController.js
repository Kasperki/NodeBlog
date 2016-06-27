var loadHtml = require('./HtmlLoader.js');

var route;

function MainController()
{
    route = [
	    { route: {"/": MainController.prototype.main }}
    ];
}

MainController.prototype.getRoute = function()
{
    return route;
};

//MainRoute
MainController.prototype.main = function (requestInfo)
{
    loadHtml.load(requestInfo, './html/index.html', {});
};


module.exports = MainController;
