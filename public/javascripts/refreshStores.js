function refreshStores() {
  var xhttp;
  if(window.XMLHttpRequest) {
    xhttp = new XMLHttpRequest();
  } else {
    xhttp = new ActiveXObject("Microsoft.XMLHTTP");
  }

  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var result = JSON.parse(this.responseText);

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
    }
  };

  xhttp.open("POST", "/getStores/", true);
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.send();
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
        cardString += '</div>'+
        '<hr>';
        if(storeData.privileges >= 1) {
          cardString += '<a href="#" class="btn btn-outline-secondary mr-1">Przejdź do ekranu składu</a>'+
          '<a href="#" class="btn btn-outline-secondary mr-1">Opuść skład</a>';
          if(storeData.privileges == 2) {
            cardString += '<button onclick = "deleteStore(\''+storeData.id +'\')" class="btn btn-outline-secondary delete-button">Usuń skład</button>';
          }
        }
        else {
          cardString += '<a href="#" class="btn btn-outline-secondary">Dołącz do tego składu</a>';
        }
        cardString += '</div>'+
    '</div>';
    return cardString;
}

addOnloadEvent(refreshStores);
