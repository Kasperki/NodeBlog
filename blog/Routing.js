var exports = module.exports = {};

exports.parseRoute = function (controllerRoute, route) 
{
    var keys = {};
    
    var regex = new RegExp("(/[A-Za-z0-9-._~:?#\\[\\]@!$&'()*%+,;={}]*)", "g");
    var regexMatchCtrlRoute = controllerRoute.match(regex); 
    var regexMatchRoute = route.match(regex);

    if (regexMatchCtrlRoute.length != regexMatchRoute.length)
        return false;

    for (var i = 0; i < regexMatchCtrlRoute.length; i++) 
    {
        if (regexMatchCtrlRoute[i].charAt(1) === "{" && regexMatchCtrlRoute[i].charAt(regexMatchCtrlRoute[i].length - 1) === "}")
        {
            var key = regexMatchCtrlRoute[i].substr(2, regexMatchCtrlRoute[i].length - 3).trim();
            keys[key] = decodeURI(regexMatchRoute[i].substr(1));
            continue;
        } else if (regexMatchCtrlRoute[i] === regexMatchRoute[i]) {
            continue;
        }
        else {
            return false;
        }
    }
    
    return keys;
}