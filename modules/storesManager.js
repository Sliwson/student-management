var indexFunctions = require('./indexFunctions');
var loginSession = require('./loginSession');
var databaseConnection = require('./databaseConnection');

module.exports = {
  database: databaseConnection.db,

  verifyData: function(name, req, callback) {
    if(checkRegex(name)) {
      return (callback(errors.dataError));
    }

    var collection = this.database.get('stores');

    collection.find({name: name},{limit:1}, function(e, docs) {
      if(docs.length != 0) {
        return (callback(errors.nameUsed));
      }
      else {
        var emptyArr = [];
        var insertObject = {
          name: name,
          admin: loginSession.getId(req),
          members: emptyArr,
          pending: emptyArr,
          rejected: emptyArr
        };

        collection.insert(insertObject);

        return (callback(errors.noError));
      }
    });
  },
  getStores: function(req,callback) {
    var collection = this.database.get('stores');
    collection.find({}).then((docs) => {

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
    var collection = this.database.get('stores');

    collection.find({_id: storeId}, {limit:1}).then((docs) => {

      if(docs.length == 0) return callback(errors.databaseError);

      var newObj = {};
      newObj.id = docs[0]._id;

      checkPrivileges(req,docs[0],newObj);

      if(newObj.privileges == 2) {
        collection.remove({_id: storeId}).then((docs) => {
          return (callback(errors.noError));
        });
      }
      else {
        return (callback(errors.permissionError));
      }
    });
  },
  sendRequest: function(req, storeId, callback) {
    var collection = this.database.get('stores');

    collection.find({_id: storeId}, {limit:1}).then((docs) => {
      if(docs.length == 0) return callback(errors.databaseError);

      var newObj = {};
      newObj.id = docs[0]._id;
      checkPrivileges(req,docs[0],newObj);
      if(newObj.privileges == 0) {
        var pendingObj = {
          id: loginSession.getId(req),
          username: loginSession.getUsername(req)
        };
        docs[0].pending.push(pendingObj);
        collection.update({_id: storeId}, docs[0], function(err, cout, status) {
          if(indexFunctions.isEmpty(err)) {
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
    var collection = this.database.get('stores');
    collection.find({_id: storeId}, {limit:1}).then((docs) => {
      if(docs.length == 0) return callback(errors.databaseError);

      var newObj = {};
      newObj.id = docs[0]._id;
      checkPrivileges(req,docs[0],newObj);
      if(newObj.privileges == -1) {
        removePending(docs[0],loginSession.getId(req));
        collection.update({_id: storeId}, docs[0], function(err, cout, status) {
          if(indexFunctions.isEmpty(err)) {
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
  getStoreProperties: function (req, storeId, callback) {
    this.getStoreObject(req, storeId, function(err, obj) {
      if(err.error == false) {
        var dbObj = obj;
        var newObj = {};
        newObj.id = dbObj._id;
        newObj.name = dbObj.name;
        checkPrivileges(req,dbObj,newObj);
        return callback(errors.noError, newObj);
      }
      else return callback(err);
    });
  },
  getStoreObject: function (req, storeId, callback) {
    var collection = this.database.get('stores');

    if(storeId.length != 24) {
      return callback(errors.noStoreError, null);
    }
    else {
      collection.find({}, function (err, docs) {
        if(docs.length == 0) return callback(errors.noStoreError, null);
        if(err != null) return callback(errors.databaseError, null);
        for(var a = 0; a < docs.length; a++) {
          if(docs[a]._id == storeId) {
            //we got a matching store
            return callback(errors.noError, docs[a]);
          }
        }
        return callback(errors.noStoreError, null);
      });
    }
  },
  updateStoreObject: function (storeId, obj, callback) {
    var collection = databaseConnection.db.get('stores');

    collection.update({_id: storeId}, obj, function(err, cout, status) {
      if(indexFunctions.isEmpty(err)) {
        return (callback(errors.noError));
      }
      else {
        return callback(errors.databaseError);
      }
    });
  },
  getPendingQueue: function (req, storeId, callback) {
    var collection = this.database.get('stores');

    collection.find({_id: storeId}, {limit:1}).then((docs) => {
      if(docs.length == 0) return callback(errors.databaseError, null);

      var pendingQueue = docs[0].pending;

      return callback({error: false}, pendingQueue);
    });
  },
  moveUser: function(req, storeId, userId, accepted, callback) {
    var collection = databaseConnection.db.get('stores');
    var updateStoreObject = this.updateStoreObject;
    this.getStoreObject(req, storeId, function(err, obj) {
      if(err.error == true) {
        return callback(err);
      }
      else {
        for(var i = 0; i < obj.pending.length; i++) {
          if(obj.pending[i].id == userId) {
            //we got a match
            if(accepted == true) {
              //check if members contains our userData
              for(var a = 0; a < obj.members.length; a++) {
                if(obj.members[a] == userId) {
                  obj.pending.splice(i,1);
                  updateStoreObject(storeId, obj, function(res) {
                    return callback(errors.databaseError);
                  });
                }
              }

              obj.members.push(obj.pending[i]);
              obj.pending.splice(i,1);
              updateStoreObject(storeId, obj, function(res) {
                if(res.error == false) return callback(errors.noError);
                else return callback(res);
              });
            }
            else {
              for(var a = 0; a < obj.rejected.length; a++) {
                if(obj.rejected[a] == userId) {
                  obj.pending.splice(i,1);
                  updateStoreObject(storeId, obj, function(res) {
                    return callback(errors.databaseError);
                  });
                }
              }

              obj.rejected.push(obj.pending[i]);
              obj.pending.splice(i,1);
              updateStoreObject(storeId, obj, function(res) {
                if(err.error == false) return callback(errors.noError);
                else return callback(res);
              });
            }
          }
        }
      }
    });
  },

  getPrivileges: function(req, storeId, callback) {
    //grab all necessary fields from database, perform check function and return value
    var collection = this.database.get('stores');
    collection.find({_id: storeId}, {limit:1}).then((docs) => {
      if(docs.length == 0) return callback(0);

      var newObj = {};
      checkPrivileges(req, docs[0], newObj);
      return callback(newObj.privileges);
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
    if(storeObject.members[i].id == userId) {
      newObject.privileges = 1; //member
      return;
    }
  }

  for(var i = 0; i < storeObject.pending.length; i++) {
    if(storeObject.pending[i].id == userId) {
      newObject.privileges = -1; //pending
      return;
    }
  }

  for(var i = 0; i < storeObject.rejected.length; i++) {
    if(storeObject.rejected[i].id == userId) {
      newObject.privileges = -2; //rejected
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
    if(obj.pending[i].id == id) {
      obj.pending.splice(i,1);
      i = 0; //in case of multiple reqests (as a result of some bug)
    }
  }
}

var errors = {
  noError: {
    error: false
  },
  dataError: {
    error: true,
    messages: ["Nieprawidłowe dane."]
  },
  nameUsed: {
    error: true,
    messages: ["Ta nazwa jest już w użyciu."]
  },
  databaseError: {
    error: true,
    messages: ["Błąd podczas połączenia z bazą danych. Proszę odświeżyć stronę."]
  },
  permissionError: {
    error: true,
    messages: ["Brak uprawnień do wykonania tej operacji."]
  },
  noStoreError: {
    error: true,
    messages: ["Nie ma takiego składu."]
  }
};
