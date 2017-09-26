const assert = require('assert');
var url = require('url');
var routing = require('../app/blog/Routing.js');

describe('Routing', function () {
    describe('parseRoute()', function () {
        it('should return null if route is not same', function () {
            var controllerRoute = "/route/asd/blog";
            var userRoute = "/route/asd/blo";

            var actual = routing.parseRoute(controllerRoute, url.parse(userRoute, true));
            assert.deepEqual(actual, null)
        });
        it('should return null if route is not same', function () {
            var controllerRoute = "/route/asd/blog";
            var userRoute = "/route/ad/blog";

            var actual = routing.parseRoute(controllerRoute, url.parse(userRoute, true));
            assert.deepEqual(actual, null)
        });
        it('should return null if route is not same', function () {
            var controllerRoute = "/route/asd/blog";
            var userRoute = "/route/asd/bloc";

            var actual = routing.parseRoute(controllerRoute, url.parse(userRoute, true));
            assert.deepEqual(actual, null)
        });
        it('should return null if route is not same - Case sensitive', function () {
            var controllerRoute = "/route/asd/blog";
            var userRoute = "/route/asd/Blog";

            var actual = routing.parseRoute(controllerRoute, url.parse(userRoute, true));
            assert.deepEqual(actual, null)
        });
        it('should return obj if route is same', function () {
            var controllerRoute = "/route/asd/blog";
            var userRoute = "/route/asd/blog";
            var parsedUrl = url.parse(userRoute, true);

            var actual = routing.parseRoute(controllerRoute, parsedUrl);
            assert.deepEqual(actual, new routing.RouteData(parsedUrl))
        });
        it('should return keys if route is same with value', function () {
            var controllerRoute = "/route/{asd}/blog";
            var userRoute = "/route/111/blog";
            var parsedUrl = url.parse(userRoute, true);

            var expected = new routing.RouteData(parsedUrl);
            expected.keys["asd"] = "111";

            var actual = routing.parseRoute(controllerRoute, parsedUrl);
            assert.deepEqual(actual, expected)
        });
        it('should return keys if route is same with value', function () {
            var controllerRoute = "/route/{asd}/{blog}";
            var userRoute = "/route/asd/123";
            var parsedUrl = url.parse(userRoute, true);

            var expected = new routing.RouteData(parsedUrl);
            expected.keys["asd"] = "asd";
            expected.keys["blog"] = 123;

            var actual = routing.parseRoute(controllerRoute, parsedUrl);
            assert.deepEqual(actual, expected)
        });
        it('should return keys urlDecoded if route is same with value', function () {
            var controllerRoute = "/route/{asd}/{blog}";
            var userRoute = "/route/asd%21/12%203";
            var parsedUrl = url.parse(userRoute, true);

            var expected = new routing.RouteData(parsedUrl);
            expected.keys["asd"] = "asd!";
            expected.keys["blog"] = "12 3";

            var actual = routing.parseRoute(controllerRoute, parsedUrl);
            assert.deepEqual(actual, expected)
        });
        it('should return null if route is not same', function () {
            var controllerRoute = "/route/asd/{blog";
            var userRoute = "/route/asd/blog";

            var actual = routing.parseRoute(controllerRoute, url.parse(userRoute, true));
            assert.deepEqual(actual, null)
        });
        it('should return null if route is not same', function () {
            var controllerRoute = "/route/{asd}/blog";
            var userRoute = "/route/asd/bloc";

            var actual = routing.parseRoute(controllerRoute, url.parse(userRoute, true));
            assert.deepEqual(actual, null)
        });
    });
});