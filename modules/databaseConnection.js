module.exports = {
  db: require('monk')('127.0.0.1:27017/student-management')
};
