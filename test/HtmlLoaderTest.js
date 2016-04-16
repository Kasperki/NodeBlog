const assert = require('assert');
htmlLoader = require('../blog/HtmlLoader.js');

describe('HtmlLoader', function () {
    
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
    });
});