const assert = require('assert');
var mongoose = require('mongoose');
var config = require('../config.js');
var database = require('../app/blog/Database.js');

//NOTE: This test case is F***ED. Getting done() called multiple times error.
//Firstly Name is WDatabse so no error on before hooks... 
//Test after(mongoose.disconncet) hook cannot be run becase done() error wtf???
describe('Database', function () {
  describe('#connectToDatabase()', function () {
    
    before(function (done) {
       mongoose.disconnect();
       return done();
   }); 

   it('Should connect to database', function (done) {
          
        database.ConnectToDatabase();
         
        mongoose.connection.on('connected', function () {  
            done();
        });
         
        mongoose.connection.on('error',function (err) {  
            console.log('Mongoose default connection error: ' + err);   
        }); 
    });  
});
    
describe('#connectToDatabase()', function () {
    
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
        
        mongoose.connection.on('error',function (err) {  
            console.log('Mongoose default connection error: ' + err);   
        }); 
    });
}); 
});