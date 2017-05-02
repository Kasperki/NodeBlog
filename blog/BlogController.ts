import { BaseController } from "./BaseController";
import { Route } from "./BaseController";

var marked = require('marked');
var config = require('../config.js');
var loadHtml = require('./HtmlLoader.js');
var BlogService = require('./BlogService.js');
var ErrorPage = require('./ErrorPage.js');
var Logger = require('./Logger.js');

const BLOGS_PER_PAGE = 8;

export class BlogController extends BaseController
{
    private renderBlog = async () =>
    {
        try
        {
            let tesat = this.requestData.routeData.keys['title'];

            let blog = await BlogService.GetBlogPostByTitle(this.requestData.routeData.keys['title']);

            if (blog)
            {
                loadHtml.load(this.requestData, './views/blog.html', null);
            }
            else
            {
                ErrorPage(this.requestData.response, 404, "We have lost the page: /blog/" + this.requestData.routeData.keys['title']);
                Logger.Warning(config.log.error, "renderBlog -- Blog not found: /blog/" + this.requestData.routeData.keys['title']);
            }
        }
        catch (e)
        {
            Logger.Error(config.log.error, "getBlog -- error::" + e.message);
            return;
        }
    }

    private getBlog = async () =>
    {
        try
        {
            let blog = await BlogService.GetBlogPostByTitle(this.requestData.routeData.queryParameters['title']);

            if (blog)
            {
                BlogService.AddVisit(blog);
                blog.text = marked(blog.text);
                this.JSONResponse(blog);
            }
            else
            {
                ErrorPage(this.requestData.response, 404, "We have lost the page: /blog/" + this.requestData.routeData.queryParameters['title']);
                Logger.Warning(config.log.error, "getBlog -- Blog not found: /blog/" + this.requestData.routeData.queryParameters['title']);
            }
        }
        catch (e)
        {
            ErrorPage(this.requestData.response, 404, "We have lost the page: /blog/" + this.requestData.routeData.queryParameters['title']);
            Logger.Warning(config.log.error, "getBlog -- Blog not found: /blog/" + this.requestData.routeData.queryParameters['title']);
            return;
        }
    }

    private renderList = async () =>
    {
        let tags = await BlogService.GetTags();
        let categories = await BlogService.GetCategories();
        loadHtml.load(this.requestData, './views/blog-list.html', { tags: JSON.stringify(tags), categories: JSON.stringify(categories) });
    }

    private filterBlogsPerPage(blogPosts: any): { blogs: any, pagesCount: number }
    {
        var pageNumber = this.requestData.routeData.queryParameters['page'];

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

    public getBlogListJson = async () =>
    {
        let blogPosts = await BlogService.GetLatestBlogPost(0);
        let blogs = this.filterBlogsPerPage(blogPosts);
        this.JSONResponse(blogs);
    }

    private getByCategory = async () =>
    {
        var category = this.requestData.routeData.queryParameters['category'];

        let blogPosts = await BlogService.GetBlogPostsByCategory(category);
        var blogs = this.filterBlogsPerPage(blogPosts);
        this.JSONResponse(blogs)
    }

    private getByTag = async () =>
    {
        var tag = this.requestData.routeData.queryParameters['tag'];

        let blogPosts = await BlogService.GetBlogPostsByTag(tag);
        var blogs = this.filterBlogsPerPage(blogPosts);
        this.JSONResponse(blogs)
    }

    private getAllVisits = async () => 
    {
        let result = await BlogService.GetAllVisits();
        this.JSONResponse(result)
    }

    private getAllVisitsPerWeek = async () =>
    {
        let result = await BlogService.GetVisitsPerWeekByAllBlogs();
        this.JSONResponse(result);
    }

    private getMonthlyVisits = async () =>
    {
        var id = this.requestData.routeData.queryParameters['id'];

        try {
            let result = await BlogService.GetVisitsPerMonthByBlog(id);
            this.JSONResponse(result);
        }
        catch (e) {
            this.JSONResponse(e.message);
        }
    }

    //Admin routes

    private adminBlog = () =>
    {
        loadHtml.load(this.requestData, './views/blog-admin.html', {});
    }

    private addBlog = () =>
    {
        loadHtml.load(this.requestData, './views/blog-admin-add.html', { tags: JSON.stringify("") });
    }

    private editBlog = async () =>
    {
        let blog = await BlogService.GetBlogPostById(this.requestData.routeData.queryParameters['id']);
        let blogData = { title: blog.title, text: blog.text, image: blog.image, description: blog.description, category: blog.category, tags: JSON.stringify(blog.tags) };
        loadHtml.load(this.requestData, './views/blog-admin-add.html', blogData);
    }

    private previewBlog = () =>
    {
        let html = marked(this.requestData.data);
        this.Response(String(html));
    }

    private saveBlog = async () =>
    {
        var jsonBlog = this.requestData.data.length ? JSON.parse(this.requestData.data) : '';

        let blogPost = await BlogService.GetBlogPostByTitle(this.requestData.routeData.queryParameters['title']);

        if (blogPost == null)
        {
            BlogService.AddBlogPost(jsonBlog.title, jsonBlog.image, jsonBlog.text, jsonBlog.description, jsonBlog.category, jsonBlog.tags);
        }
        else
        {
            BlogService.UpdateBlogPost(jsonBlog.title, jsonBlog.image, jsonBlog.text, jsonBlog.description, jsonBlog.category, jsonBlog.tags, function (err: Error, success: any) {
                Logger.Debug(config.log.debug, "Blog " + jsonBlog.title + " updated");
            });
        }

        this.Response("ok");
    }

    private deleteBlog = () => 
    {
        var id = this.requestData.routeData.queryParameters['id'];
        BlogService.RemoveBlog(id);

        Logger.Debug(config.log.debug, "Blog" + id + " deleted");
        loadHtml.load(this.requestData, './views/blog-admin.html', {});
    }

    public routes: Route[] = [
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
}
