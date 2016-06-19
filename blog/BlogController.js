var marked = require('marked');
var config = require('../config.js');
var loadHtml = require('./HtmlLoader.js');
var BlogService = require('./BlogService.js');
var ErrorPage = require('./ErrorPage.js');
var Logger = require('./Logger.js');

var route;

function BlogController()
{
    route = [
	    { route: {"/blog/{title}": BlogController.prototype.renderBlog }},
        { route: {"/get-blog": BlogController.prototype.getBlog }},
        { route: {"/blog": BlogController.prototype.renderList }},
        { route: {"/get-blogs": BlogController.prototype.getBlogListJson }},
        { route: {"/admin/blog-preview" : BlogController.prototype.previewBlog }, protected: true},
        { route: {"/admin/blog-add" : BlogController.prototype.addBlog }, protected: true},      
        { route: {"/admin/blog": BlogController.prototype.adminBlog }, protected: true}
    ];
}

BlogController.prototype.getRoute = function()
{
    return route;
};

//Blog
BlogController.prototype.renderBlog = function (requestInfo)
{
    BlogService.GetBlogPostByTitle(requestInfo.keys['title'], function(err, blogPost) {
        
        if (err || !blogPost) {
            ErrorPage(requestInfo.response, 404, "We have lost the page: /blog/" + requestInfo.keys['title']);
            Logger.Warning(config.log.error, "Blog not found: /blog/" + requestInfo.keys['title']);
            return;
        }
        
        loadHtml.load(requestInfo, './html/blog.html', null);
    });
};

BlogController.prototype.getBlog = function (requestInfo)
{        
    BlogService.GetBlogPostByTitle(requestInfo.queryParameters['title'], function(err, blogPost) {    
        
        if (err || !blogPost) {
            ErrorPage(requestInfo.response, 404, "We have lost the page: /blog/" + requestInfo.queryParameters['title']);
            Logger.Warning(config.log.error, "Blog not found: /blog/" + requestInfo.queryParameters['title']);
            return;
        }

        requestInfo.response.writeHead(200, {'Content-Type': 'application/json'});     
        blogPost.text = marked(blogPost.text);
        requestInfo.response.end(JSON.stringify(blogPost));
    });
};

//Bloglist
BlogController.prototype.renderList = function (requestInfo)
{
    loadHtml.load(requestInfo, './html/blog-list.html', null);
};

BlogController.prototype.getBlogListJson = function (requestInfo) 
{
    BlogService.GetLatestBlogPost(6, function(err, blogPosts) {
        requestInfo.response.writeHead(200, {'Content-Type': 'application/json'});     
        requestInfo.response.end(JSON.stringify(blogPosts));
    });
};

//Admim routes
BlogController.prototype.adminBlog = function (requestInfo)
{
    loadHtml.load(requestInfo, './html/blog-admin.html', {});
};

BlogController.prototype.previewBlog = function (requestInfo)
{
    var html = marked(requestInfo.data);
    requestInfo.response.writeHead(200, {'Content-Type': 'text/html'});
    requestInfo.response.end(html);
};

BlogController.prototype.addBlog = function (requestInfo)
{
    var jsonBlog = requestInfo.data.length ? JSON.parse(requestInfo.data) : '';
    BlogService.AddBlogPost(jsonBlog.title, jsonBlog.image, jsonBlog.text, jsonBlog.description, jsonBlog.category, jsonBlog.tags);
    
    requestInfo.response.writeHead(200, {'Content-Type': 'text/html'});
    requestInfo.response.end("ok");
};

module.exports = BlogController;
