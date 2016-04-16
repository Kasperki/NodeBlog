var fs = require('fs');

var exports = module.exports = {};

/**
 *  Loads html file with twig like functionality
 *  @param Response response
 *  @param String Html.file
 *  @param array parameters [key:value]
 */
var load = function (response, file, parameters) {
    
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
 * Usage: {{ valueToBeReplaced }}
 *  @param String html
 *  @param array parameters [key:value]
 */
var replaceParameters = function (html, parameters) 
{
    for (var key in parameters) {
        var regex = new RegExp("{{\\s*" + key + "\\s*}}", "g");
        html = html.replace(regex, parameters[key]);
    }
    
    return html;
}

/**
 * Extend html file
 * Usage: {% extend path/to/file.html %}
 * @param String html
 */
var extendHtmlFile = function (html)
{
    var regex = new RegExp("{%\\s*extends\\s*[A-Za-z0-9\"/().]*\\s*%}", "g");
    var regexMatch = html.match(regex); 

    if (regexMatch == null)
        return html;

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

module.exports = {
    load : load,
    replaceParameters : replaceParameters, 
    extendHtmlFile : extendHtmlFile
}