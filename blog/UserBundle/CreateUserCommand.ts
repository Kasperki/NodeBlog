import * as Database from '../Database';
import UserService from "./UserService";

/**
 * Creates user
 * @param string username
 * @param string password
 */
function CreateUser(username: string, password: string) 
{    
    if (!username) {
        throw new Error("Missing username");
    }

    if (!password) {
        throw new Error("Missing password");
    }
    
    //Initialize database connection and create user
    Database.ConnectToDatabase(function (err: Error, connected: boolean) {
        UserService.prototype.AddUser(username, password, function (err: Error, saved: boolean)
        {                
            if (err)
            {
                console.log(err);
            }
            else
            {
                console.log("User:" + username + " created");
            }
                
            Database.DisconnectFromDatabase();
        });
    });
}

CreateUser(process.argv[2], process.argv[3]);

