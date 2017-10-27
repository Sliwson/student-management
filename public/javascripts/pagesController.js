function changePage(page) {
  switch(page) {
    case "main":
      changeContent("home.html", page);
    break;
    case "payoff":
      changeContent("payoff.html", page);
    break;
    case "cleaning":
      changeContent("cleaning.html", page);
    break;
    case "tasks":
      changeContent("tasks.html", page);
    break;
    case "settings":
      changeContent("settings.html", page);
    break;
    case "administration":
      changeContent("admin.html", page);
    break;
    default:
      changeContent("error.html", null);
    break;
  }
}

function changeContent(filename, id) {
  changeActive(id);
  $("#content-container").fadeOut("400","linear", function(){
    $("#page-content").load("../storePages/"+filename, function (response, status, xhr) {
      if(status == "error") {
        $("#page-content").load("../storePages/error.html");
      }
      $("#content-container").fadeIn("400", "linear");
    });
  });
}

function changeActive(id) {
  $(".nav-item").removeClass("active");
  $("#"+id).addClass("active")
}
