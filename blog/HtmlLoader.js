var fs = require('fs');

module.exports = function (response, file, parameters) {
    fs.readFile(file, "utf-8", function (err, html) {
        if (err) {
            throw err; 
        }       

        for (var key in parameters) {
            var regex = new RegExp("{{\\s*" + key + "\\s*}}", "g");
            html = html.replace(regex, parameters[key]);
        }
        
        response.writeHeader(200, {"Content-Type": "text/html"});  
        response.write(html);  
        response.end();  
    });
}

