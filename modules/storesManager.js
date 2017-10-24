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
          members: [0],
          pending: [0]
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
  deleteStore: function(req, storeId, callback) {
    var database = require('monk')('localhost:27017/student-management');
    var collection = database.get('stores');

    collection.find({_id: storeId}, {limit:1}).then((docs) => {

      if(docs.length == 0) return callback(errors.databaseError);

      var newObj = {};
      newObj.id = docs[0]._id;
      checkPrivileges(req,docs[0],newObj);

      if(newObj.privileges == 2) {
        collection.remove({_id: storeId}).then((docs) => {
          setTimeout(function() {
            database.close();
          }, 100);
          return (callback(errors.noError));
        });
      }
      else {
        return (callback(errors.permissionError));
      }
    });
  },
  sendRequest: function(req, storeId, callback) {
    var database = require('monk')('localhost:27017/student-management');
    var collection = database.get('stores');
    collection.find({_id: storeId}, {limit:1}).then((docs) => {
      if(docs.length == 0) return callback(errors.databaseError);

      var newObj = {};
      newObj.id = docs[0]._id;
      checkPrivileges(req,docs[0],newObj);
      if(newObj.privileges == 0) {
        docs[0].pending.push(loginSession.getId(req));
        collection.update({_id: storeId}, docs[0], function(err, cout, status) {
          if(indexFunctions.isEmpty(err)) {
            setTimeout(function() {
              database.close();
            }, 100);
            return (callback(errors.noError));
          }
          else {
            return callback(errors.databaseError);
          }
        });
      }
      else {
        return (callback(errors.permissionError));
      }
    });
  },
  cancelRequest: function(req, storeId, callback) {
    var database = require('monk')('localhost:27017/student-management');
    var collection = database.get('stores');
    collection.find({_id: storeId}, {limit:1}).then((docs) => {
      if(docs.length == 0) return callback(errors.databaseError);

      var newObj = {};
      newObj.id = docs[0]._id;
      checkPrivileges(req,docs[0],newObj);
      if(newObj.privileges == -1) {
        removePending(docs[0],loginSession.getId(req));
        collection.update({_id: storeId}, docs[0], function(err, cout, status) {
          if(indexFunctions.isEmpty(err)) {
            setTimeout(function() {
              database.close();
            }, 100);
            return (callback(errors.noError));
          }
          else {
            return callback(errors.databaseError);
          }
        });
      }
      else {
        return (callback(errors.permissionError));
      }
    });
  }
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

  for(var i = 0; i < storeObject.pending.length; i++) {
    if(storeObject.pending[i] == userId) {
      newObject.privileges = -1; //pending
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

function removePending(obj, id) {
  for(var i = 0; i < obj.pending.length; i++) {
    if(obj.pending[i] == id) {
      obj.pending.splice(i,1);
      i = 0; //in case of multiple reqests (as a result of some bug)
    }
  }
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
  },
  databaseError: {
    error: "true",
    messages: ["Błąd podczas połączenia z bazą danych. Proszę odświeżyć stronę."]
  },
  permissionError: {
    error: "true",
    messages: ["Brak uprawnień do wykonania tej operacji."]
  }
};
