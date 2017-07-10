"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("mocha");
const mongoose = require("mongoose");
const config = require("../config");
const database = require("../blog/Database");
describe('Database', () => {
    describe('#connectToDatabase()', () => {
        before(function (done) {
            mongoose.disconnect();
            return done();
        });
        it('Should connect to database', function (done) {
            database.ConnectToDatabase(null);
            mongoose.connection.on('connected', function () {
                done();
            });
            mongoose.connection.on('error', function (err) {
                console.log('Mongoose default connection error: ' + err);
            });
        });
    });
    describe('#connectToDatabase()', () => {
        before(function (done) {
            var db = config.database.host + config.database.schema;
            mongoose.connect(db);
            return done();
        });
        it('Should disconnect from database', function (done) {
            database.DisconnectFromDatabase();
            mongoose.connection.on('disconnected', function () {
                done();
            });
            mongoose.connection.on('error', function (err) {
                console.log('Mongoose default connection error: ' + err);
            });
        });
    });
});
