var databaseConnection = require('./databaseConnection');
var storesManager = require('./storesManager');
var loginSession = require('./loginSession');
var indexFunctions = require('./indexFunctions');
var ObjectID = require('mongodb').ObjectID;

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
            var userName = loginSession.getUsername(req);

            if(userId == 0) {
                return callback(error.unauthOperation);
            }

            var dataObject = {
                id: new ObjectID(),
                date: Date(),
                ownerId: userId,
                ownerName: userName,
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
        var collection = this.database.get('payoffs');

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
    },

    getReceipts: function(req, storeId, deleteIds, callback) {
        var obj = this;
        storesManager.getPrivileges(req, storeId, function(privilegeId) {

            if(privilegeId <= 0) {
                return callback(errors.unauthOperation);
            }

            var userId = loginSession.getId(req);

            if(userId == 0) {
                return callback(error.unauthOperation);
            }

            var collection = obj.database.get('payoffs');

            collection.find({storeId: storeId}, {limit: 1}, function(e, docs) {

                if(!indexFunctions.isEmpty(e)) {
                    return callback(errors.databaseError);
                }

                if(docs.length == 0) {
                    return callback (errors.empty);
                }

                var receipts = docs[0].receipts;
                var transfers = docs[0].transfers;

                if(receipts.length == 0 && transfers.length == 0) {
                    return callback (errors.empty);
                }

                if (deleteIds) {
                  deleteIdsReceipts(receipts, userId);
                  deleteIdsTransfers(transfers, userId);
                }

                var data = createProperData(receipts, transfers);

                return callback(data);
            });
        });
    },

    deleteReceipt: function(req, data, callback) {
        var collection = this.database.get('payoffs');

        storesManager.getPrivileges(req, data.storeId, function(privilegeId) {
            if(privilegeId <= 0) {
                return callback(errors.unauthOperation);
            }

            collection.find({storeId: data.storeId}, {limit: 1}, function(e, docs) {
                if(!indexFunctions.isEmpty(e)) {
                    return callback(errors.databaseError);
                }

                if(docs.length == 0) {
                    return callback (errors.databaseError);
                }

                if(deleteReceiptById(docs[0].receipts, data.receiptId)) {
                    updateObject(collection, docs[0], data.storeId, function(result) {
                        return callback(result);
                    });
                }
                else {
                    return callback(errors.databaseError);
                }
            });
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
    },
    noReceiptError: {
        error: true,
        messages: ["Nie ma takiego paragonu."]
    },
    empty: {
        error: false,
        empty: true
    },
    noError: {
        error: false
    }
};

function deleteIdsReceipts(receipts, userId) {
    for(var i = 0; i < receipts.length; i++) {
        receipts[i].deleteable = deleteable(userId, receipts[i].ownerId);
        delete receipts[i].ownerId;
    }
}

function deleteIdsTransfers(transfers, userId) {
    for(var i = 0; i < transfers.length; i++) {
        transfer[i].deleteable = deleteable(userId, giverId);
        delete transfers[i].giverId;
        delete transfers[i].recieverId;
    }
}

function deleteable(userId, ownerId) {
    if(userId == ownerId) {
        return true;
    }
    else {
        return false;
    }
}

function createProperData(receipts, transfers) {
    return {
        error: false,
        empty: false,
        receipts,
        transfers
    };
}

function deleteReceiptById(receipts, receiptId) {
    for(var i = 0; i < receipts.length; i++)
    {
        if(receipts[i].id == receiptId) {
            receipts.splice(i, 1);
            return true;
        }
    }

    return false;
}

function updateObject(collection, object, storeId, callback) {
    collection.update({storeId: storeId}, object, function(error) {
        console.log(error);
        return callback(errors.noError);
    });
}
