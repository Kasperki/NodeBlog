var marked = require('marked');
var loadHtml = require('./HtmlLoader.js');
var BlogService = require('./BlogService.js');

var route;

function BlogController()
{
    route = {
	"/blog": BlogController.prototype.renderBlogByTitle,
        "/blog-list": BlogController.prototype.renderList,
        "/blogs": BlogController.prototype.getBlogListJson,
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
BlogController.prototype.renderBlogByTitle = function (response, data, query)
{
    BlogService.GetBlogPostByTitle(query['title'], function(blogPost) {
        
        if (blogPost.length <= 0)
        {
            BlogController.prototype.renderLatestBlog(response, data, query);
            return;
        }
        
        BlogController.prototype.renderBlog(response, blogPost);
    });
};

BlogController.prototype.renderLatestBlog = function (response, data, query)
{
    BlogService.GetLatestBlogPost(1, function(blogPost) {
        BlogController.prototype.renderBlog(response, blogPost);
    });
};

//TODO ADD TO GET BLOG, make angular
BlogController.prototype.renderBlog = function (response, blogPost)
{
    var title = blogPost[0].title;
    var text = marked(blogPost[0].text);
    var image = blogPost[0].image;
    var date = blogPost[0].date.getDay() + "." + blogPost[0].date.getMonth() + "." + blogPost[0].date.getYear();

    loadHtml.load(response, './html/blog.html', {title: title, date: date, blogText : text, image: image});
};

//Bloglist
BlogController.prototype.renderList = function (response, data, query)
{
    loadHtml.load(response, './html/blog-list.html', null);
};

BlogController.prototype.getBlogListJson = function (response, data, query) 
{
    BlogService.GetLatestBlogPost(5, function(blogPosts) {
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
    BlogService.AddBlogPost(jsonBlog.title, jsonBlog.image, jsonBlog.text, jsonBlog.category, jsonBlog.tags);
    
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.end("ok");
};

module.exports = BlogController;
