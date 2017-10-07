module.exports = {
  checkString: function(data) {
    for(x in data) {
      if(typeof(data[x]) != "string")
        return false;
    }
    return true;
  },

  isEmpty: function(obj) {
      for(var prop in obj) {
          if(obj.hasOwnProperty(prop))
              return false;
      }
      return true;
  }
};
