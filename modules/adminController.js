var storesManager = require('./storesManager');

module.exports = {
  loadRequests: function(req, storeId, callback) {
    storesManager.getStoreProperties(req, storeId, function(err, storeObj) {
        if(err.error == true) {
          return callback(err);
        }

        if(storeObj.privileges < 2) {
          return callback(errors.permissionError);
        }

        //get pending queue;
        storesManager.getPendingQueue(req, storeId, function(err, data) {
          if(err.error == true) return callback(err);

          var returnObj = {
            error: false,
            pendingArray: data
          };
          return callback(returnObj);
        });
    });
  },
  processRequest: function(req, storeId, userId, accepted, callback) {
    storesManager.getStoreProperties(req, storeId, function(err, storeObj) {
      if(err.error == true) {
        return callback(err);
      }

      if(storeObj.privileges < 2) {
        return callback(errors.permissionError);
      }

      //depending of state: move usre from pending to members or rejected
      storesManager.moveUser(req, storeId, userId, accepted, function(result) {
        return callback(result);
      });
    });
  }
};

var errors = {
  permissionError: {
    error: true,
    messages: ["Brak uprawnień do wykonania tej operacji."]
  }
};
