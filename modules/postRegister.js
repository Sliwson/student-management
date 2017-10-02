var bcrypt = require('bcrypt');
const saltRounds = 10;

module.exports = {
  verifyData: function(data, callback) {
      //check if everything is string
      if(!checkString(data)) {
        return (callback(errors.dataError));
      }

      //check with front-end regexes again
      if(checkRegex(data)) {
        return (callback(errors.dataError));
      }
      //estabilish connection with db
      var database = require('monk')('localhost:27017/student-management');
      var collection = database.get('users');

      //check email and nickname repetition
      var nameUsed = false, emailUsed = false;
      var nameFind  = collection.find({name: data.name},{limit:1},function(e, docs){
        nameUsed = !isEmpty(docs);
        console.log(nameUsed);

        collection.find({email: data.email},{limit:1}).then((docs) => {
          emailUsed = !isEmpty(docs);
          console.log(emailUsed);

          if(nameUsed && emailUsed) {
            return (callback(errors.bothUsed));
          }
          else if (nameUsed) {
            return (callback(errors.nameUsed));
          }
          else if (emailUsed) {
            return (callback(errors.emailUsed));
          }

          //hash the password
          try {
            data.password = bcrypt.hashSync(data.password, saltRounds);
          }
          catch(err) {
            return (callback(errors.hashingError));
          }

          //insert data into database
          var insert = collection.insert(data);

          setTimeout(function() {
            database.close();
          }, 100);

          return (callback(errors.noError));
        });
      });
  }
};

var errors = {
  noError: {
    error: "false"
  },
  dataError: {
    error: "true",
    messages: ["Nieprawidłowe dane."]
  },
  hashingError: {
    error: "true",
    messages: ["Błąd podczas szyfrowania danych."]
  },
  databaseError: {
    error: "true",
    messages: ["Błąd podczas łączenia z bazą danych."]
  },
  nameUsed: {
    error: "true",
    messages: ["Ta nazwa użytkownika jest już w użyciu."]
  },
  emailUsed: {
    error: "true",
    messages: ["Ten adres email jest już w użyciu."]
  },
  bothUsed: {
    error: "true",
    messages: ["Ta nazwa użytkownika jest już w użyciu.","Ten adres email jest już w użyciu."]
  }
};

function checkString(data) {
  if(typeof(data.name) == "string" && typeof(data.email) == "string" && typeof(data.password) == "string")
    return true;
  else return false;
}

function checkRegex(data) {
  var regex = {
    nicknameR: new RegExp('^[A-Za-z0-9ąćęłńóśźżĄĆĘŁŃÓŚŹŻ_\\s]{4,}$'),
    emailR: new RegExp('[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?'),
    passwordR: new RegExp('.{6,}')
  };

  var errors = {
    nicknameE: !regex.nicknameR.test(data.name),
    emailE: !regex.emailR.test(data.email),
    passwordE: !regex.passwordR.test(data.password),
  };

  return anyError = function() {
    for(x in errors) {
      if(errors[x] == true) return true;
    }
    return false;
  }();
}

function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }
    return true;
}
