/**
 * Unravels string from random string.
 * @param string final
 * @param string object
 */
function unravelText(final, object) {
    
    var i = 0;
    
    var interval = setInterval(function(){ i++; }, 95);
    var interval2 = setInterval(function(){ iterate(final, i); }, 75);
        
    function iterate(final ,index) {
        
        var final = final;
        var random = "田由甲申甴电甶男甸甹町画甼甽甾甿畀畁畂畃畄畅畆畇畈畉畊畋界畍畎畏畐畑";
        var cur = "";

        for(var i = 0; i < index; i++) {
            cur += final[i];
        }

        for(var i = index; i < final.length; i++) {
            cur += random.charAt(Math.floor(Math.random() * random.length));
        }

        if (index >= final.length) {   
            clearInterval(interval);
            clearInterval(interval2);
        }

        $(object).text(cur);
    }
}