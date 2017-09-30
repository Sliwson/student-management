function handleRegister() {
  var registrationData = {
    nickname: document.getElementById('nickname').value,
    email: document.getElementById('email').value,
    password: document.getElementById('password').value,
    passwordRepeat: document.getElementById('passwordRepeat').value
  };

  var regex = {
    nicknameR: new RegExp('[a-zA-Z0-9_]{4,}'),
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
    resetInputs(errors);
  }
  else {
    //remove errors send data to server
    var closeButton = document.getElementById('closeAlert');
    if(closeButton !== null) closeButton.click();
  }
}

function resetInputs(errors)
{
  document.getElementById('password').value = "";
  document.getElementById('passwordRepeat').value = "";
  if(errors.nicknameE)
    document.getElementById('nickname').value = "";
  if(errors.emailE)
    document.getElementById('email').value = "";
}

function prepareErrorMessages(errors)
{
  var errorMessages = [];
  if(errors.nicknameE)
    errorMessages.push('Niepoprawna nazwa użytkownika (musi składać się z co najmniej 4 znaków, może zawierać jedynie małe i duże litery, cyfry oraz znak podkreślenia).');
  if(errors.emailE)
    errorMessages.push('Niepoprawny adres email.');
  if(errors.passwordE || errors.passwordRepeatE)
    errorMessages.push('Hasło musi składać się z co najmniej 6 znaków.');
  if(errors.passwordMatchE)
    errorMessages.push('Hasła muszą być jednakowe.');
  return errorMessages;
}

function displayErrors(messages) {
  console.log("displaying errors");
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
   var alert = '<div id="registerAlert" class="mt-4 mb-0 alert alert-danger alert-dismissible fade" role="alert">'+
   '<button type="button" id="closeAlert" class="close" data-dismiss="alert" aria-label="Close">'+
   '<span aria-hidden="true">&times;</span>'+
   '</button>'+
   errorsString+
   '</div>';
   container.innerHTML = alert;

   var fadeIn = function () {
     document.getElementById("registerAlert").classList.add('in');
   };

   setTimeout(fadeIn, 10);
}
