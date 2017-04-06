export abstract class BaseController
{
    protected abstract routes: Route[];

    public get GetRoutes(): Route[]
    {
        return this.routes;
    }
}

export class Route
{
    route: string;
    authenticated: boolean;
    public action: (requestData: RequestData) => void;

    constructor(route: string, action: (requestData: RequestData) => void, authenticated: boolean = false)
    {
        this.route = route;
        this.authenticated = authenticated;
        this.action = action;
    }
}

import * as http from "http";

export class RequestData
{
    request: http.ServerRequest;
    response: http.ServerResponse;
    data: string;
    queryParameters: any;
    cookies: any;
    keys: any;
    parameters: any;

    constructor(request: http.ServerRequest, response: http.ServerResponse)
    {
        this.response = response;
        this.request = request;
    }
}