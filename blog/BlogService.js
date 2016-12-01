var mongoose = require('mongoose');
var exports = module.exports = {};

//Create a schema for Blog
var blogSchema = mongoose.Schema({
    title: { type: String, index: true, unique: true },
    image: String,
    text: String,
    description: String,
    category: String,
    tags: [String],
    date: Date,
    visits: [Date]
});

//Blog model
var Blog = mongoose.model('Blog', blogSchema, "blog");
exports.Blog = Blog;

/**
 * Save blog post to db
 * @param string title
 * @param string image (url of image)
 * @param string text
 * @param string description
 * @param string category
 * @param string[] tags
 * @param int visits
 * @param callback (err, true)
 */
exports.AddBlogPost = function (title, image, text, description, category, tags, callback) {

    var blog = new Blog({
        title: title,
        image: image,
        text: text,
        category: category,
        description: description,
        tags: tags,
        date: Date.now(),
        visits: [],
    });

    blog.save(function (err) {
        if (typeof callback === "function") {
            callback(err, true);
        }
    });
};

exports.UpdateBlogPost = function (title, image, text, description, category, tags, callback) {

  Blog.update({ title: title }, { $set: { image: image, text: text, description: description, category: category, tags: tags }}
  , function (err, raw) {
        if (typeof callback === "function") {
            callback(err, true);
        }
  });
}

/**
 * Gets array of latests blogs by limit
 * @param int limit
 * @param callback (err, Blog[] result)
 */
exports.GetLatestBlogPost = function (limit, callback) {
    
    if (limit < 0)
        throw new Error("Limit can't be negative");
    
    Blog.find('title text date').sort({ date: -1 }).limit(limit).exec(function (err, result) {
        if (err) throw err;

        if (typeof callback === "function") {
            callback(err, result);
        }
    });
};

/**
 * Gets blog post by id
 * @param string id
 * @param callback (err, Blog result)
 */
exports.GetBlogPostById = function (id, callback) {
    
    if (!mongoose.Types.ObjectId.isValid(id))
    {
        if (typeof callback === "function") {
            callback(new Error('id: ' + id + " is not valid"), null);
        }       
        return;
    }
       
    Blog.find({ '_id': id }, 'title image text description category tags date visits', function (err, result) {
        if (err) throw err;
                
        if (typeof callback === "function") {
            callback(null, result[0]);
        }
    });
};

/**
 * Gets blog post by title
 * @param string title
 * @param callback (err, Blog result)
 */
exports.GetBlogPostByTitle = function (title, callback) {
    
    if (typeof title !== 'string')
    {
        if (typeof callback === "function") {
            callback(new Error('title: ' + title + " is not string"), null);
        }       
        return;
    }
       
    Blog.find({ 'title': title }, 'title image text description category date visits', function (err, result) {
        if (err) throw err;
                
        if (typeof callback === "function") {
            callback(null, result[0]);
        }
    });
};

/**
 * Gets array of blogs by category
 * @param string category
 * @param callback (err, Blog[] result)
 */
exports.GetBlogPostsByCategory = function (category, callback) {
    
    if (typeof category !== 'string')
    {
        if (typeof callback === "function") {
            callback(new Error('category: ' + category + " is not string"), null);
        }       
        return;
    }
    
    Blog.find({'category': category}).sort({ date: -1 }).exec(function (err, result) {
        if (err) throw err;

        if (typeof callback === "function") {
            callback(err, result);
        }
    });
};

/**
 * Gets array of blogs that has tag
 * @param string tag
 * @param callback (err, Blog[] result)
 */
exports.GetBlogPostsByTag = function (tag, callback) {
    
    if (typeof tag !== 'string')
    {
        if (typeof callback === "function") {
            callback(new Error('category: ' + tag + " is not string"), null);
        }       
        return;
    }
    
    Blog.find({'tags': tag}).sort({ date: -1 }).exec(function (err, result) {
        if (err) throw err;

        if (typeof callback === "function") {
            callback(err, result);
        }
    });
};

/**
 * Gets array of all categories
 * @param callback (err, Tags[Name, Count] result)
 */
