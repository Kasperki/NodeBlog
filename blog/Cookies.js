var exports = module.exports = {};
 
/**
 * http://stackoverflow.com/a/3409200
 */
exports.ParseCookies = function (request) 
{
    var cookies = request.headers.cookie;
    var list = {};
     
    cookies && cookies.split(';').forEach(function(cookie) {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });

    return list;
}

/**
 * Set cookies to response
 * @param Response response
 * @param Object[]{string name,string content,Date expires, optional[secure, httponly]} cookies
 */
exports.SetCookies = function (response, cookies) 
{
    var setCookiesArray = [];
    
     for (var i = 0; i < cookies.length; i++) {
        var cookie = "";
        cookie += cookies[i].name + "=" + cookies[i].content + ";";
        cookie += " expires=" + cookies[i].expires + ";";
        
        if(cookies[i].options) {
            if (cookies[i].options.secure)
                cookie += " secure;";
            
            if (cookies[i].options.httponly)
                cookie += " httponly;";
        }
        
        console.log(cookie);
        setCookiesArray.push(cookie);
     }
     
     response.setHeader('Set-Cookie', setCookiesArray);
}
        

    

 