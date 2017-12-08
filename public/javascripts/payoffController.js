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

function loadReceipts() {
  var data = {
    id: getStoreId()
  };

  fetch('/getReceipts/',
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
      displayError(data.messages);
    }
    else if (data.empty == true) {
      displayMessage("Brak paragonów do wyświetlenia");
    }
    else {
      displayContent(data);
    }
  });
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
  data.storeId = getStoreId();

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

function getStoreId() {
  return location.pathname.split('/')[2];
}

function displayError(messages) {
  var con = $('#receipts-container'); 

  if(con.html() != '') {
    prepareContainer(messages, '#receipts-container');
    con.append('<hr>');
    con.fadeIn("400", "linear");
  }
  else {
    con.fadeOut("400", "linear", function() {
      prepareContainer(messages, '#receipts-container');
      con.append('<hr>');
      con.fadeIn("400", "linear");
    })
  } 
}

function displayMessage(message) {
  var con = $('#receipts-container'); 
  var mes = `<div>
            <span><p class = "text-secondary h5">${message}</p></span>
            </div>
            <hr>`;
  if(con.html() != '') {
    con[0].innerHTML = mes;
    con.fadeIn("400", "linear");
  }
  else {
    con.fadeOut("400", "linear", function() {
      con[0].innerHTML = mes;
      con.fadeIn("400", "linear");
    })
  } 
}

function displayContent(data) {
  var con = $('#receipts-container'); 
  var mes = prepareArr(data);
  if(con.html() != '') {
    con[0].innerHTML = mes;
    con.fadeIn("400", "linear");
  }
  else {
    con.fadeOut("400", "linear", function() {
      con[0].innerHTML = mes;
      con.fadeIn("400", "linear");
    })
  } 
}

function prepareArr(data) {
  var rec = data.receipts;
  var str = '';
  for(var i = 0; i < rec.length; i++) {
    str += prepareCardReceipt(rec[i]);
  }

  //TODO: Sort and add transfers

  return str;
}

function prepareCardReceipt(obj) {
  var button = obj.deleteable ? '<hr> <button onclick = "" class = "btn btn-outline-danger">Usuń</button>' : '';

  var oks = `<div class = "card">
              <div class = "card-body">
                  <span class = "h3">${obj.title}</span>
                  <span class = "text-success h4 float-right">${obj.ammount} zł</span>
                  <hr>
                  <p class = "text-secondary font-big">${obj.description}</p>
                  <p class = "text-secondary h5">${obj.ownerName}</p>
                  ${button}
              </div>
            </div>
            <hr>`;

  //TODO: Delete function
  return oks;
}