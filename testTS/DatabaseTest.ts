import "mocha";
import * as mongoose from "mongoose";
import * as config from "../config";
import * as database from "../blog/Database";

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
         
        mongoose.connection.on('error', function (err: Error) {  
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
        
        mongoose.connection.on('error', function (err: Error) {  
            console.log('Mongoose default connection error: ' + err);   
        }); 
    });
}); 
});