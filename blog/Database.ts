import * as mongoose from "mongoose";
import * as config from "../config";
import { ErrorLogger } from "./Logger";

/**
 * Makes connection to database
 * @param callback (err, boolean)
 */
export function ConnectToDatabase (callback: any) 
{
    let dbHost = config.database.host + config.database.schema; 

    let options = <mongoose.ConnectionOptions>
    {
        user: config.database.user,
        pass: config.database.password,
    }

    mongoose.connect(dbHost, options);

    let db = mongoose.connection;
    db.on('error', function (err: Error)
    {
        ErrorLogger().Warning("Connection error: " + err);
    });
    
    db.once('open', function ()
    {
        ErrorLogger().Debug("Connected to DB");
        if (typeof callback === "function")
        {
            callback(null, true);
        }
    });
}

export function DisconnectFromDatabase ()
{
    mongoose.connection.close();
}