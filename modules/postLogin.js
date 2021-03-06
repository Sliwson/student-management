var session = require('express-session');
var bcrypt = require('bcrypt');
const saltRounds = 10;
var indexFunctions = require('./indexFunctions');
var databaseConnection = require ('./databaseConnection');

module.exports = {
  verifyData: function(data, callback) {
      if(!indexFunctions.checkString(data)) {
        callback(errors.loginError);
      }

      if(checkRegex(data)) {
        return (callback(errors.loginError));
      }

      var database = databaseConnection.db;
      var collection = database.get('users');

      collection.find({email: data.email},{limit: 1}, function(e, docs) {
        if(indexFunctions.isEmpty(docs)) {          
          return (callback(errors.loginError));
        }
        var passwordHash = docs[0].password;
        var id = docs[0]._id;
        var username = docs[0].name;
        bcrypt.compare(data.password, passwordHash, function(err, res) {
          if(err) {
            return(callback(errors.loginError));
          }
          if(res == true) {
            return(callback(errors.noError, id, username));
          }
          else {
            return(callback(errors.loginError));
          }
        });
      });
  }
};

var errors = {
  noError: {
    error: false
  },
  loginError: {
    error: true,
    messages: ["Nieprawidłowy login lub hasło"]
  }
};

function checkRegex(data) {
  var regex = {
    emailR: new RegExp('[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?'),
    passwordR: new RegExp('.{1,}')
  };

  var errors = {
    emailE: !regex.emailR.test(data.email),
    passwordE: !regex.passwordR.test(data.password)
  };

  return anyError = function() {
    for(x in errors) {
      if(errors[x] == true) return true;
    }
    return false;
  }();
}
