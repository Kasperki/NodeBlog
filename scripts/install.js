var config = require('../app/config.js');
var fs = require('fs');

//Create folders for cache and logs
try {
    fs.accessSync(config.cache.path, fs.F_OK)

	//clear cache if cache folder already exists
    var files = fs.readdirSync(config.cache.path);
	
	for (var i = 0; i < files.length; i++) 
	{
        fs.unlinkSync(config.cache.path + "/" + files[i]);
	}
}
catch (e) {
    fs.mkdirSync(config.cache.path);
}

try {
    fs.accessSync(config.log.path, fs.F_OK)
}
catch (e){
    fs.mkdirSync(config.log.path);
}