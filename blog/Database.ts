import * as mongoose from "mongoose";
var config = require('../config.js');
import { ErrorLogger } from "./Logger";

/**
 * Makes connection to database
 * @param callback (err, boolean)
 */
export function ConnectToDatabase (callback: any) 
{
    var dbHost = config.database.host + config.database.schema; 

    var options = <mongoose.ConnectionOptions>
    {
        user: config.database.user,
        pass: config.database.password,
    }

    mongoose.connect(dbHost, options);

    var db = mongoose.connection;
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