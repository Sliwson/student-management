window.onload = function() {
  $('.enter-wait').keydown(function(event){
      var keyCode = (event.keyCode ? event.keyCode : event.which);
      if (keyCode == 13) {
          $('#registerButton').trigger('click');
      }
  });
};
