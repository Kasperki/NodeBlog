var fs = require('fs');
var ErrorPage = require('./ErrorPage.js');

module.exports = function (response, route) {
   if (route.substring(0,4) === "/web") {
        var dirPath = __dirname + route;
        var status;

        try {
            status = fs.lstatSync(dirPath);
        }
        catch (e) {
            console.log(e);
            ErrorPage(response, "Page not found:" + route);
            return;
        }

        if (status.isDirectory())
        {
            var paths = fs.readdirSync(dirPath);

            var generatedHtml = "<html>";
            generatedHtml += "<a href=\"" + route.substring(0,route.lastIndexOf("/")) + "\">..</a><br>";

            for (i = 0; i < paths.length; i++) {
                generatedHtml += "<a href=\"" + route + "/" + paths[i] + "\">" + paths[i] + "</a><br>";
            }

            generatedHtml += "</html>";

            response.writeHead(200, {'Content-Type': 'text/html'});
            response.write(generatedHtml); 
            response.end();
        }
        else if(status.isFile()) {
            try {
                var buf = fs.readFileSync(dirPath, "utf8");
                response.writeHead(200, {'Content-Type': 'text/plain'});
                response.write(buf);  
                response.end();
            }
            catch (e) {
                console.log(e);
            }
        }
    }       
};