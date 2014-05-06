var client = require('../database/redisclient'),
  Q = require('q'),
  _ = require('lodash');

function getRand(length) {
  return parseInt(Math.random() * 10 / (10 / length));
}

function addUser(username, password) {
  var deferred = Q.defer(),
    uid;

  Q.ninvoke(client, 'hincrby', 'counters', 'nextUid', 1)
    .then(function(data) {
      uid = data;
      return Q.ninvoke(client, 'hmset', 'user:'+uid,
        'username', username,
        'password', password);
    })
    .then(function(data) {
      return Q.ninvoke(client, 'hset', 'indexes:user:username', username, uid);
    })
    /**
     * Days
     */
    .then(function(data) {
      var days = [],
        cursor = new Date('2014-04-01'),
        now = new Date(),
        projects = ['plm', 'ng-cra'];

      while(cursor < now) {
        days.push(new Date(cursor));
        cursor = new Date(+cursor + 1000 * 60 * 60 * 24);
      }
      return Q.all(_.map(days, function(date) {
        return Q.ninvoke(client, 'hmset', 'user:'+uid+':day:'+(+date),
          'morning', projects[getRand(projects.length)],
          'afternoon', projects[getRand(projects.length)]
        );
      }));
    })
    .then(function(data) {
      deferred.resolve(data);
    })
    .catch(function(err) {
      deferred.reject(err);
    });

  return deferred.promise;
}

module.exports = function(db) {
  var deferred = Q.defer();

  Q.ninvoke(client, 'select', db)
    .then(function(data) {
      if ('OK' !== data) throw new Error(data);
      
      return Q.ninvoke(client, 'flushdb');
    })
    /**
     * Users
     */
    .then(function(data) {
      return addUser('hadrien', '7c4a8d09ca3762af61e59520943dc26494f8941b');
    })
    .then(function(data) {
      return addUser('yann', '7c4a8d09ca3762af61e59520943dc26494f8941b');
    })
    .catch(function(err) {
      deferred.reject(err);
    })
    .finally(function () {
      client.quit();
      deferred.resolve('OK');
    });

  return deferred.promise;
};
