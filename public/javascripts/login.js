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
  fetch('/login',
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
  }).then(function(errors) {
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
  });
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
