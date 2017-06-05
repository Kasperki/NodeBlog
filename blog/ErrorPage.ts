import { RequestData } from "./BaseController";
var loadHtml = require('./HtmlLoader.js');

/**
 * Loads error page
 * @param Response response
 * @param int errorCode
 * @param string message
*/
export function ThrowErrorPage(requestData: RequestData, errorCode: number, message: string) 
{
    loadHtml.load(requestData, "./views/error.html", {errorCode: errorCode, message:message}, errorCode);
};
