import { IDictionary } from "./Infastructure/Dictionary";

export class RouteData
{
    public url: urlModule.Url;
    public keys: IDictionary<string>;
    public queryParameters: any;

    constructor(url: urlModule.Url)
    {
        this.url = url;
        this.queryParameters = url.query;
        this.keys = {};
    }
}

import * as urlModule from "url";

export function parseRoute(controllerRoute: string, url: urlModule.Url): RouteData | null
{
    let routeData = new RouteData(url);

    let route = String(routeData.url.pathname);
    let regex = new RegExp("(/[A-Za-z0-9-._~:?#\\[\\]@!$&'()*%+,;={}]*)", "g");
    let regexMatchCtrlRoute = controllerRoute.match(regex);
    let regexMatchRoute = route.match(regex);

    if (regexMatchCtrlRoute == null || regexMatchRoute == null || regexMatchCtrlRoute.length != regexMatchRoute.length)
    {
        return null;
    }

    for (var i = 0; i < regexMatchCtrlRoute.length; i++)
    {
        if (regexMatchCtrlRoute[i].charAt(1) === "{" && regexMatchCtrlRoute[i].charAt(regexMatchCtrlRoute[i].length - 1) === "}")
        {
            var key = regexMatchCtrlRoute[i].substr(2, regexMatchCtrlRoute[i].length - 3).trim();
            routeData.keys[key] = decodeURI(regexMatchRoute[i].substr(1));
            continue;
        }
        else if (regexMatchCtrlRoute[i] === regexMatchRoute[i])
        {
            continue;
        }
        else
        {
            return null;
        }
    }

    return routeData;
}