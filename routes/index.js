var express = require('express');
var router = express.Router();
var postRegister = require('../modules/postRegister');
var postLogin = require('../modules/postLogin');
var loginSession = require('../modules/loginSession');

/* GET home page. */
router.get('/', function(req, res, next) {
  if(loginSession.checkLogin(req)) {
    res.redirect('/home/');
  }
  else {
    res.render('index', { title: 'Strona główna', headScripts: ['/javascripts/viewController.js','/javascripts/register.js', '/javascripts/login.js','/javascripts/inputfieldEnter.js'] });
  }
});

/*POST register. */
router.post('/register/', function (req, res, next) {
  //verify using register module;
  var userData = {
    name: req.body.nick,
    email: req.body.email,
    password: req.body.password
  };
  postRegister.verifyData(userData, function(result) {
    res.writeHead(200, {"Content-Type": "application/json"});
    res.write(JSON.stringify(result));
    res.end();
  });
});

/*GET home*/
router.get('/home/', function(req, res, next) {
  if(loginSession.checkLogin(req)) {
    name = loginSession.getUsername(req);
    res.render('home', { title: 'Składy', headScripts: [], username: name });
  }
  else {
    res.redirect('/');
  }
});

/*POST login. */
router.post('/login/', function (req, res, next) {
  var loginData = {
    email: req.body.email,
    password: req.body.password
  };
  postLogin.verifyData(loginData, function(result, id=0, username='') {
    if(result.error == "false") {
        loginSession.authenticateUser(req, id, username);
    }
    res.writeHead(200, {"Content-Type": "application/json"});
    res.write(JSON.stringify(result));
    res.end();
  });
});

/*LOGOUT*/
router.get('/logout/', function (req, res, next) {
  loginSession.logout(req);
  res.redirect('/');
});

module.exports = router;
