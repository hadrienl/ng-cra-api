var _ = require('lodash'),
  client = require('../database/redisclient'),
  Q = require('q'),
  Models = require('./models'),
  A_DAY = 1000 * 60 * 60 * 24;

function Days(config) {
  this.constructor.$_super.apply(this, arguments);
}
Models.extend(Days);

Days.get = function(config) {
  var deferred = Q.defer(),
    days = [],
    from, to;

  config = config || {};

  if (!config.month ||
      !(config.month instanceof Date)) {
    throw new Error('config.date must be a valid Date');
  }
  from = new Date(config.month);
  to = new Date(from);
  to.setMonth(to.getMonth()+1);
  from = new Date(+from - A_DAY);

  while (from < to) {
    days.push(new Date(from));
    from = new Date(+from + A_DAY);
  }

  Q.all(days.map(function(date) {
    return Q.ninvoke(client, 'hgetall', 'user:'+config.uid+':day:'+(+date))
  }))
    .then(function(data) {
      var dates = days.map(function(date, k) {
        var day = new Days(data[k]);
        day.date = date;
        return day;
      });
      deferred.resolve(dates);
    })
    .catch(function(err) {
      deferred.reject(err);
    });
  

  return deferred.promise;
};

module.exports = Days;