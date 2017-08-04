//  Modified from https://github.com/elliotf/mocha-mongoose
import * as mongoose from "mongoose";
import * as config from "../config";

/**
 * Cleans database after each test
 */
export function DBInitialization()
{
    beforeEach(function (done) {

        function ClearDatabase()
        {
            for (let i in mongoose.connection.collections)
            {
                let collection = mongoose.connection.collections[i];
                collection.drop();
            }
            return done();
        }

        if (mongoose.connection.readyState === 0)
        {
            mongoose.connect(config.database.host + config.database.schema, { user: config.database.user, pass: config.database.password }, function (err)
            {
                if (err)
                {
                    throw err;
                }
                return ClearDatabase();
            });
        }
        else
        {
            return ClearDatabase();
        }
    });

    afterEach(function (done)
    {
        mongoose.disconnect();
        return done();
    });
}

/**
 * Fixture to database
 */
export function fixtures(object: mongoose.Document)
{
    object.save(function (err: Error)
    {
        if (err) throw err;
    });
}