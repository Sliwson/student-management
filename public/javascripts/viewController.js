function displayBackendErrors(messages, alertContainer, loadingSpinner, loadingContainer, button)
{
  $(loadingSpinner).fadeOut("600", "linear");
  $(loadingContainer).fadeOut("600","linear", function() {
    displayErrors(messages, alertContainer, button);
  });
}

function displayErrors(messages, alertContainer, button) {
  if($(alertContainer).html() != '') {
    $(alertContainer).fadeOut("400","linear", function(){
      prepareContainer(messages, alertContainer);
      $(alertContainer).fadeIn("400", "linear", function(){
        buttonDisabled(false,button);
      });
    });
  }
  else {
    prepareContainer(messages, alertContainer);
    $(alertContainer).fadeIn("400", "linear", function() {
      buttonDisabled(false, button);
    });
  }
}

function prepareContainer(messages, alertContainer) {
  var errorsString = '';
  for(var i = 0; i < messages.length; i++) {
    if(i == messages.length-1) {
      errorsString += '<p class="mb-0">'+messages[i]+'</p>'
    }
    else {
      errorsString += '<p>'+messages[i]+'</p><hr>'
    }
  }
  var container = $(alertContainer)[0];
  container.style.display = "none";
  var alert = '<div id="registerAlert" class="mt-4 mb-0 alert alert-danger alert-dismissible" role="alert">'+
  '<button type="button" id="closeAlert" class="close" data-dismiss="alert" aria-label="Close">'+
  '<span aria-hidden="true">&times;</span>'+
  '</button>'+
  errorsString+
  '</div>';
  container.innerHTML = alert;
}

function displaySuccessMessage(loadingContainer, alertContainer, button) {
  $(loadingContainer).fadeOut("600","linear", function(){
    var container = $(alertContainer)[0];
    var alert = '<div id="registerSuccess" class="mt-4 mb-0 alert alert-success alert-dismissible" role="alert">'+
    '<button type="button" id="closeAlert" class="close" data-dismiss="alert" aria-label="Close">'+
    '<span aria-hidden="true">&times;</span>'+
    '</button>'+
    'Rejestracja przebiegła pomyślnie!'+
    '</div>';
    container.style.display =  "none";
    container.innerHTML = alert;
    $(alertContainer).fadeIn("slow","linear");
    //enable button
    buttonDisabled(false, button);
  });
}

function displayLoadingSpinner(alertContainer, loadingSpinner, loadingContainer) {
  if($(alertContainer).html() != '') {
    $(alertContainer).fadeOut("400","linear", function() {
      $(loadingContainer).fadeIn("600", "linear");
      $(loadingSpinner).fadeIn("600", "linear");
    });
  }
  else {
      $(loadingContainer).fadeIn("600", "linear");
      $(loadingSpinner).fadeIn("600", "linear");
  }
}

function buttonDisabled(state, button) {
    $(button).prop("disabled",state);
}