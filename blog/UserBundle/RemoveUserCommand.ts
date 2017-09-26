import * as Database from '../Database';
import UserService from "./UserService";

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
    Database.ConnectToDatabase(function (err: Error, connected: boolean) {
        UserService.prototype.RemoveUser(username, function (err: Error, result: boolean) {            
            console.log("User:" + username + " removed");
            Database.DisconnectFromDatabase();
        });
    });
}

RemoveUser(process.argv[2]);
