import "mocha";
import * as assert from "assert";
import * as testUtility from "../TestUtility";
import * as blogService from "../../blog/BlogService";
import * as Blog from "../../blog/Model/Blog";

describe('BlogService', function () {

    testUtility.DBInitialization();

    describe('#AddBlogPost()', function ()
    {
        it('Should add blog to database, and not throw error', function (done)
        {
            blogService.AddBlogPost('a', 'b', 'c', 'd', 'e', ['f']);
            blogService.AddBlogPost('b', 'b', 'c', 'd', 'e', ['f']);
            done();
        });
        it('Should throw error if duplicate title', function (done)
        {
            blogService.AddBlogPost('a', 'b', 'c', 'd', 'e', ['f']);

            try
            {
                blogService.AddBlogPost('a', 'b', 'c', 'd', 'e', ['f']);
            }
            catch (err)
            {
                assert.ok(err.message.includes("E11000 duplicate key error"));
                assert.ok(err.message.includes("dup key: { : \"a\" }"));
                done();
            }
        });
    });

    describe('#GetLatestBlogPost()', function ()
    {
        it('Should return empty array if no blog posts', async function ()
        {
            var result = await blogService.GetLatestBlogPost(1)
            assert.equal(result.length, 0);
        });
        it('Should throw error if limit is negative', function (done) {
            assert.throws(
                () => {
                    blogService.GetLatestBlogPost(-1);
                },
                /Limit can't be negative/
            );
            done();
        });
        it('Should return all blogs when limit is 0', async function ()
        {
            var expected = 10;
            for (var i = 0; i < 10; i++) {
                testUtility.fixtures(new Blog({ title: i }));
            }

            var result = await blogService.GetLatestBlogPost(0);
            assert.equal(result.length, expected);
        });
        it('Should return expected number of blog posts', async function ()
        {
            var expected = 5;
            for (var i = 0; i < 10; i++) {
                testUtility.fixtures(new Blog({ title: i }));
            }

            var result = await blogService.GetLatestBlogPost(expected);
            assert.equal(result.length, expected);
        });
        it('Should return sorted by datetime array');
    });

    describe('#GetBlogPostById()', function () {
        it('Should return Error if id is not valid', async function ()
        {
            try
            {
                await blogService.GetBlogPostById("666"); //TODO ASSERT THROWS
            }
            catch (err)
            {
                assert.equal(err.message, "id: 666 is not valid");
            }
        });
        it('Should return null if no blog posts found', async function () {
            var result = await blogService.GetBlogPostById('56cb91bdc3464f14678934ca')
            assert.equal(result, null);
        });
        it('Should return searched blog post by id', async function () {

            var expectedBlog = new Blog({ title: "expected", image: "image", text: "text", description: "txt", category: "c" });
            var notExpectedBlog = new Blog({ title: "NotExpected", image: "image3", text: "tex_t", description: "tx_t", category: "c" });

            testUtility.fixtures(expectedBlog);
            testUtility.fixtures(notExpectedBlog);

            let result = await blogService.GetBlogPostById(String(expectedBlog.id));
            assert.equal(result.title, expectedBlog.title);
            assert.equal(result.image, expectedBlog.image);
            assert.equal(result.text, expectedBlog.text);
            assert.equal(result.description, expectedBlog.description);
            assert.equal(result.category, expectedBlog.category);

            assert.notEqual(result.title, notExpectedBlog.title);
        });
    });

    describe('#GetBlogPostByTitle()', function () {
        it('Should return null if no blog posts found', async function () {
            let blog = await blogService.GetBlogPostByTitle('TEST');
            assert.equal(blog, null);
        });
        it('Should return searched blog post by title', async function () {
            var expectedBlog = new Blog({ title: "expected", image: "image", text: "text", description: "txt", category: "c" });
            var notExpectedBlog = new Blog({ title: "NotExpected", image: "image3", text: "tex_t", description: "tx_t", category: "c" });

            testUtility.fixtures(expectedBlog);
            testUtility.fixtures(notExpectedBlog);

            let blog = await blogService.GetBlogPostByTitle(expectedBlog.title);

            assert.equal(blog.title, expectedBlog.title);
            assert.equal(blog.image, expectedBlog.image);
            assert.equal(blog.text, expectedBlog.text);
            assert.equal(blog.description, expectedBlog.description);
            assert.equal(blog.category, expectedBlog.category);

            assert.notEqual(blog.title, notExpectedBlog.title);
        });
    });
});