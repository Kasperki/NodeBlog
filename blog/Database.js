var mongoose = require('mongoose');

var dbHost = 'mongodb://localhost:27017/test';
mongoose.connect(dbHost);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(){
    console.log("Connected to DB");
});
    
//Create a schema for Blog
var blogSchema = mongoose.Schema({
  title: {type: String, index: true, unique: true},
  image: String,
  text: String,
  category: String,
  tags: [String],
  date: Date
});
    
var Blog = mongoose.model('Blog', blogSchema, "blog");
    
var exports = module.exports = {};

/**
 * Save blog post to db
 * @param string title
 * @param string image (url of image)
 * @param string text
 * @param string category
 * @param string[] tags
 */
exports.AddBlogPost = function (title, image, text, category, tags) {
    
    var blog = new Blog({
      title: title,
      image: image,
      text: text,
      category: category,
      tags: tags,
      date: Date.now()
    });

    blog.save(function(err){
      if ( err ) throw err;
      console.log("Blog post " + title + " saved!");
    });
};
    
/**
 * Gets array of latests blogs by limit
 * @param int limit
 * @param callback (Blog[] result)
 */
exports.GetLatestBlogPost = function(limit, callback) {
    Blog.find('title text date').sort({date: -1}).limit(limit).exec(function (err, result) {
    if (err) throw err;
    
        console.log(result);
        console.log(result[0].title + " " + result[0].text);
        
        if (typeof callback === "function") {
            callback(result);
        }
    });
};

/**
 * Gets blog post by title
 * @param string title
 * @param callback (Blog[] result)
 */
exports.GetBlogPostByTitle = function(title, callback) {
    Blog.find({ 'title': title }, 'title image text date', function (err, result) {
    if (err) throw err;
    
        console.log(result);
        
        if (typeof callback === "function") {
            callback(result);
        }
    });
};
