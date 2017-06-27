import * as http from "http";
import { IDictionary } from "./Infastructure/Dictionary";

export class Cookie
{
    name: string;
    content: string;
    expires: Date;
    options: CookieOptions;

    constructor(name: string, content: string, expires: Date, options?: CookieOptions)
    {
        this.name = name;
        this.content = content;
        this.expires = expires;

        if (options == null) {
            this.options = new CookieOptions(true, true);
        }
        else {
            this.options = options;
        }
    }
}

class CookieOptions
{
    secure: boolean;
    httponly: boolean;

    constructor(secure: boolean, httponly: boolean)
    {
        this.secure = secure;
        this.httponly = httponly;
    }
}

/**
* http://stackoverflow.com/a/3409200
*/
export function ParseCookies(request: http.ServerRequest) : IDictionary<string>
{
    var cookies = request.headers.cookie;
    var list: IDictionary<string> = {};

    cookies && cookies.split(';').forEach(function (cookie: string) {
        var parts = cookie.split('=');
        var cookieKey = parts.shift();

        if (cookieKey)
        {
            list[cookieKey.trim()] = decodeURI(parts.join('='));
        }
    });

    return list;
}

/**
* Set cookies to response
* @param Response response
* @param Object[]{string name,string content,Date expires, optional[secure, httponly]} cookies
*/
export function SetCookies(response: http.ServerResponse, cookies: Cookie[])
{
    var setCookiesArray = [];

    for (var i = 0; i < cookies.length; i++)
    {
        var cookie = "";
        cookie += cookies[i].name + "=" + cookies[i].content + ";";
        cookie += " expires=" + cookies[i].expires + ";";

        if (cookies[i].options)
        {
            if (cookies[i].options.secure) {
                cookie += " secure;";
            }

            if (cookies[i].options.httponly) {
                cookie += " httponly;";
            }
        }

        console.log(cookie);
        setCookiesArray.push(cookie);
    }

    response.setHeader('Set-Cookie', setCookiesArray);
}
    

 