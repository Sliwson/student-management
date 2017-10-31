function refreshRequests() {
  var xhttp = createXhttp();

  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var result = JSON.parse(this.responseText);

      var displayString = "";
      if(result.error == false) {
        displayString = prepareString(result.pendingArray);
      }
      else {
        displayString = prepareErrorString(result.messages);
      }
      visualTransition(displayString);
    }
  };

  var storeId = getStoreIdFromUrl();
  xhttp.open("POST", "/getRequests/", true);
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.send("id=" + storeId);
}

function processRequest(userId, accepted) {
  var xhttp = createXhttp();

  xhttp.onreadystatechange = function() {
    if(this.readyState == 4 && this.status == 200) {
      var result = JSON.parse(this.responseText);

      if(result.error == false) refreshRequests();
      else {
        displayString = prepareErrorString(result.messages);
        visualTransition(displayString);
      }
    }
  };

  var storeId = getStoreIdFromUrl();
  xhttp.open("POST", "/processRequest/", true);
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.send("storeId=" + storeId + "&userId=" + userId + "&accepted=" + accepted);
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
