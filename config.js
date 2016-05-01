const config = {};

config.database = {};
config.log = {};
config.web = {};

config.log.levels = 
{
    DEBUG : 1,
    WARNING : 2,
    ERROR : 4,
    ALL : 7
}

//Dev
config.database.host = "mongodb://localhost:27017/";
config.database.schema = "test";
config.database.user = process.env.DB_USER || "root";
config.database.password = process.env.DB_PASSWORD || "root";

config.log.access = __dirname + "/logs/access-log.txt";
config.log.error = __dirname + "/logs/error-log.txt";
config.log.level = config.log.levels.ALL;
config.log.print = true;
config.log.write = true;

config.web.port = process.env.WEB_PORT || 8081;
config.web.publicDirectories = ["/web", "/cache"];

//Test
config.test = { 
    database : { 
        host : "mongodb://localhost:27017/", 
        schema : "testdb"
    }
};

module.exports = config;


