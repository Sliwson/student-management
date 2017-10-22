var session = require('express-session');

module.exports = {
  authenticateUser: function(req, id, name) {
    req.session.userid = id;
    req.session.username = name;
  },

  checkLogin: function(req) {
    if(req.session.userid) return true;
    else return false;
  },

  logout: function(req) {
    req.session.userid = 0;
    req.session.username = 0;
  },

  getUsername: function(req) {
    if(req.session.username) return req.session.username;
    else return "Anonymous";
  },

  getId: function(req) {
    if(req.session.userid) return req.session.userid;
    else return "0";
  }
};
