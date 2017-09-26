export abstract class BaseController
{
    public requestData: RequestData;
    protected abstract routes: Route[];

    public get GetRoutes(): Route[]
    {
        return this.routes;
    }

    public Response(data: string): void
    {
        this.requestData.response.writeHead(200, { 'Content-Type': 'text/html' });
        this.requestData.response.end(data);
    }

    public JSONResponse(data: any): void
    {
        this.requestData.response.writeHead(200, { 'Content-Type': 'application/json' });
        this.requestData.response.end(JSON.stringify(data));
    }

    public BadResponse(message: string): void
    {
        this.requestData.response.writeHead(400, { 'Content-Type': 'text/plain' });
        this.requestData.response.end(message);
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
import * as routing from "./Routing";

export class RequestData
{
    request: http.ServerRequest;
    response: http.ServerResponse;
    routeData: routing.RouteData;
    data: string;
    cookies: any;
    parameters: any;

    constructor(request: http.ServerRequest, response: http.ServerResponse)
    {
        this.response = response;
        this.request = request;
    }
}