var session = require('express-session');

module.exports = {
  authenticateUser: function(req, id) {
    req.session.userid = id;
  },

  checkLogin: function(req) {
    if(req.session.userid) return true;
    else return false;
  },

  logout: function(req) {
    req.session.userid = 0;
  },

  debugSession: function(req) {
    console.log(req.session.userid);
  }
};
