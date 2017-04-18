export abstract class BaseController
{
    //TODO CACHE HERE REQUEST DATA SO WE DON*T HAVE TO PASS IT TO EVERY CONTROLLER ROUTE, THX!
    protected abstract routes: Route[];

    public get GetRoutes(): Route[]
    {
        return this.routes;
    }

    public JSONResponse(requestInfo: RequestData, data: any)
    {
        requestInfo.response.writeHead(200, { 'Content-Type': 'application/json' });
        requestInfo.response.end(JSON.stringify(data));
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