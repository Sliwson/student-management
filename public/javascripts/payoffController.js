//Add receipt functions
function addReceipt () {
  buttonDisabled(true, "#addButton");

  var fields = getReceiptFields();
  
  var data = getReceiptFieldsData(fields);

  var regexes = defineRegexes();

  var errors = checkForErrors(regexes, data)

  handleResult(errors, data, fields);
}

function getReceiptFields() {
  return {
    fTitle: document.getElementById("title"),
    fAmmount: document.getElementById("ammount"),
    fDescription: document.getElementById("description")
  };
}

function getReceiptFieldsData(fields) {
  return {
    title: fields.fTitle.value.trim(),
    ammount: fields.fAmmount.value.trim(),
    description: fields.fDescription.value.trim()
  };
}

function defineRegexes() {
  return {
    title: new RegExp('^[^"\']+$'),
    ammount: new RegExp('^([1-9]{1,1}[0-9]*)([\.,]{1,1}[0-9]{1,2}){0,1}$')
  };
}

function checkForErrors(regexes, data) {
  return {
    titleErr: !regexes.title.test(data.title),
    ammountErr: !regexes.ammount.test(data.ammount),
    descriptionErr: !regexes.title.test(data.description)
  };
}

function handleResult(errors, data, fields) {
  var anyError = checkIfAnyError(errors);
  
  if(anyError) {
    displayErrorMessages(errors)
    resetInputs();
  }
  else {
    //remove errors and display loading
    displayLoadingSpinner("#alertContainer", "#loadingSpinner", "#loadingContainer");
    //send post data and wait for response
    sendData(data, fields);
  }
}

function checkIfAnyError(errors) {
  for(x in errors) {
    if(errors[x] == true) return true;
  }
  
  return false;
}

function displayErrorMessages(errors) {
  var messages = prepareErrorMessages(errors);
  //call from viewController
  displayErrors(messages, "#alertContainer", "#addButton");
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

  fetchAndHandleResponse(data, '/addReceipt/', handleAddReceiptResponse);
}

function fetchAndHandleResponse(data, url, responseFunction, handleErrorFunction) {
  fetch(url,
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
  }).then(function(dataFromServer) {
    responseFunction(dataFromServer);
  }).catch(function (error) {
    if(handleErrorFunction != null)
        handleErrorFunction(error);
  });
}

function handleAddReceiptResponse(responseData) {
  if(responseData.error == true) { 
    displayBackendErrorsDelay(responseData.messages);
    resetInputsDelay();
  }
  else {
    displayBackendSuccessDelay();
    ResetAllInputDelay();
    calculatePayoffsDelay();
  }
}

function displayBackendErrorsDelay(messages) {
  setTimeout(function() {
    displayBackendErrors(messages, "#alertContainer", "#loadingSpinner", "#loadingContainer", "#addButton");
  }, 700);
}

function ResetInputsDelay() {
  setTimeout(function() {
    resetInputs();
  }, 700);
}

function displayBackendSuccessDelay() {
  setTimeout( function () {
    displaySuccessMessage("Paragon dodany pomyślnie!","#loadingContainer", "#alertContainer", "#addButton");
  }, 700);
}

function ResetAllInputDelay() {
  setTimeout(function() {
    resetAllInput();
  }, 700);
}

function calculatePayoffsDelay() {
  setTimeout(function() {
    calculatePayoffs();
  }, 500);
}

//Load receipts functions
function loadReceipts() {
  var data = {
    id: getStoreId()
  };
  
  fetchAndHandleResponse(data, '/getReceipts/', handleLoadReceiptsResponse, handleLoadReceiptsError)
}

function handleLoadReceiptsResponse(responseData) {
  if(responseData.error == true) { 
    displayError(responseData.messages);
  }
  else if (responseData.empty == true) {
    displayMessage("Brak paragonów do wyświetlenia", '#receipts-container');
  }
  else {
    displayContent(responseData, '#receipts-container');
  }
}

