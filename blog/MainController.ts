import { BaseController } from "./BaseController";
import { Route } from "./BaseController";

var loadHtml = require('./HtmlLoader.js');

export class MainController extends BaseController
{
    main = (): void =>
    {
        loadHtml.load(this.requestData, '/views/index.html', {});
    }

    routes: Route[] = [
        new Route("/", this.main)
    ];
}