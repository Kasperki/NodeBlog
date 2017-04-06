import { BaseController } from "./BaseController";
import { Route } from "./BaseController";
import { RequestData } from "./BaseController";

var marked = require('marked');
var config = require('../config.js');
var loadHtml = require('./HtmlLoader.js');
var BlogService = require('./BlogService.js');
var ErrorPage = require('./ErrorPage.js');
var Logger = require('./Logger.js');

const BLOGS_PER_PAGE = 8;

export class BlogController extends BaseController
{
    routes: Route[] = [
        new Route("/blog", this.renderList),
        new Route("/blog/{title}", this.renderBlog),
        new Route("/get-blog", this.getBlog),
        new Route("/get-blogs", this.getBlogListJson),
        new Route("/get-blogs-category", this.getByCategory),
        new Route("/get-blogs-tag", this.getByTag),
        new Route("/blogs-getAllVisits", this.getAllVisits),
        new Route("/blogs-getAllVisitsPerWeek", this.getAllVisitsPerWeek),
        new Route("/blog-getMonthlyVisits", this.getMonthlyVisits),

        new Route("/admin/blog", this.adminBlog, true),
        new Route("/admin/blog-preview", this.previewBlog, true),
        new Route("/admin/blog-save", this.saveBlog, true),
        new Route("/admin/blog-add", this.addBlog, true),
        new Route("/admin/blog-edit", this.editBlog, true),
        new Route("/admin/blog-delete", this.deleteBlog, true),
    ];

    private renderBlog(requestInfo: RequestData)
    {
        BlogService.GetBlogPostByTitle(requestInfo.keys['title'], function (err: Error, blogPost: any) {

            if (err || !blogPost) {
                ErrorPage(requestInfo.response, 404, "We have lost the page: /blog/" + requestInfo.keys['title']);
                Logger.Warning(config.log.error, "Blog not found: /blog/" + requestInfo.keys['title']);
                return;
            }

            loadHtml.load(requestInfo, './views/blog.html', null);
        });
    };

    private getBlog(requestInfo: RequestData)
    {
        BlogService.GetBlogPostByTitle(requestInfo.queryParameters['title'], function (err: Error, blogPost: any) {

            if (err || !blogPost) {
                ErrorPage(requestInfo.response, 404, "We have lost the page: /blog/" + requestInfo.queryParameters['title']);
                Logger.Warning(config.log.error, "Blog not found: /blog/" + requestInfo.queryParameters['title']);
                return;
            }

            BlogService.AddVisit(blogPost);

            requestInfo.response.writeHead(200, { 'Content-Type': 'application/json' });
            blogPost.text = marked(blogPost.text);
            requestInfo.response.end(JSON.stringify(blogPost));
        });
    }

    private getAllBlogs(requestInfo: RequestData)
    {
        BlogService.GetAllBlogs(function (err: Error, blogPost: any) {

            if (err) {
                ErrorPage(requestInfo.response, 404, "We have lost the page: /blog/" + requestInfo.queryParameters['title']);
                Logger.Warning(config.log.error, "Blog not found: /blog/" + requestInfo.queryParameters['title']);
                return;
            }

            requestInfo.response.writeHead(200, { 'Content-Type': 'application/json' });
            blogPost.text = marked(blogPost.text);
            requestInfo.response.end(JSON.stringify(blogPost));
        });
    }

    private renderList(requestInfo: RequestData)
    {
        BlogService.GetTags(function (err: Error, tags: any) {
            BlogService.GetCategories(function (err: Error, categories: any) {
                loadHtml.load(requestInfo, './views/blog-list.html', { tags: JSON.stringify(tags), categories: JSON.stringify(categories) });
            });
        });
    };

    private filterBlogsPerPage(requestInfo: RequestData, blogPosts: any)
    {
        var pageNumber = requestInfo.queryParameters['page'];

        if (!pageNumber)
            pageNumber = 0;

        if (pageNumber > 0)
            pageNumber--;

        if (pageNumber * BLOGS_PER_PAGE > blogPosts.length) {
            pageNumber = Math.floor(blogPosts.length / BLOGS_PER_PAGE);
        }

        var blogs = []
        for (var index = pageNumber * BLOGS_PER_PAGE; index < (pageNumber + 1) * BLOGS_PER_PAGE; index++) {
            if (index < blogPosts.length) {
                blogs.push(blogPosts[index]);
            }
        }

        var pagesCount = Math.ceil(blogPosts.length / BLOGS_PER_PAGE);
        return { blogs: blogs, pagesCount: pagesCount };
    }

