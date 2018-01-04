var payoffDatabase = require('./payoffDatabase');
var storesManager = require('./storesManager');
var loginSession = require('./loginSession');

module.exports = {
    add: function(req, data, callback) {
        var anyError = chceckBasicErrors(data);

        if(anyError) {
            var messages = prepareErrorMessages(errors);
            return callback({error: true, messages: messages});
        }

        //convert string to float
        data.ammount = parseFloat(data.ammount);
        if(isNaN(data.ammount)) {
            return callback({error: true, messages: ["Suma musi być liczbą."]});
        }

        //add receipt to database
        payoffDatabase.addReceipt(req, data, function(result) {
            return callback(result);
        });
    },

    get: function(req, storeId, callback) {
        payoffDatabase.getReceipts(req, storeId, true, function(result) {
            return callback(result);
        });
    },

    getWithIds: function(req, storeId, callback) {
      payoffDatabase.getReceipts(req, storeId, false, function(result) {
        return callback(result);
      });
    },

    delete: function(req, data, callback) {
        payoffDatabase.deleteReceipt(req, data, function(result) {
            return callback(result);
        });
    },

    calculatePayoffs: function (req, data, callback) {
      var payoffsModule = this;

      //get all users
      storesManager.getUsers(req, data.storeId, function(usersResponse) {
        if (usersResponse.error == true)
          return callback(usersResponse);

        var users = usersResponse.array;

        payoffsModule.getWithIds(req, data.storeId, function(receiptsResponse) {
          if(receiptsResponse.error || receiptsResponse.empty)
            return callback(receiptsResponse);
            
            var receipts = receiptsResponse.receipts;
            var transfers = receiptsResponse.transfers;

            var activeUserId = loginSession.getId(req);

            prepareUserObjects(users);
            addSpendingsToUserObjects(users, receipts);
            splitSpendingsToActiveUser(users, activeUserId);
            //consult transfers and alter users array
            console.log(users);

            var toReturn = prepareToReturnObject(users, activeUserId);
            return callback(toReturn);
        });
      });
    }
};

function chceckBasicErrors(data) {
    //server side verification
    var regexes = {
        title: new RegExp('^[^"\']+$'),
        ammount: new RegExp('^([1-9]{1,1}[0-9]*)([\.,]{1,1}[0-9]{1,2}){0,1}$')
    };

    var errors = {
        titleErr: !regexes.title.test(data.title),
        ammountErr: !regexes.ammount.test(data.ammount),
        descriptionErr: !regexes.title.test(data.description)
    };

    return function() {
        for(x in errors) {
        if(errors[x] == true) return true;
        }
        return false;
    }();
}

function prepareErrorMessages(errors) {
    var err = [];
    if(errors.titleErr) {
      err.push("Niepoprawny format tytułu.");
    }
    if(errors.ammountErr) {
      err.push("Suma musi być liczbą dodatnią oraz zawierać maksymalnie dwie cyfry rozwinięcia dziesiętnego.");
    }
    if(errors.descriptionErr) {
      err.push("Niepoprawny opis.");
    }
    return err;
}

//calculation functions
function prepareUserObjects(users) {
    for(var i = 0; i < users.length; i++) {
        users[i].spendings = 0;
        users[i].toReturn = 0;
    }
}

function addSpendingsToUserObjects(users, receipts) {
    for(var i = 0; i < receipts.length; i++) {
        for(var j = 0; j < users.length; j++) {
            if(users[j].id == receipts[i].ownerId) {
                users[j].spendings += receipts[i].ammount;
            }
        }
    }
}

function subtractLowestSpending(users) {
    var ammount = findLowestSpending(users);

    subtractAmmountFromSpendings(users, ammount);    
}

function subtractAmmountFromSpendings(users, ammount) {
    for(var i = 0; i < users.length; i++) {
        users[i].spendings -= ammount;
    }
}

function findLowestSpending(users) {
    if(users.length == 0) 
        return 0;

    var lowest = users[0].spendings;

    for(var i = 1; i < users.length; i++) {
        if(users[i].spendings < lowest) {
            lowest = users[i].spendings;
        }
    }

    return lowest;
}

function splitSpendingsToActiveUser(users, activeUserId) {
    var usersSpendings = getActiveUserSpending(users, activeUserId);

    subtractAmmountFromSpendings(users, usersSpendings);

    accumulateToReturn(users, activeUserId);
}

function getActiveUserSpending(users, activeUserId) {
    for(var i = 0; i < users.length; i++) {
        if(users[i].id == activeUserId) {
            return users[i].spendings;
        }
    }

    return -1;
}

function accumulateToReturn(users, activeUserId) {
    for(var i = 0; i < users.length; i++) {
        if(users[i].spendings > 0) {
            var ammount = calculateToReturn(users, users[i].spendings);
            addToReturn(users, users[i].id, ammount);
        }
    }
}
 
function calculateToReturn(users, ammount) {
    return ammount/users.length;
}

function addToReturn(users, userId, ammount) {
    for(var i = 0; i < users.length; i++) {
        if(users[i].id == userId) {
            users[i].toReturn += ammount;
            return;
        }
    }
}

function prepareToReturnObject(users, activeUserId) {
    for(var i = 0; i < users.length; i++) {
        if(users[i].id == activeUserId) {
            users.splice(i, 1);
        }
        else {
            delete users[i].spendings;
            users[i].toReturn = roundToMoneyValue(users[i].toReturn);
        }
    }

    return {
        error: false,
        empty: false,
        users: users
    };
}

function roundToMoneyValue(number) {
    return number.toFixed(2);
}