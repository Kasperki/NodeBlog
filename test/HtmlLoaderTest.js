const assert = require('assert');
var fs = require('fs');
var httpMocks = require('node-mocks-http');
var htmlLoader = require('../app/blog/HtmlLoader.js');
var config = require("../app/config.js");

describe('HtmlLoader', function () {

    var pathToTestFile = "test/file/test.html";
    
    describe('load()', function () {
        it('should set correct http status code & correct headers', function (done) {
            var response = httpMocks.createResponse();

            htmlLoader.load({ response: response }, pathToTestFile, null, 203);

            assert.equal(response.statusCode, 203);
            assert.deepEqual(response._headers,  {"Content-Type": "text/html"})
            done();
        });
        it('should send content of file', function (done) {
            var response = httpMocks.createResponse();

            htmlLoader.load({ response: response }, pathToTestFile, null, null);
            assert.equal(response._getData(), "<p>extra content</p>");
            done();
        });
    });
    
    describe('replaceParameters()', function () {
        it('should replace {{param}} in string', function () {
            var htmlString = "<html>Clock is {{ key }}</html>";
            var expectedString = "<html>Clock is 13:37</html>";
            
            var actualString = htmlLoader.replaceParameters(htmlString, {key: "13:37"});
            assert.equal(actualString, expectedString);
        });
        it('should replace {{param}} in longer html string', function () {
            var htmlString = "<html><title>TestCase</title> <div style=\"background-color:{{color}}\">This color is black</div></html>";
            var expectedString = "<html><title>TestCase</title> <div style=\"background-color:black\">This color is black</div></html>";
            
            var actualString = htmlLoader.replaceParameters(htmlString, {color: "black"});
            assert.equal(actualString, expectedString);
        });
        it('should replace same {{param}} multiple times in string', function () {
            var htmlString = "<html>Clock is {{ time }}:{{ time }}</html>";
            var expectedString = "<html>Clock is 13:13</html>";
            
            var actualString = htmlLoader.replaceParameters(htmlString, {time: "13"});
            assert.equal(actualString, expectedString);
        });
        it('should replace multiple different {{parameters}} in string', function () {
            var htmlString = "<html>Clock is {{ key }} how {{ emote }}</html>";
            var expectedString = "<html>Clock is 13:37 how nice</html>";
            
            var actualString = htmlLoader.replaceParameters(htmlString, {key: "13:37", emote: 'nice'});
            assert.equal(actualString, expectedString);
        });
        it('should replace {{param}} in string and ignore whitespaces', function () {
            var htmlString = "<html>Clock is {{  key    }}</html>";
            var expectedString = "<html>Clock is 13:37</html>";
            
            var actualString = htmlLoader.replaceParameters(htmlString, {key: "13:37"});
            assert.equal(actualString, expectedString);
        });
        it('should replace {{param}} in string without whitespaces', function () {
            var htmlString = "<html>Clock is {{key}}</html>";
            var expectedString = "<html>Clock is 13:37</html>";
            
            var actualString = htmlLoader.replaceParameters(htmlString, {key: "13:37"});
            assert.equal(actualString, expectedString);
        });
        it('should not replace {param}', function () {
            var expectedString = "<html>Clock is { key }</html>";
            
            var actualString = htmlLoader.replaceParameters(expectedString, {key: "13:37"});
            assert.equal(actualString, expectedString);
        });
        it('should not replace {{param}', function () {
            var expectedString = "<html>Clock is {{ key }</html>";
            
            var actualString = htmlLoader.replaceParameters(expectedString, {key: "13:37"});
            assert.equal(actualString, expectedString);
        });
        it('should not replace {{param}}', function () {
            var htmlString = "<html>Clock is {{ asd }}</html>";
            var expectedString = "<html>Clock is {{ asd }}</html>";
            
            var actualString = htmlLoader.replaceParameters(htmlString, {key: "13:37"});
            assert.equal(actualString, expectedString);
        });
        it('should not replace {{param}} - Case sensitive', function () {
            var htmlString = "<html>Clock is {{ Key }}</html>";
            var expectedString = "<html>Clock is {{ Key }}</html>";
            
            var actualString = htmlLoader.replaceParameters(htmlString, {key: "13:37"});
            assert.equal(actualString, expectedString);
        });
    });
    
    describe('extendHtmlFile()', function () {
        it('should replace {% extends path/to/file %} in string', function () {
            var htmlString = "<html> need more stuff here : {% extends test/file/test.html %}</html>";
            var expectedString = "<html> need more stuff here : <p>extra content</p></html>";
            
            var actualString = htmlLoader.extendHtmlFile(htmlString);
            assert.equal(actualString, expectedString);
        });
        it('should replace multiple {% extends path/to/file %} in string', function () {
            var htmlString = "<html> need more stuff here : {% extends test/file/test.html %} and here: {% extends test/file/test.html %}</html>";
            var expectedString = "<html> need more stuff here : <p>extra content</p> and here: <p>extra content</p></html>";
            
            var actualString = htmlLoader.extendHtmlFile(htmlString);
            assert.equal(actualString, expectedString);
        });
        it('should not throw error if  {% extends path/to/file %} does not exist', function () {
            var expectedString = "<html> need more stuff here : { extends test/file/test.html %}</html>";       
            var actualString = htmlLoader.extendHtmlFile(expectedString);
            assert.equal(actualString, expectedString);
        });
        it('should replace {% extends path/to/file %} with invalid path with empty string', function () {
            var htmlString = "<html> need more stuff here : {% extends not/exists/test.html %} {% extends notAexists-test.html %}</html>";       
            var expectedString = "<html> need more stuff here : </html>";
            var actualString = htmlLoader.extendHtmlFile(expectedString);
            assert.equal(actualString, expectedString);
        });
        it('should replace also parameters in extended file', function() {
            var htmlString = "<html> need more stuff here : {% extends test/file/test.1.html %}</html>";
            var expectedString = "<html> need more stuff here : <p>extra content</p> asd</html>";
            
            var actualString = htmlLoader.extendHtmlFile(htmlString, {extend: "asd"});
            assert.equal(actualString, expectedString);
        });
    });
    
    describe('combineFiles()', function () {
        
         beforeEach(function() {
            fs.mkdirSync("test/cache");
        });

        afterEach(function() {
            
            var paths = fs.readdirSync("test/cache");

            for (i = 0; i < paths.length; i++) {
                fs.unlinkSync("test/cache/" + paths[i]);
            }
            
            fs.rmdirSync("test/cache");
        });
        
        it('should not do anything if {% stylesheet } tag is invalid', function () {
            
            var expected = '<html> styles { stylesheet output="test/file/test.html" "test/file/test.html" %}</html>';
            var actual = htmlLoader.combineFiles(expected);
            assert.equal(actual, expected);
        });
        it('should not throw error if {% stylesheet %} is missing output argument', function () {
            
            var htmlString = '<html> styles {% stylesheet outdput= "test/file/test.html" "test/file/test.html" %}</html>';
            htmlLoader.combineFiles(htmlString);
            assert.ok(true);
        });
        it('should not throw error if {% stylesheet %} has invalid output path', function () {
            
            var htmlString = '<html> styles {% stylesheet output="path/to/file/does/not/exists" "test/file/test.html" "test/file/test.html" %}</html>';
            htmlLoader.combineFiles(htmlString);
            assert.ok(true);
        });
        it('should not throw error if {% stylesheet %} is missing input arguments', function () {
            
            var htmlString = '<html> styles {% stylesheet output="test/cache/file.html" %}</html>';
            htmlLoader.combineFiles(htmlString);
            assert.ok(true);
        });
        it('should not throw error if {% stylesheet %} has invalid input paths', function () {
            
            var htmlString = '<html> styles {% stylesheet output="test/cache/file.html" "does/not/exists/file.html" "does/not/exists/test.html" %}</html>';
            htmlLoader.combineFiles(htmlString);
            assert.ok(true);
        });
        it('should remove {% stylesheet output="path/to/file" "path/to/file" "path/to/file" %} in string', function () {
            
            var htmlString = '<html> styles {% stylesheet output="test/cache/file.html" "test/file/test.html" "test/file/test.html" %}</html>';
            var expectedString = "<html> styles </html>";
            
            var actualString = htmlLoader.combineFiles(htmlString);
            assert.equal(actualString, expectedString);
        });
        it('should combine files in {% stylesheet %} to output directory', function (done) {
            
            var outputPath = "test/cache/TESTFILE.css";
            var htmlString = '<html> styles {% stylesheet output="' + outputPath + '" "test/file/test.html" "test/file/test.html" %}</html>';
            htmlLoader.combineFiles(htmlString);
            
            var file = fs.readFileSync(outputPath, 'utf-8');
            
            assert.equal(file, '<p>extra content</p><p>extra content</p>');
            done();
        });
        it('should not combine files in {% stylesheet %} to outputFile if it already exists', function (done) {
            
            var outputPath = "test/cache/TESTFILE.css";
            var htmlString = '<html> styles {% stylesheet output="' + outputPath + '" "test/file/test.html" "test/file/test.html" %}</html>';
            htmlLoader.combineFiles(htmlString);
            htmlLoader.combineFiles(htmlString);
            
            var file = fs.readFileSync(outputPath, 'utf-8');
            
            assert.equal(file, '<p>extra content</p><p>extra content</p>');
            done();
        });
    });

    describe('templateIf()', function () {
        it('should render block if strings are equal', function () {
            var htmlString = "<html>{% if \"a\" == \"a\" %}OK{%endif%}</html>";
            var expectedString = "<html>OK</html>";
            
            var actualString = htmlLoader.TemplateIf(htmlString);
            assert.equal(actualString, expectedString);
        });
        it('should render block if numbers are equal', function () {
            var htmlString = "<html>{% if 2 == 2 %}OK{%endif%}</html>";
            var expectedString = "<html>OK</html>";
            
            var actualString = htmlLoader.TemplateIf(htmlString);
            assert.equal(actualString, expectedString);
        });
        it('should render block if bool is true', function () {
            var htmlString = "<html>{% if true == true %}OK{%endif%}</html>";
            var expectedString = "<html>OK</html>";
            
            var actualString = htmlLoader.TemplateIf(htmlString);
            assert.equal(actualString, expectedString);
        });
        it('should render block if var is null', function () {
            var htmlString = "<html>{% if null == null %}OK{%endif%}</html>";
            var expectedString = "<html>OK</html>";
            
            var actualString = htmlLoader.TemplateIf(htmlString);
            assert.equal(actualString, expectedString);
        });
        it('should NOT render block if strings are not equal', function () {
            var htmlString = "<html>{% if \"a\" == \"b\" %}OK{%endif%}</html>";
            var expectedString = "<html></html>";
            
            var actualString = htmlLoader.TemplateIf(htmlString);
            assert.equal(actualString, expectedString);
        });
        it('should NOT render block if numbers are not equal', function () {
            var htmlString = "<html>{% if 1 == 2 %}OK{%endif%}</html>";
            var expectedString = "<html></html>";
            
            var actualString = htmlLoader.TemplateIf(htmlString);
            assert.equal(actualString, expectedString);
        });
        it('should NOT render block if bool is not true', function () {
            var htmlString = "<html>{% if true == false %}OK{%endif%}</html>";
            var expectedString = "<html></html>";
            
            var actualString = htmlLoader.TemplateIf(htmlString);
            assert.equal(actualString, expectedString);
        });
        it('should NOT render block if var is not null', function () {
            var htmlString = "<html>{% if 1 == null %}OK{%endif%}</html>";
            var expectedString = "<html></html>";
            
            var actualString = htmlLoader.TemplateIf(htmlString);
            assert.equal(actualString, expectedString);
        });
        it('should render all if blocks that are true', function () {
            var htmlString = "<html>{% if 2 == 2 %}OK{%endif%} - {% if 3 == 3 %}KEK{%endif%}</html>";
            var expectedString = "<html>OK - KEK</html>";
            
            var actualString = htmlLoader.TemplateIf(htmlString);
            assert.equal(actualString, expectedString);
        });
        it('should render all if blocks that are true', function () {
            var htmlString = "<html>{% if 2 == 2 %}OK{%endif%} 2 {% if true == true %}KEDK{%endif%}</html>";
            var expectedString = "<html>OK 2 KEDK</html>";
            
            var actualString = htmlLoader.TemplateIf(htmlString);
            assert.equal(actualString, expectedString);
        });
        it('should render all if blocks that are true', function () {
            var htmlString = "<html>{% if 2 == 2 %}OK{%endif%} 1{% if false == true %}KEDK{%endif%}</html>";
            var expectedString = "<html>OK 1</html>";
            
            var actualString = htmlLoader.TemplateIf(htmlString);
            assert.equal(actualString, expectedString);
        });
        it('should render block even if the if condition is on multiple lines', function () {
            var htmlString = "<html>{% if 2 == 2 %}\n  OK \n {%endif%}</html>";
            var expectedString = "<html>OK</html>";
            
            var actualString = htmlLoader.TemplateIf(htmlString);
            assert.equal(actualString, expectedString);
        });
    });
});