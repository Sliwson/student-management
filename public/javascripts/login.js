function handleLogin() {
  buttonDisabled(true, "#loginButton");
  //handle data
  var loginData = {
    email: document.getElementById('emailLogin').value.trim(),
    password: document.getElementById('passwordLogin').value.trim(),
  };

  var regex = {
    emailR: new RegExp('[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?'),
    passwordR: new RegExp('.{1,}')
  };

  var errors = {
    emailE: !regex.emailR.test(loginData.email),
    passwordE: !regex.passwordR.test(loginData.password)
  };

  var anyError = function() {
    for(x in errors) {
      if(errors[x] == true) return true;
    }
    return false;
  }();

  if(anyError) {
    var messages = prepareLoginErrorMessages(errors);
    displayErrors(messages, "#alertContainerLogin", "#loginButton");
    resetLoginInputs();
  }
  else {
    //remove errors and display loading
    displayLoadingSpinner("#alertContainerLogin", "#loadingSpinnerLogin", "#loadingContainerLogin");
    //send post data and wait for possible errors
    sendLoginData(loginData);
  }
}

function sendLoginData(data) {
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
          resetLoginInputs();
          displayBackendErrors(errors.messages, "#alertContainerLogin", "#loadingSpinnerLogin", "#loadingContainerLogin", "#loginButton");
        }, 700);
      }
      else {
        //redirect to home
        setTimeout(function() {
          displaySuccessMessage("Zalogowano pomyślnie.", "#loadingContainerLogin", "#alertContainerLogin", "#loginButton");
        }, 700);
        setTimeout(function() {
          window.location.assign('/home/');
        }, 1000);
      }
    }
  };

  xhttp.open("POST", "/login", true);
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.send("email=" + data.email + "&password=" + data.password);
}

function prepareLoginErrorMessages(errors) {
  var errorMessages = [];
  if(errors.emailE)
    errorMessages.push('Niepoprawny format adresu email.');
  if(errors.passwordE)
    errorMessages.push('Pole hasło nie może być puste.');
  return errorMessages;
}

function resetLoginInputs() {
  document.getElementById('passwordLogin').value = "";
}
