function refreshRequests() {
  var id = getStoreIdFromUrl();
  var data = {
    id: id
  };

  fetch('/getRequests',
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
  }).then(function(result) {
    var displayString = "";
    if(result.error == false) {
      displayString = prepareString(result.pendingArray);
    }
    else {
      displayString = prepareErrorString(result.messages);
    }
    visualTransition(displayString);
  });
}

function processRequest(userId, accepted) {
  var storeId = getStoreIdFromUrl();
  var data = {
    storeId,
    userId,
    accepted
  };

  fetch('/processRequest',
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
  }).then(function(result) {
    if(result.error == false) refreshRequests();
    else {
      displayString = prepareErrorString(result.messages);
      visualTransition(displayString);
    }
  });
}

function getStoreIdFromUrl() {
  var pathArray = window.location.pathname.split( '/' );
  return pathArray[pathArray.length - 1];
}

function prepareString(arr) {
  var str = "";

  if(arr.length == 0) {
    str += '<div>'+
           '<span><p class = "text-secondary align-middle margin-bottom-custom mr-3 mt-1 h5">Brak oczekujących próśb.</p></span>'+
           '</div>'+
           '<hr class = "mt-2">';
  }
  else {
    for(var i = 0; i < arr.length; i++) {
      str += '<div>'+
             '<span><p class = "text-secondary align-middle margin-bottom-custom mr-3 mt-1 mb-3 h4">' + arr[i].username + '</p></span>'+
             '<div class = "mb-3">'+
             '<button onclick = "processRequest(\'' + arr[i].id + '\', false)" class = "btn btn-outline-danger">Odrzuć</button>'+
             '<button onclick = "processRequest(\'' + arr[i].id + '\', true)" class = "btn btn-outline-success ml-1">Akceptuj</button>'+
             '</div>'+
             '</div>'+
             '<hr class ="mt-2">';
    }
  }

  return str;
}

function prepareErrorString(messagesArray) {
  var str = "";

  if(messagesArray.length == 0) {
    str += '<div>'+
           '<span><p class = "text-secondary align-middle margin-bottom-custom mr-3 mt-1 h5">Wystąpił nieznany błąd.</p></span>'+
           '</div>'+
           '<hr class = "mt-2">';
  }
  else {
    for(var i = 0; i < messagesArray.length; i++) {
      str += '<div>'+
             '<span><p class = "text-secondary align-middle margin-bottom-custom mr-3 mt-1 h5">' + messagesArray[i] + '</p></span>'+
             '</div>'+
             '<hr class = "mt-2">';
    }
  }

  return str;
}

function visualTransition(str) {
  if(document.getElementById("pending-container").innerHTML.trim() == "") {
    document.getElementById("pending-container").innerHTML = str;
    $("#pending-container").fadeIn("500", "linear");
  }
  else {
    $("#pending-container").fadeOut("500", "linear", function () {
      document.getElementById("pending-container").innerHTML = str;
      $("#pending-container").fadeIn("500", "linear");
    });
  }
}

function createXhttp() {
  if(window.XMLHttpRequest) {
    return new XMLHttpRequest();
  } else {
    return new ActiveXObject("Microsoft.XMLHTTP");
  }
}
