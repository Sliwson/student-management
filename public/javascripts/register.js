function handleRegister() {
  //disable button
  buttonDisabled(true);
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
    displayErrors(messages);
    resetInputs();
  }
  else {
    //remove errors and display loading
    displayLoadingSpinner();
    //send post data and wait for response
    sendData(registrationData);
  }
}

function sendData(data) {
  var xhttp;
  if(window.XMLHttpRequest) {
    xhttp = new XMLHttpRequest();
  } else {
    xhttp = new ActiveXObject("Microsoft.XMLHTTP");
  }

  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      console.log(this.responseText);
      var errors = JSON.parse(this.responseText);
      if(errors.error == "false") {
        setTimeout(displaySuccessMessage, 700);
      }
      else {
        //handle errors
        setTimeout(function() {
          displayBackendErrors(errors.messages)
        }, 700);
      }
    }
  };

  xhttp.open("POST", "/register", true);
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.send("nick=" + data.nickname + "&email=" + data.email + "&password=" + data.password);
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

function displayBackendErrors(messages)
{
  $("#loadingSpinner").fadeOut("600", "linear");
  $("#loadingContainer").fadeOut("600","linear", function() {
    displayErrors(messages);
  });
}

function displayErrors(messages) {
  if($("#alertContainer").html() != '') {
    $("#alertContainer").fadeOut("400","linear", function(){
      prepareContainer(messages);
      $("#alertContainer").fadeIn("400", "linear", function(){
        buttonDisabled(false);
      });
    });
  }
  else {
    prepareContainer(messages);
    $("#alertContainer").fadeIn("400", "linear", function() {
      buttonDisabled(false);
    });
  }
}

function prepareContainer(messages) {
  var errorsString = '';
  for(var i = 0; i < messages.length; i++) {
    if(i == messages.length-1) {
      errorsString += '<p class="mb-0">'+messages[i]+'</p>'
    }
    else {
      errorsString += '<p>'+messages[i]+'</p><hr>'
    }
  }

  var container = document.getElementById("alertContainer")
  container.style.display = "none";
  var alert = '<div id="registerAlert" class="mt-4 mb-0 alert alert-danger alert-dismissible" role="alert">'+
  '<button type="button" id="closeAlert" class="close" data-dismiss="alert" aria-label="Close">'+
  '<span aria-hidden="true">&times;</span>'+
  '</button>'+
  errorsString+
  '</div>';
  container.innerHTML = alert;
}

function displaySuccessMessage() {
  $("#loadingContainer").fadeOut("600","linear", function(){
    var container = document.getElementById("alertContainer")
    var alert = '<div id="registerSuccess" class="mt-4 mb-0 alert alert-success alert-dismissible" role="alert">'+
    '<button type="button" id="closeAlert" class="close" data-dismiss="alert" aria-label="Close">'+
    '<span aria-hidden="true">&times;</span>'+
    '</button>'+
    'Rejestracja przebiegła pomyślnie!'+
    '</div>';
    container.style.display =  "none";
    container.innerHTML = alert;
    $("#alertContainer").fadeIn("slow","linear");
    //enable button
    buttonDisabled(false);
  });
}

function displayLoadingSpinner() {
  if($("#alertContainer").html() != '') {
    $("#alertContainer").fadeOut("400","linear", function() {
      $("#loadingContainer").fadeIn("600", "linear");
      $("#loadingSpinner").fadeIn("600", "linear");
    });
  }
  else {
      $("#loadingContainer").fadeIn("600", "linear");
      $("#loadingSpinner").fadeIn("600", "linear");
  }
}

function buttonDisabled(state) {
    $("#registerButton").prop("disabled",state);
}
