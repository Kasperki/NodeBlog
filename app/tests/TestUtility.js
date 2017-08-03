"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//  Modified from https://github.com/elliotf/mocha-mongoose
const mongoose = require("mongoose");
const config = require("../config");
/**
 * Cleans database after each test
 */
function DBInitialization() {
    beforeEach(function (done) {
        function ClearDatabase() {
            for (let i in mongoose.connection.collections) {
                let collection = mongoose.connection.collections[i];
                collection.drop();
            }
            return done();
        }
        if (mongoose.connection.readyState === 0) {
            mongoose.connect(config.database.host + config.database.schema, { user: config.database.user, pass: config.database.password }, function (err) {
                if (err) {
                    throw err;
                }
                return ClearDatabase();
            });
        }
        else {
            return ClearDatabase();
        }
    });
    afterEach(function (done) {
        mongoose.disconnect();
        return done();
    });
}
exports.DBInitialization = DBInitialization;
/**
 * Fixture to database
 */
function fixtures(object) {
    object.save(function (err) {
        if (err)
            throw err;
    });
}
exports.fixtures = fixtures;