    private getBlogListJson(requestInfo: RequestData)
    {
        BlogService.GetLatestBlogPost(0, function (err: Error, blogPosts: any) {
            requestInfo.response.writeHead(200, { 'Content-Type': 'application/json' });
            var blogs = this.filterBlogsPerPage(requestInfo, blogPosts);
            requestInfo.response.end(JSON.stringify(blogs));
        });
    };

    private getByCategory(requestInfo: RequestData) {
        var category = requestInfo.queryParameters['category'];

        BlogService.GetBlogPostsByCategory(category, function (err: Error, blogPosts: any) {
            requestInfo.response.writeHead(200, { 'Content-Type': 'application/json' });
            var blogs = this.filterBlogsPerPage(requestInfo, blogPosts);
            requestInfo.response.end(JSON.stringify(blogs));
        });
    };

    private getByTag(requestInfo: RequestData) {
        var tag = requestInfo.queryParameters['tag'];

        BlogService.GetBlogPostsByTag(tag, function (err: Error, blogPosts: any) {
            requestInfo.response.writeHead(200, { 'Content-Type': 'application/json' });
            var blogs = this.filterBlogsPerPage(requestInfo, blogPosts);
            requestInfo.response.end(JSON.stringify(blogs));
        });
    };

    private getAllVisits(requestInfo: RequestData) {
        BlogService.GetAllVisits(function (err: Error, result: any) {
            requestInfo.response.writeHead(200, { 'Content-Type': 'application/json' });
            requestInfo.response.end(JSON.stringify(result));
        });
    };

    private getAllVisitsPerWeek(requestInfo: RequestData) {
        BlogService.GetVisitsPerWeekByAllBlogs(function (err: Error, result: any) {
            requestInfo.response.writeHead(200, { 'Content-Type': 'application/json' });
            requestInfo.response.end(JSON.stringify(result));
        });
    };

    private getMonthlyVisits(requestInfo: RequestData) {
        var id = requestInfo.queryParameters['id'];

        BlogService.GetVisitsPerMonthByBlog(id, function (err: Error, result: any) {
            requestInfo.response.writeHead(200, { 'Content-Type': 'application/json' });
            requestInfo.response.end(JSON.stringify(result));
        });
    };

    //Admin routes

    private adminBlog(requestInfo: RequestData) {
        loadHtml.load(requestInfo, './views/blog-admin.html', {});
    };

    private addBlog(requestInfo: RequestData) {
        loadHtml.load(requestInfo, './views/blog-admin-add.html', { tags: JSON.stringify("") });
    };

    private editBlog(requestInfo: RequestData) {
        BlogService.GetBlogPostById(requestInfo.queryParameters['id'], function (err: Error, blog: any) {
            var blogData = { title: blog.title, text: blog.text, image: blog.image, description: blog.description, category: blog.category, tags: JSON.stringify(blog.tags) };
            loadHtml.load(requestInfo, './views/blog-admin-add.html', blogData);
        });
    };

    private previewBlog(requestInfo: RequestData) {
        var html = marked(requestInfo.data);
        requestInfo.response.writeHead(200, { 'Content-Type': 'text/html' });
        requestInfo.response.end(html);
    };

    private saveBlog(requestInfo: RequestData) {
        var jsonBlog = requestInfo.data.length ? JSON.parse(requestInfo.data) : '';

        BlogService.GetBlogPostByTitle(requestInfo.queryParameters['title'], function (err: Error, blogPost: any) {

            if (blogPost == null) {
                BlogService.AddBlogPost(jsonBlog.title, jsonBlog.image, jsonBlog.text, jsonBlog.description, jsonBlog.category, jsonBlog.tags);
            }
            else {
                BlogService.UpdateBlogPost(jsonBlog.title, jsonBlog.image, jsonBlog.text, jsonBlog.description, jsonBlog.category, jsonBlog.tags, function (err: Error, success: any) {
                    Logger.Debug(config.log.debug, "Blog " + jsonBlog.title + " updated");
                });
            }

            requestInfo.response.writeHead(200, { 'Content-Type': 'text/html' });
            requestInfo.response.end("ok");
        });
    };

    private deleteBlog(requestInfo: RequestData) {
        var id = requestInfo.queryParameters['id'];
        BlogService.RemoveBlog(id);
        Logger.Debug(config.log.debug, "Blog" + id + " deleted");

        loadHtml.load(requestInfo, './views/blog-admin.html', {});
    }
}
