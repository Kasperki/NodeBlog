import { BaseController } from "./BaseController";
import { Route } from "./BaseController";
import * as loadHtml from "./HtmlLoader";

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