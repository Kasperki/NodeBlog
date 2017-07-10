"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
require("mocha");
const assert = require("assert");
//let dbutils = require('./TestDBUtils.js');
const blogService = require("../../blog/BlogService");
describe('BlogService', function () {
    describe('#AddBlogPost()', function () {
        it('Should add blog to database, and not throw error', function (done) {
            blogService.AddBlogPost('a', 'b', 'c', 'd', 'e', ['f']);
            blogService.AddBlogPost('b', 'b', 'c', 'd', 'e', ['f']);
            done();
        });
        it('Should throw error if duplicate title', function (done) {
            blogService.AddBlogPost('a', 'b', 'c', 'd', 'e', ['f']);
            try {
                blogService.AddBlogPost('a', 'b', 'c', 'd', 'e', ['f']);
            }
            catch (err) {
                assert.ok(err.message.includes("E11000 duplicate key error"));
                assert.ok(err.message.includes("dup key: { : \"a\" }"));
                done();
            }
        });
    });
    describe('#GetLatestBlogPost()', function () {
        it('Should return empty array if no blog posts', function (done) {
            return __awaiter(this, void 0, void 0, function* () {
                var result = yield blogService.GetLatestBlogPost(1);
                assert.equal(result.length, 0);
                done();
            });
        });
        it('Should throw error if limit is negative', function (done) {
            assert.throws(() => {
                blogService.GetLatestBlogPost(-1);
            }, /Limit can't be negative/);
            done();
        });
        it('Should return all blogs when limit is 0', function (done) {
            return __awaiter(this, void 0, void 0, function* () {
                var expected = 10;
                for (var i = 0; i < 10; i++) {
                    dbutils.fixtures(new blogService.Blog({ title: i }));
                }
                var result = yield blogService.GetLatestBlogPost(0);
                assert.equal(result.length, expected);
                done();
            });
        });
        it('Should return expected number of blog posts', function (done) {
            return __awaiter(this, void 0, void 0, function* () {
                var expected = 5;
                for (var i = 0; i < 10; i++) {
                    dbutils.fixtures(new blogService.Blog({ title: i }));
                }
                var result = yield blogService.GetLatestBlogPost(expected);
                assert.equal(result.length, expected);
                done();
            });
        });
        it('Should return sorted by datetime array');
    });
    describe('#GetBlogPostById()', function () {
        it('Should return Error if id is not valid', function (done) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    blogService.GetBlogPostById("666"); //TODO ASSERT THROWS
                }
                catch (err) {
                    assert.equal(err.message, "id: 666 is not valid");
                    done();
                }
            });
        });
        it('Should return null if no blog posts found', function (done) {
            return __awaiter(this, void 0, void 0, function* () {
                var result = yield blogService.GetBlogPostById('56cb91bdc3464f14678934ca');
                assert.equal(result, null);
                done();
            });
        });
        it('Should return searched blog post by id', function (done) {
            return __awaiter(this, void 0, void 0, function* () {
                var expectedBlog = new blogService.Blog({ title: "expected", image: "image", text: "text", description: "txt", category: "c" });
                var notExpectedBlog = new blogService.Blog({ title: "NotExpected", image: "image3", text: "tex_t", description: "tx_t", category: "c" });
                dbutils.fixtures(expectedBlog);
                dbutils.fixtures(notExpectedBlog);
                let result = yield blogService.GetBlogPostById(expectedBlog.id);
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
    describe('#GetBlogPostByTitle()', function () {
        it('Should return null if no blog posts found', function (done) {
            return __awaiter(this, void 0, void 0, function* () {
                let blog = yield blogService.GetBlogPostByTitle('TEST');
                assert.equal(blog, null);
                done();
            });
        });
        it('Should return searched blog post by title', function (done) {
            return __awaiter(this, void 0, void 0, function* () {
                var expectedBlog = new blogService.Blog({ title: "expected", image: "image", text: "text", description: "txt", category: "c" });
                var notExpectedBlog = new blogService.Blog({ title: "NotExpected", image: "image3", text: "tex_t", description: "tx_t", category: "c" });
                dbutils.fixtures(expectedBlog);
                dbutils.fixtures(notExpectedBlog);
                let blog = yield blogService.GetBlogPostByTitle(expectedBlog.title);
                assert.equal(blog.title, expectedBlog.title);
                assert.equal(blog.image, expectedBlog.image);
                assert.equal(blog.text, expectedBlog.text);
                assert.equal(blog.description, expectedBlog.description);
                assert.equal(blog.category, expectedBlog.category);
                assert.notEqual(blog.title, notExpectedBlog.title);
                done();
            });
        });
    });
});
