class configd
{
    __base = __dirname + "/";
    __views = __dirname + "/";

    env = process.env.NODE_ENV || "dev";

    httpPort = process.env.HTTP_PORT || 666;
    httpsPort = process.env.HTTPS_PORT || 443;

    database: Database =
    {
        host: "mongodb://localhost:27017/",
        schema: "blog",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "root"
    };

    cache: Cache =
    {
        path: __dirname + "/cache"
    };
    log: Log =
    {
        path: __dirname + "/logs",
        access: __dirname + "/logs/access-log.txt",
        error: __dirname + "/logs/error-log.txt",
        level: 6,
        print: true,
        write: true
    };
    security: Security =
    {
        rechaptasecret: process.env.RECAPTCHASECRET || "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe"
    };
    web: Web =
    {
        publicDirectories: [
            { route: "/web", "redirect": __dirname + "/wwwroot" },
            { route: "/wwwroot", "redirect": __dirname + "/wwwroot" },
            { route: "/cache", "redirect": this.cache.path }
        ]
    };
    cert: Cert =
    {
        server_key: process.env.CERT_SERVER_KEY || __dirname + "/../test/cert/server-key.pem",
        server_crt: process.env.CERT_SERVER_CRT || __dirname + "/../test/cert/server-crt.pem",
        ca_crt: process.env.CERT_CA_CRT || __dirname + "/../test/cert/ca-crt.pem"
    };

    test: any;
}

interface Database
{
    host: string;
    schema: string;
    user: string;
    password: string;
}

interface Cache
{
    path: string;
}

interface Log
{
    path: string;
    access: string;
    error: string;
    level: number; //log.levels.ALL
    print: boolean;
    write: boolean;
}

interface Security
{
    rechaptasecret: string;
}

interface Cert
{
    server_key: string;
    server_crt: string;
    ca_crt: string;
}

interface Web
{
    publicDirectories: any;
}

const config = new configd();

//Test
if (process.env.NODE_ENV == "test")
{
    config.__base = "C:\\Users\\kasper.kiiskinen\\NodeBlog\\";
    config.__views = "C:\\Users\\kasper.kiiskinen\\NodeBlog\\";
    config.cache.path = "C:\\Users\\kasper.kiiskinen\\NodeBlog\\";

    config.database =
    {
        host: "mongodb://localhost:27017/",
        schema: "blogTestdb",
        user: "root",
        password: "root"
    }
};

export = config;