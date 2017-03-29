const config = {};

config.database = {};
config.cache = {};
config.log = {};
config.security = {};
config.web = {};
config.cert = {};

config.log.levels = 
{
    DEBUG : 1,
    WARNING : 2,
    ERROR : 4,
    ALL : 7
}

//Dev
config.env = process.env.NODE_ENV || "dev";

config.httpPort = process.env.HTTP_PORT || 666;
config.httpsPort = process.env.HTTPS_PORT || 443;

config.__base = __dirname + "/blog/";

config.database.host = "mongodb://localhost:27017/";
config.database.schema = "blog";
config.database.user = process.env.DB_USER || "root";
config.database.password = process.env.DB_PASSWORD || "root";

config.log.path = __dirname + "/logs";
config.log.access = __dirname + "/logs/access-log.txt";
config.log.error = __dirname + "/logs/error-log.txt";
config.log.level = config.log.levels.ALL;
config.log.print = true;
config.log.write = true;

config.cache.path = __dirname + "/cache";
config.web.publicDirectories = [{ route: "/web" }, { route: "/cache", "redirect": config.cache.path }];
config.security.rechaptasecret = process.env.RECAPTCHASECRET;

config.cert.server_key = process.env.CERT_SERVER_KEY || __dirname + "/../test/cert/server-key.pem";
config.cert.server_crt = process.env.CERT_SERVER_CRT || __dirname + "/../test/cert/server-crt.pem";
config.cert.ca_crt = process.env.CERT_CA_CRT || __dirname + "/../test/cert/ca-crt.pem";

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


