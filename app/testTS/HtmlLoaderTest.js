"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("mocha");
const assert = require("assert");
const fs = require("fs");
const httpMocks = require("node-mocks-http");
const htmlLoader = require("../blog/HtmlLoader");
describe('HtmlLoader', () => {
    let pathToTestFile = "test/file/test.html";
    describe('load()', () => {
        it('should set correct http status code & correct headers', function (done) {
            let response = httpMocks.createResponse();
            htmlLoader.load({ response: response }, pathToTestFile, null, 203);
            assert.equal(response._getStatusCode(), 203);
            assert.deepEqual(response._getHeaders, { "Content-Type": "text/html" });
            done();
        });
        it('should send content of file', function (done) {
            let response = httpMocks.createResponse();
            htmlLoader.load({ response: response }, pathToTestFile, null);
            assert.equal(response._getData(), "<p>extra content</p>");
            done();
        });
    });
    describe('replaceParameters()', () => {
        it('should replace {{param}} in string', () => {
            let htmlString = "<html>Clock is {{ key }}</html>";
            let expectedString = "<html>Clock is 13:37</html>";
            let actualString = htmlLoader.replaceParameters(htmlString, { key: "13:37" });
            assert.equal(actualString, expectedString);
        });
        it('should replace {{param}} in longer html string', () => {
            let htmlString = "<html><title>TestCase</title> <div style=\"background-color:{{color}}\">This color is black</div></html>";
            let expectedString = "<html><title>TestCase</title> <div style=\"background-color:black\">This color is black</div></html>";
            let actualString = htmlLoader.replaceParameters(htmlString, { color: "black" });
            assert.equal(actualString, expectedString);
        });
        it('should replace same {{param}} multiple times in string', () => {
            let htmlString = "<html>Clock is {{ time }}:{{ time }}</html>";
            let expectedString = "<html>Clock is 13:13</html>";
            let actualString = htmlLoader.replaceParameters(htmlString, { time: "13" });
            assert.equal(actualString, expectedString);
        });
        it('should replace multiple different {{parameters}} in string', () => {
            let htmlString = "<html>Clock is {{ key }} how {{ emote }}</html>";
            let expectedString = "<html>Clock is 13:37 how nice</html>";
            let actualString = htmlLoader.replaceParameters(htmlString, { key: "13:37", emote: 'nice' });
            assert.equal(actualString, expectedString);
        });
        it('should replace {{param}} in string and ignore whitespaces', () => {
            let htmlString = "<html>Clock is {{  key    }}</html>";
            let expectedString = "<html>Clock is 13:37</html>";
            let actualString = htmlLoader.replaceParameters(htmlString, { key: "13:37" });
            assert.equal(actualString, expectedString);
        });
        it('should replace {{param}} in string without whitespaces', () => {
            let htmlString = "<html>Clock is {{key}}</html>";
            let expectedString = "<html>Clock is 13:37</html>";
            let actualString = htmlLoader.replaceParameters(htmlString, { key: "13:37" });
            assert.equal(actualString, expectedString);
        });
        it('should not replace {param}', () => {
            let expectedString = "<html>Clock is { key }</html>";
            let actualString = htmlLoader.replaceParameters(expectedString, { key: "13:37" });
            assert.equal(actualString, expectedString);
        });
        it('should not replace {{param}', () => {
            let expectedString = "<html>Clock is {{ key }</html>";
            let actualString = htmlLoader.replaceParameters(expectedString, { key: "13:37" });
            assert.equal(actualString, expectedString);
        });
        it('should not replace {{param}}', () => {
            let htmlString = "<html>Clock is {{ asd }}</html>";
            let expectedString = "<html>Clock is {{ asd }}</html>";
            let actualString = htmlLoader.replaceParameters(htmlString, { key: "13:37" });
            assert.equal(actualString, expectedString);
        });
        it('should not replace {{param}} - Case sensitive', () => {
            let htmlString = "<html>Clock is {{ Key }}</html>";
            let expectedString = "<html>Clock is {{ Key }}</html>";
            let actualString = htmlLoader.replaceParameters(htmlString, { key: "13:37" });
            assert.equal(actualString, expectedString);
        });
    });
    describe('extendHtmlFile()', () => {
        it('should replace {% extends path/to/file %} in string', () => {
            let htmlString = "<html> need more stuff here : {% extends test/file/test.html %}</html>";
            let expectedString = "<html> need more stuff here : <p>extra content</p></html>";
            let actualString = htmlLoader.extendHtmlFile(htmlString, null);
            assert.equal(actualString, expectedString);
        });
        it('should replace multiple {% extends path/to/file %} in string', () => {
            let htmlString = "<html> need more stuff here : {% extends test/file/test.html %} and here: {% extends test/file/test.html %}</html>";
            let expectedString = "<html> need more stuff here : <p>extra content</p> and here: <p>extra content</p></html>";
            let actualString = htmlLoader.extendHtmlFile(htmlString, null);
            assert.equal(actualString, expectedString);
        });
        it('should not throw error if {% extends path/to/file %} does not exist', () => {
            let expectedString = "<html> need more stuff here : { extends test/file/test.html %}</html>";
            let actualString = htmlLoader.extendHtmlFile(expectedString, null);
            assert.equal(actualString, expectedString);
        });
        it('should replace {% extends path/to/file %} with invalid path with empty string', () => {
            let htmlString = "<html> need more stuff here : {% extends not/exists/test.html %} {% extends notAexists-test.html %}</html>";
            let expectedString = "<html> need more stuff here :  </html>";
            let actualString = htmlLoader.extendHtmlFile(htmlString, null);
            assert.equal(actualString, expectedString);
        });
        it('should replace also parameters in extended file', () => {
            let htmlString = "<html> need more stuff here : {% extends test/file/test.1.html %}</html>";
            let expectedString = "<html> need more stuff here : <p>extra content</p> asd</html>";
            let actualString = htmlLoader.extendHtmlFile(htmlString, { extend: "asd" });
            assert.equal(actualString, expectedString);
        });
    });
    describe('combineFiles()', () => {
        beforeEach(function () {
            fs.mkdirSync("test/cache");
        });
        afterEach(function () {
            let paths = fs.readdirSync("test/cache");
            for (let i = 0; i < paths.length; i++) {
                fs.unlinkSync("test/cache/" + paths[i]);
            }
            fs.rmdirSync("test/cache");
        });
        it('should not do anything if {% stylesheet } tag is invalid', () => {
            let expected = '<html> styles { stylesheet output="test/file/test.html" "test/file/test.html" %}</html>';
            let actual = htmlLoader.combineFiles(expected);
            assert.equal(actual, expected);
        });
        it('should not throw error if {% stylesheet %} is missing output argument', () => {
            let htmlString = '<html> styles {% stylesheet outdput= "test/file/test.html" "test/file/test.html" %}</html>';
            htmlLoader.combineFiles(htmlString);
            assert.ok(true);
        });
        it('should not throw error if {% stylesheet %} has invalid output path', () => {
            let htmlString = '<html> styles {% stylesheet output="path/to/file/does/not/exists" "test/file/test.html" "test/file/test.html" %}</html>';
            htmlLoader.combineFiles(htmlString);
            assert.ok(true);
        });
        it('should not throw error if {% stylesheet %} is missing input arguments', () => {
            let htmlString = '<html> styles {% stylesheet output="test/cache/file.html" %}</html>';
            htmlLoader.combineFiles(htmlString);
            assert.ok(true);
        });
        it('should not throw error if {% stylesheet %} has invalid input paths', () => {
            let htmlString = '<html> styles {% stylesheet output="test/cache/file.html" "does/not/exists/file.html" "does/not/exists/test.html" %}</html>';
            htmlLoader.combineFiles(htmlString);
            assert.ok(true);
        });
        it('should remove {% stylesheet output="path/to/file" "path/to/file" "path/to/file" %} in string', function () {
            let htmlString = '<html> styles {% stylesheet output="test/cache/file.html" "test/file/test.html" "test/file/test.html" %}</html>';
            let expectedString = "<html> styles </html>";
            let actualString = htmlLoader.combineFiles(htmlString);
            assert.equal(actualString, expectedString);
        });
        it('should combine files in {% stylesheet %} to output directory', function (done) {
            let outputPath = "test/cache/TESTFILE.css";
            let htmlString = '<html> styles {% stylesheet output="' + outputPath + '" "test/file/test.html" "test/file/test.html" %}</html>';
            htmlLoader.combineFiles(htmlString);
            let file = fs.readFileSync(outputPath, 'utf-8');
            assert.equal(file, '<p>extra content</p><p>extra content</p>');
            done();
        });
        it('should not combine files in {% stylesheet %} to outputFile if it already exists', function (done) {
            let outputPath = "test/cache/TESTFILE.css";
            let htmlString = '<html> styles {% stylesheet output="' + outputPath + '" "test/file/test.html" "test/file/test.html" %}</html>';
            htmlLoader.combineFiles(htmlString);
            htmlLoader.combineFiles(htmlString);
            let file = fs.readFileSync(outputPath, 'utf-8');
            assert.equal(file, '<p>extra content</p><p>extra content</p>');
            done();
        });
    });
    describe('templateIf()', () => {
        it('should render block if strings are equal', () => {
            let htmlString = "<html>{% if \"a\" == \"a\" %}OK{%endif%}</html>";
            let expectedString = "<html>OK</html>";
            let actualString = htmlLoader.TemplateIf(htmlString);
            assert.equal(actualString, expectedString);
        });
        it('should render block if numbers are equal', () => {
            let htmlString = "<html>{% if 2 == 2 %}OK{%endif%}</html>";
            let expectedString = "<html>OK</html>";
            let actualString = htmlLoader.TemplateIf(htmlString);
            assert.equal(actualString, expectedString);
        });
        it('should render block if bool is true', () => {
            let htmlString = "<html>{% if true == true %}OK{%endif%}</html>";
            let expectedString = "<html>OK</html>";
            let actualString = htmlLoader.TemplateIf(htmlString);
            assert.equal(actualString, expectedString);
        });
        it('should render block if let is null', () => {
            let htmlString = "<html>{% if null == null %}OK{%endif%}</html>";
            let expectedString = "<html>OK</html>";
            let actualString = htmlLoader.TemplateIf(htmlString);
            assert.equal(actualString, expectedString);
        });
        it('should NOT render block if strings are not equal', () => {
            let htmlString = "<html>{% if \"a\" == \"b\" %}OK{%endif%}</html>";
            let expectedString = "<html></html>";
            let actualString = htmlLoader.TemplateIf(htmlString);
            assert.equal(actualString, expectedString);
        });
        it('should NOT render block if numbers are not equal', () => {
            let htmlString = "<html>{% if 1 == 2 %}OK{%endif%}</html>";
            let expectedString = "<html></html>";
            let actualString = htmlLoader.TemplateIf(htmlString);
            assert.equal(actualString, expectedString);
        });
        it('should NOT render block if bool is not true', () => {
            let htmlString = "<html>{% if true == false %}OK{%endif%}</html>";
            let expectedString = "<html></html>";
            let actualString = htmlLoader.TemplateIf(htmlString);
            assert.equal(actualString, expectedString);
        });
        it('should NOT render block if let is not null', () => {
            let htmlString = "<html>{% if 1 == null %}OK{%endif%}</html>";
            let expectedString = "<html></html>";
            let actualString = htmlLoader.TemplateIf(htmlString);
            assert.equal(actualString, expectedString);
        });
        it('should render all if blocks that are true', () => {
            let htmlString = "<html>{% if 2 == 2 %}OK{%endif%} - {% if 3 == 3 %}KEK{%endif%}</html>";
            let expectedString = "<html>OK - KEK</html>";
            let actualString = htmlLoader.TemplateIf(htmlString);
            assert.equal(actualString, expectedString);
        });
        it('should render all if blocks that are true', () => {
            let htmlString = "<html>{% if 2 == 2 %}OK{%endif%} 2 {% if true == true %}KEDK{%endif%}</html>";
            let expectedString = "<html>OK 2 KEDK</html>";
            let actualString = htmlLoader.TemplateIf(htmlString);
            assert.equal(actualString, expectedString);
        });
        it('should render all if blocks that are true', () => {
            let htmlString = "<html>{% if 2 == 2 %}OK{%endif%} 1{% if false == true %}KEDK{%endif%}</html>";
            let expectedString = "<html>OK 1</html>";
            let actualString = htmlLoader.TemplateIf(htmlString);
            assert.equal(actualString, expectedString);
        });
        it('should render block even if the if condition is on multiple lines', () => {
            let htmlString = "<html>{% if 2 == 2 %}\n  OK \n {%endif%}</html>";
            let expectedString = "<html>OK</html>";
            let actualString = htmlLoader.TemplateIf(htmlString);
            assert.equal(actualString, expectedString);
        });
    });
});
