const config = {};

config.database = {};
config.log = {};
config.security = {};
config.web = {};

config.log.levels = 
{
    DEBUG : 1,
    WARNING : 2,
    ERROR : 4,
    ALL : 7
}

//Dev
config.env = process.env.NODE_ENV || "dev";

config.database.host = "mongodb://localhost:27017/";
config.database.schema = "blog";
config.database.user = process.env.DB_USER || "root";
config.database.password = process.env.DB_PASSWORD || "root";

config.log.access = __dirname + "/logs/access-log.txt";
config.log.error = __dirname + "/logs/error-log.txt";
config.log.level = config.log.levels.ALL;
config.log.print = true;
config.log.write = true;

config.web.publicDirectories = ["/web", "/cache"];
config.security.rechaptasecret = process.env.RECAPTCHASECRET;

//Unique keys
 //rechaptakey: 6LcM8R8TAAAAAIn5JrS2FxkRPj_XTTmSv6y0ng6a
 //disqus: kiiskinen.disqus.com/embed.js
 
//Test
config.test = { 
    database : { 
        host : "mongodb://localhost:27017/", 
        schema : "blogTestdb",
        user : "root",
        password : "root"
    }
};

module.exports = config;


