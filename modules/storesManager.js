var indexFunctions = require('./indexFunctions');
var loginSession = require('./loginSession');

module.exports = {
  verifyData: function(name, req, callback) {
    if(checkRegex(name)) {
      return (callback(errors.dataError));
    }

    var database = require('monk')('localhost:27017/student-management');
    var collection = database.get('stores');

    collection.find({name: name},{limit:1}, function(e, docs) {
      if(!indexFunctions.isEmpty(docs)) {
        database.close();
        return (callback(errors.nameUsed));
      }
      else {
        var insertObject = {
          name: name,
          admin: loginSession.getId(req),
          members: [0]
        };

        collection.insert(insertObject);

        setTimeout(function() {
          database.close();
        }, 100);

        return (callback(errors.noError));
      }
    });
  },
  getStores: function(req,callback) {
    var database = require('monk')('localhost:27017/student-management');
    var collection = database.get('stores');

    collection.find({}).then((docs) => {
      setTimeout(function() {
        database.close();
      }, 100);

      var storesArray = [];

      for(store in docs) {
        var storeObj = docs[store];
        var newObj = {};
        newObj.id = storeObj._id;
        newObj.name = storeObj.name;
        checkPrivileges(req, storeObj, newObj);
        storesArray.push(newObj);
      }
      return(callback(storesArray));
    });
  },
};

function checkPrivileges(req, storeObject, newObject) {
  var userId = loginSession.getId(req);
  if(userId == storeObject.admin) {
    newObject.privileges = 2; //admin
    return;
  }

  for(var i = 0; i < storeObject.members.length; i++) {
    if(storeObject.members[i] == userId) {
      newObject.privileges = 1; //member
      return;
    }
  }

  newObject.privileges = 0;
  return;
}

function checkRegex(data) {
  var reg = new RegExp('^[A-Za-z0-9ąćęłńóśźżĄĆĘŁŃÓŚŹŻ_\\s]{4,}$');
  return !reg.test(name);
}

var errors = {
  noError: {
    error: "false"
  },
  dataError: {
    error: "true",
    messages: ["Nieprawidłowe dane."]
  },
  nameUsed: {
    error: "true",
    messages: ["Ta nazwa jest już w użyciu."]
  }
};
