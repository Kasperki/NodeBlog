const config = {};

config.database = {};
config.log = {};
config.web = {};

//Dev
config.database.host = "mongodb://localhost:27017/";
config.database.schema = "test";
config.database.user = process.env.DB_USER || "root";
config.database.password = process.env.DB_PASSWORD || "root";

config.log.access = "logs/access-log.txt";
config.log.error = "logs/error-log.txt";
config.log.print = true;
config.log.write = true;

config.web.port = process.env.WEB_PORT || 8081;
config.web.publicDirectories = ["/web"];

//Test
config.test = { 
    database : { 
        host : "mongodb://localhost:27017/", 
        schema : "testdb"
    }
};

module.exports = config;


