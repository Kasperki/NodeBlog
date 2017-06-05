var Database = require('../Database.js');
var UserService = require('./UserService.js');

/**
 * Remove user from db
 * @param string username
 */
function RemoveUser(username: string) 
{    
    if (!username) {
        throw new Error("Missing username");
    }

    //Initialize database connection and remove user
    Database.connectToDatabase(function (err: Error, connected: boolean) {      
        UserService.RemoveUser(username, function (err: Error, result: boolean) {            
            console.log("User:" + username + " removed");
            Database.disconnectFromDatabase();
        });
    });
}

RemoveUser(process.argv[2]);
