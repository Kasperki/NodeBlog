const assert = require('assert');
var dbutils = require('./TestDBUtils.js');
var blogService = require('../blog/BlogService.js');

describe('BlogService', function () {

  dbutils.dbInitialization();

  describe('#AddBlogPost()', function () {
    it('Should add blog to database, and not throw error', function (done) {
         blogService.AddBlogPost('a','b','c','d','e', function(result) {
             done();
         });
    });
    it('Should throw error if duplicate title');
    it('Should add current datetime to blog');
  });

  describe('#GetLatestBlogPost()', function () {
        it('Should return empty array if no blog posts', function (done) {        
            blogService.GetLatestBlogPost(1, function(result) {
                assert.equal(result.length, 0);
                done();
            });
        });
        it('Should return expected number of blog posts', function (done) {        
            
            var expected = 5;
            for (var i = 0; i < 10; i++) {
                dbutils.fixtures(new blogService.Blog({title:i}));
            }
            
            blogService.GetLatestBlogPost(expected, function(result) {
                assert.equal(result.length, expected);
                done();
            });
        });
        it('Should return sorted by datetime array');
    });
    
    describe('#GetBlogPostByTitle()', function () {
        it('Should return empty array if no blog posts', function (done) {        
            blogService.GetBlogPostByTitle("1", function(result) {
                assert.equal(result.length, 0);
                done();
            });
        });
        it('Should return searched blog post by title', function (done) {        
            
            var expectedTitle = "Expected";
            var expectedBlog = new blogService.Blog({title:expectedTitle, image: "image", text:"text", category:"c"});
            var notExpectedBlog = new blogService.Blog({title:"NotExpected", image: "image3", text:"tex_t", category:"c"});

            dbutils.fixtures(expectedBlog);
            dbutils.fixtures(notExpectedBlog);
            
            blogService.GetBlogPostByTitle(expectedTitle, function(result) {
                assert.equal(result[0].title, expectedBlog.title);
                assert.equal(result[0].image, expectedBlog.image);
                assert.equal(result[0].text, expectedBlog.text);
                assert.equal(result[0].category, expectedBlog.category);
                
                assert.notEqual(result[0].title, notExpectedBlog.title);
                done();
            });
        });
    });

});