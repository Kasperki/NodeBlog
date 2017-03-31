var loadHtml = require('./HtmlLoader.js');

/**
 * Loads error page
 * @param Response response
 * @param int errorCode
 * @param string message
*/
module.exports = function (response, errorCode, message) 
{
    loadHtml.load({response:response}, "./views/error.html", {errorCode:errorCode, message:message}, errorCode);
};
