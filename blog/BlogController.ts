import { BaseController } from "./BaseController";
import { Route } from "./BaseController";

var marked = require('marked');
import * as loadHtml from "./HtmlLoader";
import * as BlogService from "./BlogService";
import * as ErrorPage from "./ErrorPage";
import { ErrorLogger } from "./Logger";

const BLOGS_PER_PAGE = 8;

export class BlogController extends BaseController
{
    private renderBlog = async () =>
    {
        try
        {
            let blog = await BlogService.GetBlogPostByTitle(this.requestData.routeData.keys['title']);

            if (blog)
            {
                loadHtml.load(this.requestData, './views/blog.html', null);
            }
            else
            {
                ErrorPage.ThrowErrorPage(this.requestData, 404, "We have lost the page: /blog/" + this.requestData.routeData.keys['title']);
                ErrorLogger().Warning("renderBlog -- Blog not found: /blog/" + this.requestData.routeData.keys['title']);
            }
        }
        catch (e)
        {
            ErrorLogger().Error("getBlog -- error::" + e.message);
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
                ErrorPage.ThrowErrorPage(this.requestData, 404, "We have lost the page: /blog/" + this.requestData.routeData.queryParameters['title']);
                ErrorLogger().Warning("getBlog -- Blog not found: /blog/" + this.requestData.routeData.queryParameters['title']);
            }
        }
        catch (e)
        {
            ErrorPage.ThrowErrorPage(this.requestData, 404, "We have lost the page: /blog/" + this.requestData.routeData.queryParameters['title']);
            ErrorLogger().Warning("getBlog -- Blog not found: /blog/" + this.requestData.routeData.queryParameters['title']);
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
        let pageNumber = this.requestData.routeData.queryParameters['page'];

        if (!pageNumber)
            pageNumber = 0;

        if (pageNumber > 0)
            pageNumber--;

        if (pageNumber * BLOGS_PER_PAGE > blogPosts.length) {
            pageNumber = Math.floor(blogPosts.length / BLOGS_PER_PAGE);
        }

        let blogs = []
        for (let index = pageNumber * BLOGS_PER_PAGE; index < (pageNumber + 1) * BLOGS_PER_PAGE; index++) {
            if (index < blogPosts.length) {
                blogs.push(blogPosts[index]);
            }
        }

        let pagesCount = Math.ceil(blogPosts.length / BLOGS_PER_PAGE);
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
        let category = this.requestData.routeData.queryParameters['category'];

        let blogPosts = await BlogService.GetBlogPostsByCategory(category);
        let blogs = this.filterBlogsPerPage(blogPosts);
        this.JSONResponse(blogs)
    }

    private getByTag = async () =>
    {
        let tag = this.requestData.routeData.queryParameters['tag'];

        let blogPosts = await BlogService.GetBlogPostsByTag(tag);
        let blogs = this.filterBlogsPerPage(blogPosts);
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
        let id = this.requestData.routeData.queryParameters['id'];

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
        let jsonBlog = this.requestData.data.length ? JSON.parse(this.requestData.data) : '';

        let blogPost = await BlogService.GetBlogPostByTitle(this.requestData.routeData.queryParameters['title']);

        if (blogPost == null)
        {
            BlogService.AddBlogPost(jsonBlog.title, jsonBlog.image, jsonBlog.text, jsonBlog.description, jsonBlog.category, jsonBlog.tags);
        }
        else
        {
            BlogService.UpdateBlogPost(jsonBlog.title, jsonBlog.image, jsonBlog.text, jsonBlog.description, jsonBlog.category, jsonBlog.tags, function (err: Error, success: any) {
                ErrorLogger().Debug("Blog " + jsonBlog.title + " updated");
            });
        }

        this.Response("ok");
    }

    private deleteBlog = () => 
    {
        let id = this.requestData.routeData.queryParameters['id'];
        BlogService.RemoveBlog(id);

        ErrorLogger().Debug("Blog" + id + " deleted");
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
