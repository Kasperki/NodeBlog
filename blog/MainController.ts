import { BaseController } from "./BaseController";
import { Route } from "./BaseController";
import { RequestData } from "./BaseController";

var loadHtml = require('./HtmlLoader.js');
var AuthenticationService = require('../blog/UserBundle/AuthenticationService.js');

export class MainController extends BaseController
{
    routes: Route[] = [
        new Route("/", this.main),
        new Route("/validateToken", this.validateToken)
    ];

    main (requestInfo: RequestData): void
    {
        loadHtml.load(requestInfo, '/views/index.html', {});
    }

    validateToken(requestInfo: RequestData): void
    {
        requestInfo.response.writeHead(200, { 'Content-Type': 'application/json' });

        if (requestInfo.request.connection.remoteAddress.startsWith("::ffff:127.0.0.1"))
        {
            var session = AuthenticationService.IsTokenValid(requestInfo.queryParameters["sessionId"], requestInfo.queryParameters["authToken"]);
        }

        var jsonResponse = "NotValid";

        if (session !== null) {
            console.log(session);
            jsonResponse = JSON.stringify(session);
        }

        requestInfo.response.end(jsonResponse); //TODO CALL CONTROLLER ACTION JSON RESPONSE? WE SHOULD NOT NEVER SET HEADERS ON CONTROLLER!
    };
}