var fs = require('fs');

var route;

function BlogController()
{
    route = {
		"/blog": BlogController.prototype.renderBlog
	};
}

BlogController.prototype.getRoute = function()
{
    return route;
}

BlogController.prototype.renderBlog = function (response, json, query)
{
    response.writeHead(200, {'Content-Type': 'text/html'});
    loadHtml(response, './html/blog.html', {blogText : htmll});
}

module.exports = BlogController;