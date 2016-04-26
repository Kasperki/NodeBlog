const assert = require('assert');
var mongoose = require('mongoose');
var dbutils = require('./TestDBUtils.js');
var blogService = require('../blog/BlogService.js');

describe('BlogService', function () {

  dbutils.dbInitialization();

  describe('#AddBlogPost()', function () {
    it('Should add blog to database, and not throw error', function (done) {
         blogService.AddBlogPost('a','b','c','d','e','f', function(result) {
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
    
    describe('#GetBlogPostById()', function () {
        it('Should return Error if id is not valid', function (done) {        
            blogService.GetBlogPostById("666", function(err, result) {
                assert.equal(err.message, "id: 666 is not valid");
                done();
            });
        });
        it('Should return null if no blog posts found', function (done) {        
            blogService.GetBlogPostById('56cb91bdc3464f14678934ca', function(err, result) {
                assert.equal(result, null);
                done();
            });
        });
        it('Should return searched blog post by id', function (done) {        
                      
            var expectedBlog = new blogService.Blog({title:"expected", image: "image", text:"text", description: "txt", category:"c"});
            var notExpectedBlog = new blogService.Blog({title:"NotExpected", image: "image3", text:"tex_t", description: "tx_t", category:"c"});

            dbutils.fixtures(expectedBlog);
            dbutils.fixtures(notExpectedBlog);
                       
            blogService.GetBlogPostById(expectedBlog.id, function(err, result) {
                             
                assert.equal(result.title, expectedBlog.title);
                assert.equal(result.image, expectedBlog.image);
                assert.equal(result.text, expectedBlog.text);
                assert.equal(result.description, expectedBlog.description);
                assert.equal(result.category, expectedBlog.category);
                
                assert.notEqual(result.title, notExpectedBlog.title);
                done();
            });
        });
    });

});