exports.GetCategories = function (callback) {
    
    Blog.find().exec(function (err, result) {
        if (err) throw err;

        if (typeof callback === "function") {
            
            var categories = {};

            for (var i = 0; i < result.length; i++)
            {
                if (!categories[result[i].category]) { 
                    categories[result[i].category] = 1; 
                }
                else {
                    categories[result[i].category] += 1;
                }
            }
            
            callback(err, categories);
        }
    });
};

/**
 * Gets array of all tags
 * @param callback (err, Tags[Name, Count] result)
 */
exports.GetTags = function (callback) {
    
    Blog.find().exec(function (err, result) {
        if (err) throw err;

        if (typeof callback === "function") {
            
            var tags = {};

            for (var i = 0; i < result.length; i++)
            {
                }
            }
            
            callback(err, categories);
        }
    });
};

/**
 * Gets array of all tags
 * @param callback (err, Tags[Name, Count] result)
 */
exports.GetTags = function (callback) {
    
    Blog.find().exec(function (err, result) {
        if (err) throw err;

        if (typeof callback === "function") {
            
            var tags = {};

            for (var i = 0; i < result.length; i++)
            {
                if (result[i].tags != null) {
                    result[i].tags.forEach(function(tag) {
                        if (!tags[tag]) { 
                            tags[tag] = 1; 
                        }
                        else {
                            tags[tag] += 1;
                        }
                    });
                }
                if (result[i].tags != null) {
                    result[i].tags.forEach(function(tag) {
                        if (!tags[tag]) { 
                            tags[tag] = 1; 
                        }
                        else {
                            !tags[tag] + 1;
                        }
                    });
                }
            }
            
            callback(err, tags);
        }
    });
};

/**
 * Add visit to blog
 * @param Blog blog
 * @param callback (err, Blog[] result)
 */
exports.AddVisit = function (blog, callback) {
 
 if (blog.visits == null)
 {
     blog.visits = [];
 }

  blog.visits.push(Date.now());
  Blog.update({ _id: blog._id }, { $set: { visits: blog.visits }}, function (err, raw) {
  });
};

/**
 * Remove blog post
 * @param Blog blog
 * @param callback (err, Blog[] result)
 */
exports.RemoveBlog = function (id, callback) {
  Blog.find({ _id: id }).remove(function (err, raw) {
  });
};

/**
 * Returns blog titles with visit count
 * return array[Title]: visitCount;
 */
exports.GetAllVisits = function(callback)
{
    var allData = {};
    
    this.GetLatestBlogPost(0, function(err, blogs) {
        for (var i = 0; i < blogs.length; i++)
         {
            allData[blogs[i].title] =  blogs[i].visits.length;
         }

        if (typeof callback === "function") {
            callback(err, allData);
        }
    });
};

/**
 * Returns all blog visits cumulatively weekly
 * @param id blogs id
 * return array[yyyy/week]: visitCount 
 */
exports.GetVisitsPerWeekByAllBlogs = function(callback)
{
     var blogData = {}

     this.GetLatestBlogPost(0, function(err, blogs) 
     {
        var startingYear = 2016;
        var startYear = new Date(startingYear,6,1);
        var endYear = Date.now();

        var cumulative = 0;

        for (var date = startYear; date < endYear; date.setDate(date.getDate() + 7))
        {
            blogData[date.getFullYear() + "/" + getWeek(date)] = 0;
        }

        for (var i = 0; i < blogs.length; i++) {
            for (var index in blogs[i].visits)
            { 
                cumulative++;
                var date = new Date(blogs[i].visits[index]);
                blogData[date.getFullYear() + "/" + getWeek(date)] = cumulative;
            };
        }
        
        if (typeof callback === "function") {
            callback(err, blogData);
        }
    });
};

/**
 * Returns blogs visits monthly
 * @param id blogs id
 * return array[yyyy/mm]: visitCount 
 */
