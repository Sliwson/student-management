var express = require('express');
var router = express.Router();
var postRegister = require('../modules/postRegister');
var postLogin = require('../modules/postLogin');
var loginSession = require('../modules/loginSession');
var storesManager = require('../modules/storesManager');
var adminController = require('../modules/adminController');
var payoff = require('../modules/payoff');

/* GET home page. */
router.get('/', function(req, res, next) {
  if(loginSession.checkLogin(req)) {
    res.redirect('/home/');
  }
  else {
    res.render('index', { title: 'Strona główna', headScripts: ['/javascripts/viewController.js','/javascripts/register.js', '/javascripts/login.js','/javascripts/inputfieldEnters/indexEnter.js'] });
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
    sendResHeader(res,result);
  });
});

/*POST login. */
router.post('/login/', function (req, res, next) {
  var loginData = {
    email: req.body.email,
    password: req.body.password
  };
  postLogin.verifyData(loginData, function(result, id=0, username='') {
    if(result.error == false) {
        loginSession.authenticateUser(req, id, username);
    }
    sendResHeader(res,result);
  });
});

/*POST Add store*/
router.post('/addStore/', function(req, res, next) {
  var name = req.body.name;
  storesManager.verifyData(name, req, function(result) {
    sendResHeader(res,result);
  });
});

/*POST Get stores*/
router.post('/getStores/', function(req, res, next) {
  storesManager.getStores(req, function(result) {
    sendResHeader(res,result);
  });
});

/*POST Delete store*/
router.post('/deleteStore/', function(req, res, next) {
  storesManager.deleteStore(req, req.body.id, function(result) {
    sendResHeader(res,result);
  });
});

/*POST Send request*/
router.post('/sendRequest/', function(req, res, next) {
  storesManager.sendRequest(req, req.body.id, function(result) {
    sendResHeader(res,result);
  });
});

/*POST Cancel request*/
router.post('/cancelRequest/', function(req, res, next) {
  storesManager.cancelRequest(req, req.body.id, function(result) {
    sendResHeader(res,result);
  });
});

function sendResHeader(res, result) {
  res.writeHead(200, {"Content-Type": "application/json"});
  res.write(JSON.stringify(result));
  res.end();
}

/*GET home*/
router.get('/home/', function(req, res, next) {
  if(loginSession.checkLogin(req)) {
    name = loginSession.getUsername(req);
    res.render('home', { title: 'Składy', headScripts: ['/javascripts/onLoadController.js',
    '/javascripts/viewController.js', '/javascripts/storesController.js', '/javascripts/inputfieldEnters/homeEnter.js',
    '/javascripts/refreshStores.js'], username: name});
  }
  else {
    res.redirect('/');
  }
});

/*GET store page */
router.get('/store/:storeId', function(req, res, next) {
  var storeId = req.params.storeId;

  if(loginSession.checkLogin(req)) {
    storesManager.getStoreProperties(req, storeId, function(errors, data) {
      name = loginSession.getUsername(req);
      if(errors.error == true) {
        res.render('storeError', { title: "Wystąpił błąd", messages: errors.messages, headScripts: [], username: name});
      }
      else {
          if(data.privileges >= 1) {
            var scriptsAll = ['/javascripts/pagesController.js', '/javascripts/payoffController.js', '/javascripts/viewController.js',
              '/javascripts/inputfieldEnters/payoffEnter.js'];
            if(data.privileges == 2) {
              var adminScripts = ['/javascripts/requestController.js'].concat(scriptsAll);
              res.render('store', { title: data.name, headScripts: adminScripts, username: name, admin: true});
            }
            else if (data.privileges == 1) {
              res.render('store', { title: data.name, headScripts: scriptsAll, username: name, admin: false});
            }
          }
          else {
            res.render('storeError', { title: "Wystąpił błąd", messages: ["Nie jesteś członkiem tego składu!"], headScripts: [], username: name});
          }
      }
    });
  }
  else {
    res.redirect('/');
  }
});

/*POST Get requests*/
router.post('/getRequests/', function(req, res, next) {
  var storeId = req.body.id;
  adminController.loadRequests(req, storeId, function(result) {
    sendResHeader(res, result);
  });
});

/*POST Process request*/
router.post('/processRequest/', function(req, res, next) {
  var storeId = req.body.storeId;
  var userId = req.body.userId;
  var accepted = req.body.accepted;

  adminController.processRequest(req, storeId, userId, accepted, function(result) {
    sendResHeader(res,result);
  })
});

/*POST Add receipt*/
router.post('/addReceipt/', function(req, res, next) {
  payoff.add(req, req.body, function(result) {
    sendResHeader(res, result);
  });  
});

/*POST Get receipts*/
router.post('/getReceipts/', function(req, res, next) {
  var id = req.body.id;
  payoff.get(req, id, function(result) {
    sendResHeader(res, result);
  });  
});

/*POST Delete receipt*/
router.post('/deleteReceipt/', function(req, res, next) {
  var data = req.body;
  payoff.delete(req, data, function(result) {
    sendResHeader(res, result);
  });  
});

/*POST Calculate payoffs*/
router.post('/calculatePayoffs/', function(req, res, next) {
  var data = req.body;
  payoff.calculatePayoffs(req, data, function(result) {
    sendResHeader(res, result);
  });  
});

/*LOGOUT*/
router.get('/logout/', function (req, res, next) {
  loginSession.logout(req);
  res.redirect('/');
});

module.exports = router;
