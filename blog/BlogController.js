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
        { route: {"/get-blogs-category": BlogController.prototype.getByCategory }},
        { route: {"/get-blogs-tag": BlogController.prototype.getByTag }},
        { route: {"/blogs-getAllVisits": BlogController.prototype.getAllVisits }},
        { route: {"/blogs-getAllVisitsPerWeek": BlogController.prototype.getAllVisitsPerWeek }},
        { route: {"/blog-getMonthlyVisits": BlogController.prototype.getMonthlyVisits }},
        { route: {"/admin/blog-preview" : BlogController.prototype.previewBlog }, protected: true},
        { route: {"/admin/blog-save" : BlogController.prototype.saveBlog }, protected: true},
        { route: {"/admin/blog-add": BlogController.prototype.addBlog }, protected: true},
        { route: {"/admin/blog-edit" : BlogController.prototype.editBlog }, protected: true},
        { route: {"/admin/blog-delete": BlogController.prototype.deleteBlog }, protected: true},
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

        BlogService.AddVisit(blogPost);

        requestInfo.response.writeHead(200, {'Content-Type': 'application/json'});     
        blogPost.text = marked(blogPost.text);
        requestInfo.response.end(JSON.stringify(blogPost));
    });
};

BlogController.prototype.getAllBlogs = function (requestInfo)
{        
    BlogService.GetAllBlogs(function(err, blogPost) {    
        
        if (err) {
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
    BlogService.GetTags(function (err, tags) {

        BlogService.GetCategories(function (err, categories) {
            loadHtml.load(requestInfo, './html/blog-list.html', {tags: JSON.stringify(tags), categories: JSON.stringify(categories)});
         });
    });
};

const BLOGS_PER_PAGE = 8;

filterBlogsPerPage = function(requestInfo, blogPosts) 
{
    var pageNumber = requestInfo.queryParameters['page'];
    
    if (!pageNumber)
        pageNumber = 0;
    
    if (pageNumber > 0)
        pageNumber--;

    if (pageNumber * BLOGS_PER_PAGE > blogPosts.length)
    {
        pageNumber = Math.floor(blogPosts.length / BLOGS_PER_PAGE);
    }

    var blogs = []
    for (var index = pageNumber * BLOGS_PER_PAGE; index < (pageNumber + 1) * BLOGS_PER_PAGE; index++) {
        if (index < blogPosts.length) {
            blogs.push(blogPosts[index]);
        }
    }

    var pagesCount = Math.ceil(blogPosts.length / BLOGS_PER_PAGE);
    return {blogs: blogs, pagesCount: pagesCount};
}

BlogController.prototype.getBlogListJson = function (requestInfo) 
{
    BlogService.GetLatestBlogPost(0, function(err, blogPosts) {
        requestInfo.response.writeHead(200, {'Content-Type': 'application/json'});     
        var blogs = filterBlogsPerPage(requestInfo, blogPosts);
        requestInfo.response.end(JSON.stringify(blogs));
    });
};

BlogController.prototype.getByCategory = function (requestInfo) 
{
    var category = requestInfo.queryParameters['category'];
    
    BlogService.GetBlogPostsByCategory(category, function(err, blogPosts) {
        requestInfo.response.writeHead(200, {'Content-Type': 'application/json'});
        var blogs = filterBlogsPerPage(requestInfo, blogPosts);     
        requestInfo.response.end(JSON.stringify(blogs));
    });
};

BlogController.prototype.getByTag = function (requestInfo) 
{
    var tag = requestInfo.queryParameters['tag'];
    
    BlogService.GetBlogPostsByTag(tag, function(err, blogPosts) {
        requestInfo.response.writeHead(200, {'Content-Type': 'application/json'});  
        var blogs = filterBlogsPerPage(requestInfo, blogPosts);      
        requestInfo.response.end(JSON.stringify(blogs));
    });
};

BlogController.prototype.getAllVisits = function (requestInfo) 
{
    BlogService.GetAllVisits(function (err, result) {
        requestInfo.response.writeHead(200, {'Content-Type': 'application/json'});
        requestInfo.response.end(JSON.stringify(result));
    });
};

BlogController.prototype.getAllVisitsPerWeek = function (requestInfo) 
{
    BlogService.GetVisitsPerWeekByAllBlogs(function (err, result) {
        requestInfo.response.writeHead(200, {'Content-Type': 'application/json'});
        requestInfo.response.end(JSON.stringify(result));
    });
};


BlogController.prototype.getMonthlyVisits = function (requestInfo) 
{
    var id = requestInfo.queryParameters['id'];

    BlogService.GetVisitsPerMonthByBlog(id, function (err, result) {
        requestInfo.response.writeHead(200, {'Content-Type': 'application/json'});
        requestInfo.response.end(JSON.stringify(result));
    });
};

//Admim routes
BlogController.prototype.adminBlog = function (requestInfo)
{
    loadHtml.load(requestInfo, './html/blog-admin.html', {});
};

BlogController.prototype.addBlog = function (requestInfo)
{
    loadHtml.load(requestInfo, './html/blog-admin-add.html', {});
};

BlogController.prototype.editBlog = function (requestInfo)
{
     BlogService.GetBlogPostById(requestInfo.queryParameters['id'], function(err, blog) {
        var blogData = { title: blog.title, text: blog.text, image: blog.image, description: blog.description, category: blog.category, tags: JSON.stringify(blog.tags)};
        loadHtml.load(requestInfo, './html/blog-admin-add.html', blogData); 
    });
};

BlogController.prototype.previewBlog = function (requestInfo)
{
    var html = marked(requestInfo.data);
    requestInfo.response.writeHead(200, {'Content-Type': 'text/html'});
    requestInfo.response.end(html);
};

BlogController.prototype.saveBlog = function (requestInfo)
{
    var jsonBlog = requestInfo.data.length ? JSON.parse(requestInfo.data) : '';

    BlogService.GetBlogPostByTitle(requestInfo.queryParameters['title'], function(err, blogPost) {    
        
        if (blogPost == null) {
            BlogService.AddBlogPost(jsonBlog.title, jsonBlog.image, jsonBlog.text, jsonBlog.description, jsonBlog.category, jsonBlog.tags);
        }
        else {
            BlogService.UpdateBlogPost(jsonBlog.title, jsonBlog.image, jsonBlog.text, jsonBlog.description, jsonBlog.category, jsonBlog.tags, function (err, success)
            {
                Logger.Debug(config.log.debug, "Blog " + title + " updated");
            });
        }  

        requestInfo.response.writeHead(200, {'Content-Type': 'text/html'});
        requestInfo.response.end("ok");
    });
};

BlogController.prototype.deleteBlog = function (requestInfo)
{
    var id = requestInfo.queryParameters['id'];
    BlogService.RemoveBlog(id);
    Logger.Debug(config.log.debug, "Blog" + id + " deleted");

    loadHtml.load(requestInfo, './html/blog-admin.html', {});
}

module.exports = BlogController;
