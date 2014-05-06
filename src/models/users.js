var _ = require('lodash'),
  client = require('../database/redisclient'),
  Q = require('q'),
  Models = require('./models'),
  sha1 = require('sha1');

function Users(config) {
  this.constructor.$_super.apply(this, arguments);
}
Models.extend(Users);

Users.checkAuth = function(username, password) {
  var deferred = Q.defer(),
    uid;

  Q.ninvoke(client, 'hget', 'indexes:user:username', username)
    .then(function(data) {
      if (!data) throw new Error('User not found');

      uid = data;

      return Users.get({uid: uid});
    })
    .then(function(user) {
      if (user.password !== sha1(password)) throw new Error('Wrong Password!');

      deferred.resolve(user);
    })
    .catch(function(err) {
      deferred.reject(err);
    });

  return deferred.promise;
};

Users.get = function(config) {
  var deferred = Q.defer();
  
  config = config || {};

  if (config.uid) {
    Q.ninvoke(client, 'hgetall', 'user:'+config.uid)
      .then(function(data) {
        data.uid = config.uid;
        deferred.resolve(new Users(data));
      })
      .catch(function(err) {
        deferred.reject(err);
      });
  } else {
    deferred.reject('Bad params');
  }

  return deferred.promise;
};

module.exports = Users;