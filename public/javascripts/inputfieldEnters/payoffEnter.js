function enterWait(e){
    if (!e) e = window.event;
    var keyCode = e.keyCode || e.which;
    if (keyCode == '13'){
        $('#addButton').trigger('click');
        return false;
    }
  }