# NodeBlog [![Build Status](https://travis-ci.org/Kasperki/NodeBlog.svg?branch=master)](https://travis-ci.org/Kasperki/NodeBlog)
My blog made with NodeJS.
This project is trying to use limited amount of NPM packets.
Why? Just 4 fun and learning.
This project is like a small MVC framework.

For disclamer this project is propably not using all of those best practices and has countless antipatterns.

# Installation

* Prequistes
    * Node
    * MongoDB
    * Git

* Installation
    * Git clone https://github.com/Kasperki/NodeBlog
    * npm install
    * Set env variables && node Server.js


## Setup mondodb & create new schema user

Mongo 2.4
```
use blogTestdb -- for testing env
db.addUser( { user: "root", pwd: "root", roles: [ "readWrite" ] } )

use blog
db.addUser( { user: "DATABASEUSER", pwd: "PASSWORD", roles: [ "readWrite" ] } )
```

Mongo 2.8
```
use blogTestdb -- for testing env
db.createUser({user: "root", pwd: "root", roles: [ { role: "readWrite", db: "blog" }]})

use blog
db.createUser({user: "DATABASEUSER", pwd: "PASSWORD", roles: [ { role: "readWrite", db: "blog" }]})
```

Run mongo:
```
 sudo mongod --fork --bind_ip 127.0.0.1 --dbpath data --auth --logpath /home/mongo/mongod.log
```

## Get Certification

Install Certbot: https://certbot.eff.org/#debianjessie-other

```
certbot certonly --standalone -d yourdomain.xxx
cert will be saved to path: /etc/letsencrypt/live/yourdomain.xxx
```

To renew the certificate:
```
certbot renew
```


## Running the blog

I'm running a bash script called run.sh that sets the environment variable values.

And I'm using forever to start the server if it crashes.
* npm install forever -g

```
#!/bin/sh
export DB_USER=""
export DB_PASSWORD=""
export NODE_ENV="prod"
export RECAPTCHASECRET=""
export CERT_SERVER_KEY="/etc/letsencrypt/live/yourdomain.xxx/privkey.pem"
export CERT_SERVER_CRT="/etc/letsencrypt/live/yourdomain.xxx/fullchain.pem"
export CERT_CA_CRT="/etc/letsencrypt/live/yourdomain.xxx/chain.pem"
npm install
forever start Server.js
```

Start the nodeJS application with production configs.
```
sudo -E ./run.sh
```


#  Documentation

## Tests

You must have mongod running on background.
I should try to mock this.

Windows:
```
//Run from root folder where is package.json
set NODE_ENV=test && mocha
```

## Configs

Some of the configs can be set with environment variables, like current environment, secret keys and database user and password.
If not set it will use default value that is used in development environment.

You can configure log output, what directories are being served with static file serving etc.

```
config.env = process.env.NODE_ENV || "dev";

config.httpPort = process.env.HTTP_PORT || 80;
config.httpsPort = process.env.HTTPS_PORT || 443;

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
```

## Controllers

Controllers will control what kind of content routes load and they will check do the user has right access to access the content.

```
//Controller method for single route
function (requestInfo)
{        
    requestInfo.response.end();
}

//The parameter controllers have
requestInfo {
    response:   //Response from our server to client
    request:    //Client request to our server
    data:       //Data the client sent to our server
    queryParameters: //Url query parameters
    cookies:    // User cookies
    keys: keys, // Wildcard route keys
    
    //These parameters are sent to the Templating "engine" and can be used in views.
    parameters: { 
        loggedIn: //Is user logged in 
        userName: //user name for Authenticated user
        "NODE.ENV" : //Current environment
        }
    }
```

### Routing

Example
```
{ route: {"/blog/{title}/{page}": getTitle }}
```

So when user goes to route: https:/yourwebsite.com/blog/oat/2?id=guid123-123 function getTitle(requestInfo) is called.

In requestInfo we will get:
 * response that we need to populate  
 * request from client
 * data (string), if the client sent any data.
 * object keys: {title: oat, page: 2} 
 * queryParameters { id: guid123-123 }


## Templating
require('./HtmlLoader.js');

All html pages should be loaded with .load()
It add's some functionality to normal .html files. like {% if %}, {% replace %} and {% extending html files %}.

load function parameters:
```
/**
 *  Loads html file with twig like functionality
 *  @param RequestInfo requestInfo
 *  @param String .html filepath
 *  @param array parameters (key:value)
 *  @param int statusCode = 200 [Optional]
 *  @param function callback(error, boolean) [Optional]
 */
```
### Replace

### Extend

### If blocks

### Combining & Minifying tag

{% stylesheet output="" %} tags fill combine and minify files to output="main.css" field.
The minified file will be called main.min.css.

Example
```
{% stylesheet output="cache/main.css"
    "web/css/prettify.css"     
    "web/css/animate.min.css"    
    "web/font-awesome/css/font-awesome.min.css"    
    "web/css/bootstrap.min.css"
    "web/css/creative.css"    
    "web/css/main.css"     
%}
```



## Static File Serving


## Logging


## Authentication
