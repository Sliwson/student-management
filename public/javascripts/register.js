function handleRegister() {
  //disable button
  buttonDisabled(true, "#registerButton");
  //handle data
  var registrationData = {
    nickname: document.getElementById('nickname').value.trim(),
    email: document.getElementById('email').value.trim(),
    password: document.getElementById('password').value.trim(),
    passwordRepeat: document.getElementById('passwordRepeat').value.trim()
  };

  var regex = {
    nicknameR: new RegExp('^[A-Za-z0-9ąćęłńóśźżĄĆĘŁŃÓŚŹŻ_\\s]{4,}$'),
    emailR: new RegExp('[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?'),
    passwordR: new RegExp('.{6,}')
  };

  var errors = {
    nicknameE: !regex.nicknameR.test(registrationData.nickname),
    emailE: !regex.emailR.test(registrationData.email),
    passwordE: !regex.passwordR.test(registrationData.password),
    passwordRepeatE: !regex.passwordR.test(registrationData.passwordRepeat),
    passwordMatchE: function() {
      if(registrationData.password == registrationData.passwordRepeat) return false;
      else return true;
    }()
  };

  var anyError = function() {
    for(x in errors) {
      if(errors[x] == true) return true;
    }
    return false;
  }();

  if(anyError) {
    var messages = prepareErrorMessages(errors);
    displayErrors(messages, "#alertContainer", "#registerButton");
    resetInputs();
  }
  else {
    //remove errors and display loading
    displayLoadingSpinner("#alertContainer", "#loadingSpinner", "#loadingContainer");
    //send post data and wait for response
    sendData(registrationData);
  }
}

function sendData(data) {
  data.nick = data.nickname;
  fetch('/register',
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
    if(errors.error == false) {
      setTimeout( function () {
        displaySuccessMessage("Rejestracja przebiegła pomyślnie!","#loadingContainer", "#alertContainer", "#registerButton");
      }, 700);
    }
    else {
      //handle errors
      setTimeout(function() {
        resetInputs();
        displayBackendErrors(errors.messages, "#alertContainer", "#loadingSpinner", "#loadingContainer", "#registerButton");
      }, 700);
    }
  });
}

function resetInputs() {
  document.getElementById('password').value = "";
  document.getElementById('passwordRepeat').value = "";
}

function prepareErrorMessages(errors) {
  var errorMessages = [];
  if(errors.nicknameE)
    errorMessages.push('Niepoprawna nazwa użytkownika (musi składać się z co najmniej 4 znaków, może zawierać jedynie małe i duże litery, cyfry, spacje oraz znaki podkreślenia).');
  if(errors.emailE)
    errorMessages.push('Niepoprawny adres email.');
  if(errors.passwordE || errors.passwordRepeatE)
    errorMessages.push('Hasło musi składać się z co najmniej 6 znaków.');
  if(errors.passwordMatchE)
    errorMessages.push('Hasła muszą być jednakowe.');
  return errorMessages;
}
