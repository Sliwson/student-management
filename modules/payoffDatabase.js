var databaseConnection = require('./databaseConnection');
var storesManager = require('./storesManager');
var loginSession = require('./loginSession');
var indexFunctions = require('./indexFunctions');

module.exports = {
    database: databaseConnection.db,
    collectionName: 'payoffs',

    addReceipt: function(req, data, callback) {
        var obj = this;
        storesManager.getPrivileges(req, data.storeId, function(privilegeId) {

            if(privilegeId <= 0) {
                return callback(errors.unauthOperation);
            }

            var userId = loginSession.getId(req);

            if(userId == 0) {
                return callback(error.unauthOperation);
            }

            var dataObject = {
                ownerId: userId,
                title: data.title,
                ammount: data.ammount,
                description: data.description
            };
            
            obj.updateCollection(data.storeId, dataObject, function(result) {
                 return callback(result);
             });
        });
    },

    updateCollection: function(storeId, objectData, callback) {
        collection = this.database.get('payoffs');

        collection.find({storeId: storeId},{limit:1}, function(e, docs) {
            
            if(!indexFunctions.isEmpty(e)) {
                return callback(errors.databaseError);
            }

            if (docs.length == 0) {
                var b = [], c = [];
                var object = {
                    storeId: storeId,
                    receipts: b,
                    transfers: c
                };

                object.receipts.push(objectData);
                collection.insert(object);
                return callback({error: false});
            }
            else {
                var obj = docs[0];
                obj.receipts.push(objectData);
    
                collection.update({storeId: storeId}, obj); 
                return callback({error: false});  
            } 
        });
    }
};

var errors = {
    unauthOperation: {
        error: true,
        messages: ["Nieuprawniona operacja"]
    },
    databaseError: {
        error: true,
        messages: ["Błąd podczas połączenia z bazą danych."]
    }
};