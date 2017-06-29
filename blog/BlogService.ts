import * as mongoose from "mongoose";
import * as IBlog from "./Model/IBlog";
import * as Blog from "./Model/Blog";
import { IDictionary } from "./Infastructure/Dictionary";

function CreateBlogPost(title: string, image: string, text: string, description: string, category: string, tags: string[]): IBlog.IBlogModel
{
    return new Blog({
        title: title,
        image: image,
        text: text,
        category: category,
        description: description,
        tags: tags,
        date: Date.now(),
        visits: [],
    });
}

/**
 * Save blog post to db
 */
export function AddBlogPost(title: string, image: string, text: string, description: string, category: string, tags: string[]) 
{
    let blog = CreateBlogPost(title, image, text, description, category, tags);

    blog.save(function (err) {    });
}

export function UpdateBlogPost (title: string, image: string, text: string, description: string, category: string, tags: string[], callback: any)
{
    Blog.update({ title: title }, { $set: { image: image, text: text, description: description, category: category, tags: tags } }
        , function (err, raw) {
            if (typeof callback === "function") {
                callback(err, true);
            }
        });
}

/**
 * Remove blog post
 * @param Blog blog
 * @param callback (err, Blog[] result)
 */
export function RemoveBlog (id: string): void
{
    Blog.find({ _id: id }).remove().exec();
};


/**
 * Gets array of latests blogs by limit
 * @param int limit
 * @param callback (err, Blog[] result)
 */
export function GetLatestBlogPost (limit: number)
{
    if (limit < 0)
    {
        throw new Error("Limit can't be negative");
    }

    return Blog.find('title text date').sort({ date: -1 }).limit(limit).exec();
};

/**
 * Gets blog post by id
 * @param string id
 * @param callback (err, Blog result)
 */
export async function GetBlogPostById (id: string)
{
    if (!mongoose.Types.ObjectId.isValid(id))
    {
        throw new Error('id: ' + id + " is not valid");
    }

    let result = await Blog.find({ '_id': id }, 'title image text description category tags date visits').exec();
    return result[0];
};

/**
 * Gets blog post by title
 * @param string title
 * @param callback (err, Blog result)
 */
export async function GetBlogPostByTitle (title: string)
{
    let result = await Blog.find({ 'title': title }, 'title image text description category date visits').exec();
    return result[0];
};

/**
 * Gets array of blogs by category
 * @param string category
 * @param callback (err, Blog[] result)
 */
export function GetBlogPostsByCategory(category: string)
{
    return Blog.find({ 'category': category }).sort({ date: -1 }).exec();
};

/**
 * Gets array of blogs that has tag
 * @param string tag
 * @param callback (err, Blog[] result)
 */
export function GetBlogPostsByTag(tag: string)
{
    return Blog.find({ 'tags': tag }).sort({ date: -1 }).exec();
};

/**
 * Gets array of all categories
 * @param callback (err, Tags[Name, Count] result)
 */
export async function GetCategories (): Promise<IDictionary<number>>
{
    let result = await Blog.find().exec();
    let categories: IDictionary<number> = {};

    for (let i = 0; i < result.length; i++)
    {
        if (!categories[result[i].category])
        {
            categories[result[i].category] = 1;
        }
        else
        {
            categories[result[i].category] += 1;
        }
    }

    return categories;
};

/**
 * Gets array of all tags
 * @param callback (err, Tags[Name, Count] result)
 */
export async function GetTags (): Promise<IDictionary<number>>
{
    let result = await Blog.find().exec();
    let tags: IDictionary<number> = {};

    for (let i = 0; i < result.length; i++)
    {
        if (result[i].tags != null)
        {
            result[i].tags.forEach(function (tag)
            {
                if (!tags[tag])
                {
                    tags[tag] = 1;
                }
                else
                {
                    tags[tag] += 1;
                }
            });
        }
    }

    return tags;
};

/**
 * Add visit to blog
 * @param Blog blog
 * @param callback (err, Blog[] result)
 */
export function AddVisit(blog: IBlog.IBlogModel): void
{
    if (blog.visits == null)
    {
        blog.visits = [];
    }

    blog.visits.push(new Date());
    Blog.update({ _id: blog._id }, { $set: { visits: blog.visits } }, function (err, raw) {
    });
};


/**
 * Returns blog titles with visit count
 * return array[Title]: visitCount;
 */
export async function GetAllVisits(): Promise<IDictionary<number>>
{
    let allData: IDictionary<number> = {};

    let blogs = await this.GetLatestBlogPost(0)
    for (let i = 0; i < blogs.length; i++)
    {
        allData[blogs[i].title] = blogs[i].visits.length;
    }

    return allData;
}

/**
 * Returns all blog visits cumulatively weekly
 * return array[yyyy/week]: visitCount 
 */
export async function GetVisitsPerWeekByAllBlogs(): Promise<IDictionary<number>>
{
    let blogData: IDictionary<number> = {}

    let blogs = await this.GetLatestBlogPost(0);

    let startYear = new Date(2016, 6, 1);
    let endYear = new Date();
    let cumulative = 0;

    for (let date = startYear; date < endYear; date.setDate(date.getDate() + 7))
    {
        blogData[date.getFullYear() + "/" + getWeek(date)] = 0;
    }

    for (let i = 0; i < blogs.length; i++)
    {
        for (let index in blogs[i].visits)
        {
            cumulative++;
            let date = new Date(blogs[i].visits[index]);
            blogData[date.getFullYear() + "/" + getWeek(date)] = cumulative;
        }
    }

    return blogData;
}

/**
 * Returns blogs visits monthly
 * @param id blogs id
 * return array[yyyy/mm]: visitCount 
 */
export async function GetVisitsPerMonthByBlog(id: string): Promise<IDictionary<number>>
{
    let blogData: IDictionary<number> = {}

    let blog = await this.GetBlogPostById(id);
    if (blog != null)
    {
        let startYear = new Date(2015, 12, 1);
        let endYear = new Date();

        for (let i = startYear; i < endYear; i.setMonth(i.getMonth() + 1)) {
            blogData[i.getFullYear() + "/" + (i.getMonth() + 1)] = 0;
        }

        for (let index in blog.visits) {
            let date = new Date(blog.visits[index]);
            blogData[date.getFullYear() + "/" + (date.getMonth() + 1)]++;
        }
    }

    return blogData;
}

/**
 * Get week number from date
 * @param Date date
 * return number week number
 */
var getWeek = function (date: Date)
{
    let onejan = new Date(date.getFullYear(), 0, 1);
    return Math.ceil((((date.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
}