const assert = require('assert');
var mongoose = require('mongoose');
var database = require('../blog/Database.js');

describe('Database', function () {

   before(function (done) {
       mongoose.disconnect();
       return done();
   });

  describe('#connectToDatabase()', function () {
    it('Should connect to database', function (done) {
          
        database.connectToDatabase();
         
        mongoose.connection.on('connected', function () {  
            done();
        });
         
        mongoose.connection.on('error',function (err) {  
            console.log('Mongoose default connection error: ' + err);   
        }); 
    });
  });
});