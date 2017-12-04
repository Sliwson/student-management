var payoffDatabase = require('./payoffDatabase');

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

