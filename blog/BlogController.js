var marked = require('marked');
var config = require('../config.js');
var loadHtml = require('./HtmlLoader.js');
var BlogService = require('./BlogService.js');
var ErrorPage = require('./ErrorPage.js');
var Logger = require('./Logger.js');

var route;

function BlogController()
{
    route = {
	    "/blog": BlogController.prototype.renderBlog,
        "/get-blog": BlogController.prototype.getBlog,
        "/blog-list": BlogController.prototype.renderList,
        "/get-blogs": BlogController.prototype.getBlogListJson,
        "/admin/blog-preview" : BlogController.prototype.previewBlog,
        "/admin/blog-add" : BlogController.prototype.addBlog,      
        "/admin/blog": BlogController.prototype.adminBlog
    };
}

BlogController.prototype.getRoute = function()
{
    return route;
};

//Blog
BlogController.prototype.renderBlog = function (response)
{
    loadHtml.load(response, './html/blog.html', null);
};

BlogController.prototype.getBlog = function (response, data, query) 
{        
    BlogService.GetBlogPostById(query['id'], function(err, blogPost) {    
        
        if (err || !blogPost) {
            ErrorPage(response, 404, "We have lost the page: /blog/" + query['id']);
            Logger.Warning(config.log.error, "Blog not found: /blog/" +  query['id']);
            return;
        }
        
        response.writeHead(200, {'Content-Type': 'application/json'});     
        blogPost.text = marked(blogPost.text);
        response.end(JSON.stringify(blogPost));
    });
};

//Bloglist
BlogController.prototype.renderList = function (response, data, query)
{
    loadHtml.load(response, './html/blog-list.html', null);
};

BlogController.prototype.getBlogListJson = function (response, data, query) 
{
    BlogService.GetLatestBlogPost(6, function(blogPosts) {
        response.writeHead(200, {'Content-Type': 'application/json'});     
        response.end(JSON.stringify(blogPosts));
    });
};

//Admim routes
BlogController.prototype.adminBlog = function (response, data, query)
{
    loadHtml.load(response, './html/blog-admin.html', {});
};

BlogController.prototype.previewBlog = function (response, data, query)
{
    var htmll = marked(data);
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.end(htmll);
};

BlogController.prototype.addBlog = function (response, data, query)
{
    var jsonBlog = data.length ? JSON.parse(data) : '';
    BlogService.AddBlogPost(jsonBlog.title, jsonBlog.image, jsonBlog.text, jsonBlog.description, jsonBlog.category, jsonBlog.tags);
    
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.end("ok");
};

module.exports = BlogController;
