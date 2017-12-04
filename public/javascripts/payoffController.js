function addReceipt () {
  buttonDisabled(true, "#addButton");

  var fields = {
    fTitle: document.getElementById("title"),
    fAmmount: document.getElementById("ammount"),
    fDescription: document.getElementById("description")
  };
  
  var data = {
    title: fields.fTitle.value.trim(),
    ammount: fields.fAmmount.value.trim(),
    description: fields.fDescription.value.trim()
  };

  //client side verification
  var regexes = {
    title: new RegExp('^[^"\']+$'),
    ammount: new RegExp('^([1-9]{1,1}[0-9]*)([\.,]{1,1}[0-9]{1,2}){0,1}$')
  };

  var errors = {
    titleErr: !regexes.title.test(data.title),
    ammountErr: !regexes.ammount.test(data.ammount),
    descriptionErr: !regexes.title.test(data.description)
  };

  var anyError = function() {
    for(x in errors) {
      if(errors[x] == true) return true;
    }
    return false;
  }();

  if(anyError) {
    var messages = prepareErrorMessages(errors);
    displayErrors(messages, "#alertContainer", "#addButton");
    resetInputs();
  }
  else {
    //remove errors and display loading
    displayLoadingSpinner("#alertContainer", "#loadingSpinner", "#loadingContainer");
    //send post data and wait for response
    sendData(data, fields);
  }
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

function sendData(data, fields) {
  var storeId = location.pathname.split('/')[2];
  data.storeId = storeId;

  fetch('/addReceipt',
  {
    credentials: 'same-origin',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    method: 'post',
    body: JSON.stringify(data)
  }).then(function(response) {
    return response.json();
  }).then(function(data) {
    if(data.error == true) { 
      setTimeout(function() {
        resetInputs();
        displayBackendErrors(data.messages, "#alertContainer", "#loadingSpinner", "#loadingContainer", "#addButton");
      }, 700);
    }
    else {
      setTimeout( function () {
        resetAllInput(fields);
        displaySuccessMessage("Paragon dodany pomyślnie!","#loadingContainer", "#alertContainer", "#addButton");
      }, 700);
    }
  });
}

function resetInputs() {
  //do nothing 
}

function resetAllInput(fields) {
  for (var property in fields) {
    if (fields.hasOwnProperty(property)) {
      fields[property].value = '';
    }
  }
}
