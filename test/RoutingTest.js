const assert = require('assert');
var fs = require('fs');
var routing = require('../blog/Routing.js');

describe('Routing', function () {
    describe('parseRoute()', function () {
        it('should return false if route is not same', function () {
            var controllerRoute = "/route/asd/blog";
            var userRoute = "/route/asd/blo";

            var actual = routing.parseRoute(controllerRoute, userRoute);
            assert.deepEqual(actual, false)
        });
        it('should return false if route is not same', function () {
            var controllerRoute = "/route/asd/blog";
            var userRoute = "/route/ad/blog";

            var actual = routing.parseRoute(controllerRoute, userRoute);
            assert.deepEqual(actual, false)
        });
        it('should return false if route is not same', function () {
            var controllerRoute = "/route/asd/blog";
            var userRoute = "/route/asd/bloc";

            var actual = routing.parseRoute(controllerRoute, userRoute);
            assert.deepEqual(actual, false)
        });
        it('should return false if route is not same - Case sensitive', function () {
            var controllerRoute = "/route/asd/blog";
            var userRoute = "/route/asd/Blog";

            var actual = routing.parseRoute(controllerRoute, userRoute);
            assert.deepEqual(actual, false)
        });
        it('should return obj if route is same', function () {
            var controllerRoute = "/route/asd/blog";
            var userRoute = "/route/asd/blog";

            var actual = routing.parseRoute(controllerRoute, userRoute);
            assert.deepEqual(actual, {})
        });
        it('should return keys if route is same with value', function () {
            var controllerRoute = "/route/{asd}/blog";
            var userRoute = "/route/111/blog";

            var actual = routing.parseRoute(controllerRoute, userRoute);
            assert.deepEqual(actual, {asd:111})
        });
        it('should return keys if route is same with value', function () {
            var controllerRoute = "/route/{asd}/{blog}";
            var userRoute = "/route/asd/123";

            var actual = routing.parseRoute(controllerRoute, userRoute);
            assert.deepEqual(actual, {asd:"asd",blog:123})
        });
        it('should return false if route is not same', function () {
            var controllerRoute = "/route/asd/{blog";
            var userRoute = "/route/asd/blog";

            var actual = routing.parseRoute(controllerRoute, userRoute);
            assert.deepEqual(actual, false)
        });
        it('should return false if route is not same', function () {
            var controllerRoute = "/route/{asd}/blog";
            var userRoute = "/route/asd/bloc";

            var actual = routing.parseRoute(controllerRoute, userRoute);
            assert.deepEqual(actual, false)
        });
    });
});