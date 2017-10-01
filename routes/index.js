var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Strona główna', headScripts: ['/javascripts/register.js', '/javascripts/inputfieldEnter.js'] });
});

/*POST register. */
router.post('/register', function (req, rest, next) {
  //check if all needed post variables exist
});

module.exports = router;
