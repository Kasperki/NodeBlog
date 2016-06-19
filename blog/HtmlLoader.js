var fs = require('fs');
var config = require('../config.js');
var Logger = require('./Logger.js');

/**
 *  Loads html file with twig like functionality
 *  @param RequestInfo requestInfo
 *  @param String Html.file
 *  @param array parameters (key:value)
 *  @param int code = 200 [Optional]
 *  @param function callback(error, boolean) [Optional]
 */
var load = function (requestInfo, file, parameters, code, callback) 
{
    if (typeof code === 'undefined' || !code) //TODO NodeJS 6.0 adds default parameters.
        code = 200;
        
    fs.readFile(file, "utf-8", function (err, html) {
        if (err) {
            throw err; 
        }   
        
        if (parameters != null) {
            for (var attrname in requestInfo.parameters) { parameters[attrname] = requestInfo.parameters[attrname]; }
        }
        else {
            parameters = requestInfo.parameters;
        }

        html = replaceParameters(html, parameters);    
        html = extendHtmlFile(html, parameters);
        html = combineFiles(html);
                
        requestInfo.response.writeHead(code, {"Content-Type": "text/html"});  
        requestInfo.response.write(html);  
        requestInfo.response.end();
        
        if (typeof callback === "function") {
            callback(null, true);
        }
    });
}

/**
 * Replace string in html file
 * Usage: {{ valueToBeReplaced }}
 *  @param string html
 *  @param array parameters [key:value]
 *  return string
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
 * @param string html
 * @param array parameters [key:value]
 * return string
 */
var extendHtmlFile = function (html, parameters)
{
    var regex = new RegExp("{%\\s*extends\\s*[A-Za-z0-9\"/().-]*\\s*%}", "g");
    var regexMatch = html.match(regex); 

    if (regexMatch == null)
        return html;

    for (var i = 0; i < regexMatch.length; i++) {
        
        var startIndex = regexMatch[i].search("extends") + 7;
        var filePath = regexMatch[i].substr(startIndex, regexMatch[i].length - 2 - startIndex).trim(); 
 
        try {
            var includingFile = fs.readFileSync(filePath, "utf-8");
            includingFile = replaceParameters(includingFile, parameters);
            html = html.replace(new RegExp(regexMatch[i], "g"), includingFile);
        }
        catch (e) {
            Logger.Debug(config.log.error, "No such file:" + filePath + " " +e);
            html = html.replace(new RegExp(regexMatch[i]), "");
        }
    }
    
    return html;
}

/**
 * Combines files together
 * Usage: {% stylesheet output="path/to/outputFile.css" "path/to/inputFileX.html" "path/to/inputFileY.html" "path/to/inputFileZ.html"... %}
 * @param String html
 * return string
 */
var combineFiles = function (html) 
{
    var regex = new RegExp("{%\\s*stylesheet\\s*[A-Za-z0-9\"/().=-\\s*]*\\s*%}", "g");
    var regexMatch = html.match(regex); 

    if (regexMatch == null)
        return html;
    
    for (var i = 0; i < regexMatch.length; i++) {
           
        var regexOutput = new RegExp("output=\"(.*?)\"");
        var output = regexMatch[i].match(regexOutput);
               
        //Check does the string have output="" argument
        if (output != null && output.length > 0) {
            var outputFile = output[1];
        }
        else {
            html = html.replace(new RegExp(regexMatch[i]), "");
            Logger.Debug(config.log.error, "combineFiles() :: Missing output argument");
            continue;
        }
        
        //Check if file exists. Always combine in dev build.
        if (config.env != "dev") {
            try {
                fs.accessSync(outputFile, fs.F_OK);
                html = html.replace(new RegExp(regexMatch[i]), "");
                continue; //File already in cache, skip combining.
            } catch (e) {
                Logger.Debug(config.log.error, "combineFiles() :: File " + outputFile + " not found... combining...");
            }
        } else {
            fs.unlinkSync(outputFile);
        }
        
        var regexFiles = new RegExp('\"(.*?)\"', "g");
        var inputFiles = [];
      
        var match; var first = true;
        while ( ( match = regexFiles.exec(regexMatch[i]) ) != null )
        {
            if (!first) {
                inputFiles.push(match[1]);
            }
                
            first = false;
        }
          
        for (var j = 0; j < inputFiles.length; j++) {        
            try {
                var data = fs.readFileSync(inputFiles[j], "utf-8");
                fs.writeFileSync(outputFile, data,  { encoding: "utf-8", flag: "a"});
            }
            catch (e) {
                Logger.Debug(config.log.error, "combineFiles() :: No such file:" + inputFiles[j] + " " + e);
                continue;
            }
        }
        
        html = html.replace(new RegExp(regexMatch[i]), "");
    }
    
    return html;
}

module.exports = {
    load : load,
    replaceParameters : replaceParameters, 
    extendHtmlFile : extendHtmlFile,
    combineFiles : combineFiles
}