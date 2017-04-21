export abstract class BaseController
{
    public requestData: RequestData;
    protected abstract routes: Route[];

    public get GetRoutes(): Route[]
    {
        return this.routes;
    }

    public Response(data: string)
    {
        this.requestData.response.writeHead(200, { 'Content-Type': 'text/html' });
        this.requestData.response.end(data);
    }

    public JSONResponse(data: any)
    {
        this.requestData.response.writeHead(200, { 'Content-Type': 'application/json' });
        this.requestData.response.end(JSON.stringify(data));
    }
}

export class Route
{
    public route: string;
    public authenticated: boolean;
    public action: () => void;

    constructor(route: string, action: () => void, authenticated: boolean = false)
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