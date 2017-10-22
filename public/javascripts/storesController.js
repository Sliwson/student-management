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
    sendData(name);
  }
}

function deleteStore(storeId) {
  console.log("Deleting store :" + storeId);
}

function sendData(name) {
  var xhttp;
  if(window.XMLHttpRequest) {
    xhttp = new XMLHttpRequest();
  } else {
    xhttp = new ActiveXObject("Microsoft.XMLHTTP");
  }

  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var errors = JSON.parse(this.responseText);
      if(errors.error == "true") {
        //handle errors
        setTimeout(function() {
          resetInput();
          displayBackendErrors(errors.messages, "#alertContainerAdd", "#loadingSpinnerAdd", "#loadingContainerAdd", "#createButton");
        }, 700);
      }
      else {
        //display success message
        setTimeout(function() {
          displaySuccessMessage("Skład dodany pomyślnie.", "#loadingContainerAdd", "#alertContainerAdd", "#createButton");
        }, 700);
        resetInput();
        //refresh stores
        refreshStores();
      }
    }};

    xhttp.open("POST", "/addStore", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("name=" + name);
}

function resetInput() {
  document.getElementById('storeName').value = "";
}
