var _ = require('lodash'),
  client = require('../database/redisclient'),
  Q = require('q'),
  Models = require('./models'),
  sha1 = require('sha1');

function Users(config) {
  this.constructor.$_super.apply(this, arguments);
}
Models.extend(Users);

Users.prototype.isAdmin = function() {
  var deferred = Q.defer();

  Q.ninvoke(client, 'hget', 'indexes:user:admin', this.uid)
    .then(function(data) {
      deferred.resolve(!!data);
    })
    .catch(function(err) {
      deferred.reject(err);
    });

  return deferred.promise;
};

Users.prototype.setAdmin = function(admin) {
  if (admin) {
    return Q.ninvoke(client, 'hset', 'indexes:user:admin', this.uid, true);
  } else {
    return Q.ninvoke(client, 'hdel', 'indexes:user:admin', this.uid);
  }
};

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

Users.create = function(config) {
  var deferred = Q.defer(),
    uid;

  config = config || {};

  if (!config.username) {
    deferred.reject('Username is mandatory');
    return deferred.promise;
  }
  if (!config.password) {
    deferred.reject('Password is mandatory');
    return deferred.promise;
  }

  Q.ninvoke(client, 'hget', 'indexes:user:username', config.username)
    .then(function(data) {
      if (data) {
        throw new Error('username is not available');
      }

      return Q.ninvoke(client, 'hincrby', 'counters', 'nextUid', 1);
    })
    .then(function(data) {
      uid = data;

      var args = ['user:'+uid,
        'username', config.username,
        'password', sha1(config.password)];

      if (config.firstname) {
        args.push('firstname');
        args.push(config.firstname);
      }
      if (config.lastname) {
        args.push('lastname');
        args.push(config.lastname);
      }

      return Q.npost(client, 'hmset', args);
    })
    .then(function(data) {
      return Q.ninvoke(client, 'hset', 'indexes:user:username', config.username, uid);
    })
    .then(function(data) {
      config.uid = uid;
      deferred.resolve(new Users(config));
    })
    .catch(function(err) {
      deferred.reject(err);
    });

  return deferred.promise;
};

module.exports = Users;