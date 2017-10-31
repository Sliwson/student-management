function addStore() {
  buttonDisabled(true, "#createButton");

  var name = document.getElementById('storeName').value.trim();

  var reg = new RegExp('^[A-Za-z0-9ąćęłńóśźżĄĆĘŁŃÓŚŹŻ_\\s]{4,}$');

  var error = !reg.test(name);

  if(error) {
    var messages = ["Nazwa powinna zawierać znaków specjalnych. Powinna mieć minimum 4 znaki długości."];
    displayErrors(messages, "#alertContainerAdd", "#createButton");
    resetInput();
  }
  else {
    displayLoadingSpinner("#alertContainerAdd", "#loadingSpinnerAdd", "#loadingContainerAdd");
    sendData("name=" + name, "/addStore", "Skład dodany pomyślnie.", "#createButton");
  }
}

function deleteStore(storeId) {
  buttonDisabled(true, ".delete-button");

  displayLoadingSpinner("#alertContainerAdd", "#loadingSpinnerAdd", "#loadingContainerAdd");
  sendData("id=" + storeId, "/deleteStore", "Skład usunięty pomyślnie.", ".delete-button");
}

function sendRequest(storeId) {
  buttonDisabled(true, ".request-button");
  displayLoadingSpinner("#alertContainerAdd", "#loadingSpinnerAdd", "#loadingContainerAdd");
  sendData("id=" + storeId, "/sendRequest", "Prośba wysłana pomyślnie.", ".request-button");
}

function cancelRequest(storeId) {
  buttonDisabled(true, ".cancel-request-button");
  displayLoadingSpinner("#alertContainerAdd", "#loadingSpinnerAdd", "#loadingContainerAdd");
  sendData("id=" + storeId, "/cancelRequest", "Prośba anulowana.", ".cancel-request-button");
}

function sendData(postData, url, successMessage, button) {
  var xhttp;
  if(window.XMLHttpRequest) {
    xhttp = new XMLHttpRequest();
  } else {
    xhttp = new ActiveXObject("Microsoft.XMLHTTP");
  }

  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var errors = JSON.parse(this.responseText);
      if(errors.error == true) {
        //handle errors
        setTimeout(function() {
          resetInput();
          displayBackendErrors(errors.messages, "#alertContainerAdd", "#loadingSpinnerAdd", "#loadingContainerAdd", button);
        }, 700);
      }
      else {
        //display success message
        setTimeout(function() {
          displaySuccessMessage(successMessage, "#loadingContainerAdd", "#alertContainerAdd", button);
          refreshStores();
        }, 700);
        resetInput();
      }
    }};

    xhttp.open("POST", url, true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send(postData);
}

function resetInput() {
  document.getElementById('storeName').value = "";
}
