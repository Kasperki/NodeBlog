import { BaseController } from "./BaseController";
import { Route } from "./BaseController";
import { RequestData } from "./BaseController";

var loadHtml = require('./HtmlLoader.js');
var AuthenticationService = require('../blog/UserBundle/AuthenticationService.js');

export class MainController extends BaseController
{
    main = (): void =>
    {
        loadHtml.load(this.requestData, '/views/index.html', {});
    }

    validateToken = (): void =>
    {
        this.requestData.response.writeHead(200, { 'Content-Type': 'application/json' });

        if (this.requestData.request.connection.remoteAddress.startsWith("::ffff:127.0.0.1"))
        {
            var session = AuthenticationService.IsTokenValid(this.requestData.queryParameters["sessionId"], this.requestData.queryParameters["authToken"]);
        }

        var jsonResponse = "NotValid";

        if (session !== null) {
            console.log(session);
            jsonResponse = session;
        }

        this.JSONResponse(jsonResponse);
    };

    routes: Route[] = [
        new Route("/", this.main),
        new Route("/validateToken", this.validateToken)
    ];
}