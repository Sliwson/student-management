function enterWaitCreate() {
  $('.enter-wait-create').keydown(function(event){
      var keyCode = (event.keyCode ? event.keyCode : event.which);
      if (keyCode == 13) {
          $('#createButton').trigger('click');
      }
  });
};

addOnloadEvent(enterWaitCreate);