function handleLoadReceiptsError(error) {
  displayMessage("Błąd podczas łączenia z bazą danych.", '#receipts-container');
}

function displayError(messages) {
  var con = $('#receipts-container'); 

  if(con.html().trim() == '') {
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

function displayMessage(message, container) {
  var con = $(container); 
  var mes = `<div>
            <span><p class = "text-secondary h5">${message}</p></span>
            </div>
            <hr>`;
  if(con.html().trim() == '') {
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

function displayContent(data, container) {
  var con = $(container); 
  var mes = prepareArr(data);
  if(con.html().trim() == '') {
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
  var button = obj.deleteable ? `<hr> <button onclick = "deleteCardReceipt('${obj.id}')" class = "btn btn-outline-danger">Usuń</button>` : '';

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

  return oks;
}

//Delete receipts functions
function deleteCardReceipt(receiptId) {
  var data = prepareDeleteData(receiptId);

  fetchAndHandleResponse(data, '/deleteReceipt/', handleDeleteResponse);
}

function handleDeleteResponse(responseData) {
  if(responseData.error) {
    displayMessage("Błąd podczas usuwania.", '#receipts-container');
  }
  else {
    loadReceipts();
  }
}

function prepareDeleteData(receiptId) {
  var storeId = getStoreId();
  return {
    storeId,
    receiptId
  };
}

//calculate payoffs
function calculatePayoffs() {
  var data = prepareCalculationData();

  fetchAndHandleResponse(data, '/calculatePayoffs/', handleCalculationResponse, handleCalculationError);
}

function prepareCalculationData() {
  return {
    storeId: getStoreId()
  };
}

function handleCalculationResponse(responseData) {
  if(responseData.error) {
    displayMessage("Błąd podczas obliczeń.", "#payoff-container");
  }
  else if (responseData.empty) {
    displayMessage("Brak rozliczeń.", "#payoff-container");
  }
  else {
    if(responseData.users.length == 0) {
      displayMessage("Brak rozliczeń.", "#payoff-container");
    }
    else {
      displayUsersArray(responseData.users);
    }
  }
}

function handleCalculationError(errorMsg) {
  displayMessage("Wystąpił błąd podczas połączenia z bazą danych.", "#payoff-container");
}

function displayUsersArray(users) {
  var displayString = prepareDisplayString(users);
  
  fadePayoffCards(displayString);
}

function prepareDisplayString(users) {
  var str = "";

  for(var i = 0; i < users.length; i++) {
    str += preparePayoffCard(users[i]);
  }

  return str;
}

function preparePayoffCard(userObject) {
  var button = userObject.toReturn >= 0.01 ? '<button onclick = "" class = "btn btn-outline-success">Rozliczono!</button>' 
                                           : '<button disabled=true class = "btn btn-outline-success">Rozliczono!</button>';

  return `<div>
    <span><p class = "text-secondary align-middle margin-bottom-custom mr-3 mt-1 mb-3 h4">${userObject.username} - ${userObject.toReturn} zł</p></span>
      <div class = "mb-3">
        ${button}
      </div>
    </div>
    <hr class ="mt-2">
    `;
}

function fadePayoffCards(message) {
  var con = $('#payoff-container'); 
  if(con.html().trim() == '') {
    con[0].innerHTML = message;
    con.fadeIn("400", "linear");
  }
  else {
    con.fadeOut("400", "linear", function() {
      con[0].innerHTML = message;
      con.fadeIn("400", "linear");
    })
  } 
}


//Other functions
function resetInputs() {
  //do nothing (because of field characteristics)
}

function resetAllInput() {
  var fields = getReceiptFields();

  for (var property in fields) {
    if (fields.hasOwnProperty(property)) {
      fields[property].value = '';
    }
  }
}

function getStoreId() {
  return location.pathname.split('/')[2];
}