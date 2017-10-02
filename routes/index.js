var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Strona główna', headScripts: ['/javascripts/register.js', '/javascripts/inputfieldEnter.js'] });
});

/*POST register. */
router.post('/register/', function (req, res, next) {
  //verify using register module;
  var postRegister = require('../modules/postRegister.js');
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

module.exports = router;
