//  Modified from https://github.com/elliotf/mocha-mongoose
var mongoose = require('mongoose');
var config = require('../config.js');

/**
 * Cleans database after each test
 */
exports.dbInitialization = function() {
  beforeEach(function (done) {

    function clearDB() {
      for (var i in mongoose.connection.collections) {
        mongoose.connection.collections[i].remove(function() {});
      }
      return done();
    }

    if (mongoose.connection.readyState === 0) {
      mongoose.connect(config.test.database.host + config.test.database.schema, {user:config.test.database.user, pass:config.test.database.password} , function (err) {
        if (err) {
          throw err;
        }
        return clearDB();
      });
    } else {
      return clearDB();
    }
  });

  afterEach(function (done) {
    mongoose.disconnect();
    return done();
  });
}

/**
 * Fixture to database
 */
exports.fixtures = function(object) {
    object.save(function(err){
      if ( err ) throw err;
    });
}