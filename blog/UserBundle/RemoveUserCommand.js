var Database = require('../Database.js');
var UserService = require('./UserService.js');

/**
 * Remove user from db
 * @param string username
 */
function RemoveUser(username) 
{    
    if (!username) {
        throw new Error("Missing username");
    }

    //Initialize database connection and remove user
    Database.connectToDatabase(function (err, connected) {      
        UserService.RemoveUser(username, function (err, result) {            
            console.log("User:" + username + " removed");
            Database.disconnectFromDatabase();
        });
    });
}

RemoveUser(process.argv[2]);
