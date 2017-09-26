/**
 * Unravels string from random string.
 * @param string final
 * @param string object
 */
function unravelText(final, object, speed) {
    if (speed === void 0) { speed = 95; }
    var i = 0;
    var interval = setInterval(function () { i++; }, speed);
    var interval2 = setInterval(function () { iterate(final, i); }, speed - 25);
    function iterate(final, index) {
        var final = final;
        var random = "10";
        var cur = "";
        for (var i = 0; i < index; i++) {
            cur += final[i];
        }
        for (var i = index; i < final.length; i++) {
            cur += random.charAt(Math.floor(Math.random() * random.length));
        }
        if (index >= final.length) {
            clearInterval(interval);
            clearInterval(interval2);
        }
        $(object).text(cur);
    }
}
