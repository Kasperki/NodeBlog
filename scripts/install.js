var fs = require('fs');


//Create folders for cache and logs
try {
	fs.accessSync("blog/cache", fs.F_OK)

	//clear cache if cache folder already exists
	var files = fs.readdirSync("blog/cache");
	
	for (var i = 0; i < files.length; i++) 
	{
		fs.unlinkSync("blog/cache/" + files[i]);
	}
}
catch (e){
	fs.mkdirSync("blog/cache");
}

try {
	fs.accessSync("logs", fs.F_OK)
}
catch (e){
	fs.mkdirSync("logs");
}