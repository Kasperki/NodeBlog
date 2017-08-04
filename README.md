# NodeBlog [![Build Status](https://travis-ci.org/Kasperki/NodeBlog.svg?branch=master)](https://travis-ci.org/Kasperki/NodeBlog) [![NSP Status](https://nodesecurity.io/orgs/kasper/projects/dd7a200b-0aa5-4f80-bfa7-1ef008879492/badge)](https://nodesecurity.io/orgs/kasper/projects/dd7a200b-0aa5-4f80-bfa7-1ef008879492)

This project is like a small MVC framework and top of that I have built my blog.
The project trying to use limited amount of NPM packets. Why? Just 4 fun and learning.

For disclamer this project is propably not using all of the best practices and has countless antipatterns.

# Installation

* Prequistes
    * Typescript 2.3.X
    * Node 7.XX
    * MongoDB
    * Git

* Installation
    * Git clone https://github.com/Kasperki/NodeBlog
    * npm install
    * Set env variables && node Server.js


## Building with visual studio 2017

You will need to install Typescript 2.3.X SDK

[UPDATE: Typescript in Visual Studio 2017](https://github.com/Microsoft/TypeScript/wiki/Updating-TypeScript-in-Visual-Studio-2017)

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

Run from root folder where is package.json
You must have mongod running on background.
I should try to mock this.

Windows:
```
//Commandline
set "NODE_ENV=test" & mocha

//Powershell
$env:NODE_ENV = "test"; mocha
```

## Configs

With configs user can easily change the behaviour of the components and project without needing to change the application code.
Configs can be found from the *config.js* file which is located in the root of the project.

Some of the configs can be set with environment variables.
If environment variable is not found then that config will use development environment default value.

Example of the config file
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

Controllers will define routes to the application and control what kind of content the routes load. 
They can also define are the routes protected.

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

Replaces tag with object passed in requestInfo parameters.

Example: { key1: <p>Adds this element to key1</p> }
```
<div>{{ key1 }}</div>
```

Actual response: 
```
<div><p>Adds this element to key1</p></div>
```

### Extend

Extends .html file with another html file.

Example 
```
{% extends views/layout.html %}
```

will be replaced with content in layout.html file.

### If blocks

If block only renders elements inside the if block if condition is true.

{% if condition == value %} {% endif %}

Example
```
{% if "{{NODE.ENV}}" == "dev" %}
    <p>This element is only shown in development environment</p>
{% endif %}
```

### Combining & Minifying tag

{% stylesheet output="" %} tags fill combine and minify files to output="main.css" path.
If the file already exists then nothing is done. When going to stating or production the cache should always be cleared so new files can be generated.
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

Static File Serving sends files to client if they are in public directory.

If the controller can't find route for incoming request then
Static File Serving checks does it has access to the requested directory and/or files.
The public directories are listed in config.js: config.web.publicDirectories = ["/web", "/cache"];

If the requested url is directory then the File server returns html page that has treeview of directories and files.
If the url points to file then the fileserver add's mime type, size and other info to the response headers and returns that file.

## Logging
require('./Logger.js');

Config values:

[Boolean] Enables writing logs to screen 
config.log.print;

[Boolean] Enables writing logs to file
config.log.write;

[Byte] What logging levels are viable
config.log.level;

```
config.log.levels = 
{
    DEBUG : 1,
    WARNING : 2,
    ERROR : 4,
    ALL : 7
}
```

For example log.level: 1 only logs Debug messages.
And log.level: 5 logs all debug and error messages.

Usage
```
Logger.Debug("fileToLog", "Message"); //Debug level logging: 00000001
Logger.Warning("fileToLog", "Message"); //Warning level logging: 00000010
Logger.Error("fileToLog", "Message"); //Error level logging: 000000100
```

## Authentication

Controller routes can require client to be authenticated.
```
{ route: {"/route/name : function() }, protected: true}
```

Creating new user
```
CreateUserCommand.js username password
```

Removing user
```
RemoveUserCommand.js username
```

Creating new user generates random salt then hashes the password with generated salt and stores the salt + hash to the database.
When logging in the authenticationService will check does the user exists in database.
If the user exists then it will hash the password with the salt in database and then compares the hashes.
If another one is wrong generic error will be returned.

When authentication is success a new session will be created. 
Session generates cookie and sets expiration date. 
The session will be saved to memory & added to client cookies.

When client tries to access protected routes the client cookies will be checked and valitaded. 
If they are valid then access is granted. Otherwise 404 will be returned.


