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
    private renderBlog = async (requestInfo: RequestData) =>
    {
        try
        {
            let blog = await BlogService.GetBlogPostByTitle(requestInfo.keys['title']);

            if (blog)
            {
                loadHtml.load(requestInfo, './views/blog.html', null);
            }
            else
            {
                ErrorPage(requestInfo.response, 404, "We have lost the page: /blog/" + requestInfo.keys['title']);
                Logger.Warning(config.log.error, "renderBlog -- Blog not found: /blog/" + requestInfo.keys['title']);
            }
        }
        catch (e)
        {
            Logger.Error(config.log.error, "getBlog -- error::" + e.message);
            return;
        }
    }

    private getBlog = async (requestInfo: RequestData) =>
    {
        try
        {
            let blog = await BlogService.GetBlogPostByTitle(requestInfo.queryParameters['title']);

            if (blog)
            {
                BlogService.AddVisit(blog);
                blog.text = marked(blog.text);
                this.JSONResponse(requestInfo, blog);
            }
            else
            {
                ErrorPage(requestInfo.response, 404, "We have lost the page: /blog/" + requestInfo.queryParameters['title']);
                Logger.Warning(config.log.error, "getBlog -- Blog not found: /blog/" + requestInfo.queryParameters['title']);
            }
        }
        catch (e)
        {
            ErrorPage(requestInfo.response, 404, "We have lost the page: /blog/" + requestInfo.queryParameters['title']);
            Logger.Warning(config.log.error, "getBlog -- Blog not found: /blog/" + requestInfo.queryParameters['title']);
            return;
        }
    }

    private renderList = async (requestInfo: RequestData) =>
    {
        let tags = await BlogService.GetTags();
        let categories = await BlogService.GetCategories();
        loadHtml.load(requestInfo, './views/blog-list.html', { tags: JSON.stringify(tags), categories: JSON.stringify(categories) });
    }

    private filterBlogsPerPage(requestInfo: RequestData, blogPosts: any): { blogs: any, pagesCount: number }
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

    public getBlogListJson = async (requestInfo: RequestData) =>
    {
        let blogPosts = await BlogService.GetLatestBlogPost(0);
        let blogs = this.filterBlogsPerPage(requestInfo, blogPosts);
        this.JSONResponse(requestInfo, blogs);
    }

    private getByCategory = async (requestInfo: RequestData) =>
    {
        var category = requestInfo.queryParameters['category'];

        let blogPosts = await BlogService.GetBlogPostsByCategory(category);
        var blogs = this.filterBlogsPerPage(requestInfo, blogPosts);
        this.JSONResponse(requestInfo, blogs)
    }

    private getByTag = async (requestInfo: RequestData) =>
    {
        var tag = requestInfo.queryParameters['tag'];

        let blogPosts = await BlogService.GetBlogPostsByTag(tag);
        var blogs = this.filterBlogsPerPage(requestInfo, blogPosts);
        this.JSONResponse(requestInfo, blogs)
    }

    private getAllVisits = async (requestInfo: RequestData) => 
    {
        let result = await BlogService.GetAllVisits();
        this.JSONResponse(requestInfo, result)
    }

    private getAllVisitsPerWeek = async (requestInfo: RequestData) =>
    {
        let result = await BlogService.GetVisitsPerWeekByAllBlogs();
        this.JSONResponse(requestInfo, result);
    }

    private getMonthlyVisits = async (requestInfo: RequestData) =>
    {
        var id = requestInfo.queryParameters['id'];

        try {
            let result = await BlogService.GetVisitsPerMonthByBlog(id);
            this.JSONResponse(requestInfo, result);
        }
        catch (e) {
            this.JSONResponse(requestInfo, e.message);
        }
    }

    //Admin routes

    private adminBlog = (requestInfo: RequestData) =>
    {
        loadHtml.load(requestInfo, './views/blog-admin.html', {});
    }

    private addBlog = (requestInfo: RequestData) =>
    {
        loadHtml.load(requestInfo, './views/blog-admin-add.html', { tags: JSON.stringify("") });
    }

    private editBlog = async (requestInfo: RequestData) =>
    {
        let blog = await BlogService.GetBlogPostById(requestInfo.queryParameters['id']);
        let blogData = { title: blog.title, text: blog.text, image: blog.image, description: blog.description, category: blog.category, tags: JSON.stringify(blog.tags) };
        loadHtml.load(requestInfo, './views/blog-admin-add.html', blogData);
    }

    private previewBlog = (requestInfo: RequestData) =>
    {
        let html = marked(requestInfo.data);
        this.Response(requestInfo, String(html));
    }

    private saveBlog = async (requestInfo: RequestData) =>
    {
        var jsonBlog = requestInfo.data.length ? JSON.parse(requestInfo.data) : '';

        let blogPost = await BlogService.GetBlogPostByTitle(requestInfo.queryParameters['title']);

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

        this.Response(requestInfo, "ok");
    }

    private deleteBlog = (requestInfo: RequestData) => 
    {
        var id = requestInfo.queryParameters['id'];
        BlogService.RemoveBlog(id);

        Logger.Debug(config.log.debug, "Blog" + id + " deleted");
        loadHtml.load(requestInfo, './views/blog-admin.html', {});
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
