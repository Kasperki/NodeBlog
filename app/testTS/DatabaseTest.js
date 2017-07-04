"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("mocha");
const mongoose = require("mongoose");
const config = require("../config");
const database = require("../blog/Database");
//NOTE: This test case is F***ED. Getting done() called multiple times error.
//Firstly Name is WDatabse so no error on before hooks... 
//Test after(mongoose.disconncet) hook cannot be run becase done() error wtf???
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
            var db = config.test.database.host + config.test.database.schema;
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
