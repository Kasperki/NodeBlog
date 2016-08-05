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
    date: Date
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
        date: Date.now()
    });

    blog.save(function (err) {
        if (typeof callback === "function") {
            callback(err, true);
        }
    });
};

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
       
    Blog.find({ '_id': id }, 'title image text description category date', function (err, result) {
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
       
    Blog.find({ 'title': title }, 'title image text description category date', function (err, result) {
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
                    categories[result[i].category] = categories[result[i].category] + 1;
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
                 result[i].tags.forEach(function(tag) {
                    if (!tags[tag]) { 
                        tags[tag] = 1; 
                    }
                    else {
                        !tags[tag] + 1;
                    }
                });
            }
            
            callback(err, tags);
        }
    });
};