var config = {};

config.database = {};
config.web = {};

//Dev
config.database.host = "mongodb://localhost:27017/";
config.database.schema = "test";
config.database.user = process.env.DB_USER || "root";
config.database.password = process.env.DB_PASSWORD || "root";
config.web.port = process.env.WEB_PORT || 8081;

module.exports = config;


