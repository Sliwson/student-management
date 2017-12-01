function refreshStores() {
  fetch('/getStores',
  {
    credentials: 'same-origin',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    method: 'post'
  }).then(function(response) {
    return response.json();
  }).then(function(result) {
    sortStores(result);
    
    var storesString = "";
    for(store in result) {
      var storeData = result[store];
      storesString += prepareCard(storeData);
    }
    if($("#storesContainer").css('display') == 'hidden') {
      document.getElementById("storesContainer").innerHTML = storesString;
      $("#storesContainer").fadeIn("900", "linear");
    }
    else {
      $("#storesContainer").fadeOut("200", "linear", function() {
        document.getElementById("storesContainer").innerHTML = storesString;
        $("#storesContainer").fadeIn("600", "linear");
      });
    }
  });
}

function sortStores(storesArray) {
  var adminIndex = 0;
  var memberIndex = 0;

  var moveRight = function(indexA, indexB, arr) {
    var temp = arr[indexB];
    for(var i = indexB; i > indexA; i--) {
      arr[i] = arr[i-1];
    }
    arr[indexA] = temp;
  }

  for(var i = 0; i < storesArray.length; i++) {
    if(storesArray[i].privileges == 2) {
      moveRight(adminIndex, i, storesArray);
      adminIndex++;
      memberIndex++;
    }
    else if (storesArray[i].privileges == 1) {
      moveRight(memberIndex, i, storesArray);
      memberIndex++;
    }
  }
}

function prepareCard(storeData) {
  var cardString = '<hr>'+
    '<div class="card">' +
      '<div class="card-body">'+
        '<div>'+
        '<h4 class = "inline-header">' + storeData.name + '</h4>';
        if(storeData.privileges == 2) {
          cardString += '<span class = "text-success float-right h5 mt-1">Administrator</span>';
        }
        else if (storeData.privileges == 1) {
          cardString += '<span class = "text-primary float-right h5 mt-1">Członek</span>';
        }
        else if (storeData.privileges == -1) {
          cardString += '<span class = "text-muted float-right h5 mt-1">Wysłano prośbę o dołączenie</span>';
        }
        else if (storeData.privileges == -2) {
          cardString += '<span class = "text-warning float-right h5 mt-1">Prośba odrzucona</span>';
        }
        cardString += '</div>'+
        '<hr>';
        if(storeData.privileges >= 1) {
          cardString += '<a href="../store/' + storeData.id + '" class="btn btn-outline-secondary mr-1">Przejdź do ekranu składu</a>';
          if(storeData.privileges == 2) {
            cardString += '<button onclick = "deleteStore(\''+storeData.id +'\')" class="btn btn-outline-secondary delete-button">Usuń skład</button>';
          }
          else {
            cardString += '<a href="#" class="btn btn-outline-secondary mr-1">Opuść skład</a>';
          }
        }
        else if(storeData.privileges == 0) {
          cardString += '<button onclick = "sendRequest(\''+storeData.id +'\')" class="btn btn-outline-secondary request-button">Dołącz do tego składu</button>';
        }
        else if(storeData.privileges == -1) {
          cardString += '<button onclick = "cancelRequest(\''+storeData.id +'\')" class="btn btn-outline-secondary cancel-request-button">Anuluj prośbę o dołączenie</a>';
        }
        cardString += '</div>'+
    '</div>';
    return cardString;
}

addOnloadEvent(refreshStores);
