var Database = require('../Database.js');
var UserService = require('./UserService.js');

/**
 * Creates user
 * @param string username
 * @param string password
 */
function CreateUser(username, password) 
{    
    if (!username) {
        throw new Error("Missing username");
    }

    if (!password) {
        throw new Error("Missing password");
    }
    
    //Initialize database connection and create user
    Database.connectToDatabase(function (err, connected) {      
        UserService.AddUser(username, password, function (err, saved) {            
            
            if (err)
                console.log(err);
            else 
                console.log("User:" + username + " created");
                
            Database.disconnectFromDatabase();
        });
    });
}

CreateUser(process.argv[2], process.argv[3]);

