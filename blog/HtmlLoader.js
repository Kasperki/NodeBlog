var fs = require('fs');

module.exports = function (response, file, parameters) {
    
  fs.readFile(file, "utf-8", function (err, html) {
    if (err) {
        throw err; 
    }   
        html = replaceParameters(html, parameters);    
        html = extendHtmlFile(html);
        
        response.writeHeader(200, {"Content-Type": "text/html"});  
        response.write(html);  
        response.end();  
    });
}

/**
 * Replace string in html file
 * {{ valueToBeReplaced }}
 */
function replaceParameters(html, parameters) 
{
    for (var key in parameters) {
        var regex = new RegExp("{{\\s*" + key + "\\s*}}", "g");
        html = html.replace(regex, parameters[key]);
    }
    
    return html;
}

/**
 * Extend html file
 * {% extend path/to/file.html %}
 */
function extendHtmlFile(html)
{
    var regex = new RegExp("{%\\s*extends\\s*[A-Za-z0-9\"/().]*\\s*%}", "g");
    var regexMatch = html.match(regex); 

    for (var i = 0; i < regexMatch.length; i++) {
        
        var startIndex = regexMatch[i].search("extends") + 7;
        var filePath = regexMatch[i].substr(startIndex, regexMatch[i].length - 2 - startIndex).trim(); 
 
        try {
            var includingFile = fs.readFileSync(filePath, "utf-8");
            html = html.replace(new RegExp(regexMatch[i], "g"), includingFile);
        }
        catch (e) {
            console.log("No such file:" + filePath);
            html = html.replace(new RegExp(regexMatch[i], "g"), "");
        }
    }
    
    return html;
}