exports.GetVisitsPerMonthByBlog = function(id, callback)
{
        var blogData = {}

        this.GetBlogPostById(id, function (err, blog) 
        {
            if (blog != null) 
            {
                var startYear = new Date(2015,12,1);
                var endYear = Date.now();

                for (var i = startYear; i < endYear; i.setMonth(i.getMonth() + 1))
                {
                    blogData[i.getFullYear() + "/" + (i.getMonth() + 1)] = 0;
                }

                for (var index in blog.visits)
                {   
                    var date = new Date(blog.visits[index]);
                    blogData[date.getFullYear() + "/" + (date.getMonth() + 1)]++;
                }
            }
        
            if (typeof callback === "function") 
            {
                callback(err, blogData);
            }
     });
}

/**
 * Get week number from date
 * @param Date date
 * return number week number
 */
var getWeek = function (date)
{
    var onejan = new Date(date.getFullYear(),0,1);
    return Math.ceil((((date - onejan) / 86400000) + onejan.getDay()+1)/7);
}};

/**
 * Add visit to blog
 * @param Blog blog
 * @param callback (err, Blog[] result)
 */
exports.AddVisit = function (blog, callback) {
 
 if (blog.visits == null)
 {
     blog.visits = [];
 }

  blog.visits.push(Date.now());
  Blog.update({ _id: blog._id }, { $set: { visits: blog.visits }}, function (err, raw) {
  });
};

/**
 * Remove blog post
 * @param Blog blog
 * @param callback (err, Blog[] result)
 */
exports.RemoveBlog = function (id, callback) {
  Blog.find({ _id: id }).remove(function (err, raw) {
  });
};

/**
 * Returns blog titles with visit count
 * return array[Title]: visitCount;
 */
exports.GetAllVisits = function(callback)
{
    var allData = {};
    
    this.GetLatestBlogPost(0, function(err, blogs) {
        for (var i = 0; i < blogs.length; i++)
         {
            allData[blogs[i].title] =  blogs[i].visits.length;
         }

        if (typeof callback === "function") {
            callback(err, allData);
        }
    });
};

/**
 * Returns all blog visits cumulatively weekly
 * @param id blogs id
 * return array[yyyy/week]: visitCount 
 */
exports.GetVisitsPerWeekByAllBlogs = function(callback)
{
     var blogData = {}

     this.GetLatestBlogPost(0, function(err, blogs) 
     {
        var startingYear = 2016;
        var startYear = new Date(startingYear,6,1);
        var endYear = Date.now();

        var cumulative = 0;

        for (var date = startYear; date < endYear; date.setDate(date.getDate() + 7))
        {
            blogData[date.getFullYear() + "/" + getWeek(date)] = 0;
        }

        for (var i = 0; i < blogs.length; i++) {
            for (var index in blogs[i].visits)
            { 
                cumulative++;
                blogData[blogs[i].visits[index].getFullYear() + "/" + getWeek(blogs[i].visits[index])] = cumulative;
            };
        }
        
        if (typeof callback === "function") {
            callback(err, blogData);
        }
    });
};

/**
 * Returns blogs visits monthly
 * @param id blogs id
 * return array[yyyy/mm]: visitCount 
 */
exports.GetVisitsPerMonthByBlog = function(id, callback)
{
        var blogData = {}

        this.GetBlogPostById(id, function (err, blog) 
        {
            if (blog != null) 
            {
                var startYear = new Date(2015,12,1);
                var endYear = Date.now();

                for (var i = startYear; i < endYear; i.setMonth(i.getMonth() + 1))
                {
                    blogData[i.getFullYear() + "/" + (i.getMonth() + 1)] = 0;
                }

                for (var index in blog.visits)
                {   
                    blogData[blog.visits[index].getFullYear() + "/" + (blog.visits[index].getMonth() + 1)]++;
                }
            }
        
            if (typeof callback === "function") 
            {
                callback(err, blogData);
            }
     });
}

/**
 * Get week number from date
 * @param Date date
 * return number week number
 */
var getWeek = function (date)
{
    var onejan = new Date(date.getFullYear(),0,1);
    return Math.ceil((((date - onejan) / 86400000) + onejan.getDay()+1)/7);
}