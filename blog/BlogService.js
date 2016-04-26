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
 * @param callback (true)
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
        if (err) throw err;
        if (typeof callback === "function") {
            callback(true);
        }
    });
};

/**
 * Gets array of latests blogs by limit
 * @param int limit
 * @param callback (Blog[] result)
 */
exports.GetLatestBlogPost = function (limit, callback) {
    Blog.find('title text date').sort({ date: -1 }).limit(limit).exec(function (err, result) {
        if (err) throw err;

        console.log(result);

        if (typeof callback === "function") {
            callback(result);
        }
    });
};

/**
 * Gets blog post by title
 * @param string title
 * @param callback (err, Blog[] result)
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