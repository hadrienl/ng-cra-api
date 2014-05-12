var client = require('../database/redisclient'),
  Q = require('q'),
  Models = require('./models'),
  sha1 = require('sha1');

function setToString(v) {
  if (v === undefined || v === null) {
    v = '';
  } else {
    v = String(v);
  }
  return v;
}

function Users(config) {
  var $firstname, $lastname;

  Object.defineProperties(this, {
    firstname: {
      enumerable: true,
      get: function () {
        return $firstname;
      },
      set: function (v) {
        $firstname = setToString(v);
      }
    },
    lastname: {
      enumerable: true,
      get: function () {
        return $lastname;
      },
      set: function (v) {
        $lastname = setToString(v);
      }
    }
  });
  this.constructor.$_super.apply(this, arguments);
}
Models.extend(Users);

Users.prototype.isAdmin = function () {
  var deferred = Q.defer();

  Q.ninvoke(client, 'hget', 'indexes:user:admin', this.uid)
    .then(function (data) {
      deferred.resolve(!!data);
    })
    .catch(function (err) {
      deferred.reject(err);
    });

  return deferred.promise;
};

Users.prototype.setAdmin = function (admin) {
  if (admin) {
    return Q.ninvoke(client, 'hset', 'indexes:user:admin', this.uid, true);
  } else {
    return Q.ninvoke(client, 'hdel', 'indexes:user:admin', this.uid);
  }
};

Users.checkAuth = function (username, password) {
  var deferred = Q.defer(),
    uid;

  Q.ninvoke(client, 'hget', 'indexes:user:username', username)
    .then(function (data) {
      if (!data) {
        throw new Error('User not found');
      }

      uid = data;

      return Users.get({uid: uid});
    })
    .then(function (user) {
      if (user.password !== sha1(password)) {
        throw new Error('Wrong Password!');
      }

      deferred.resolve(user);
    })
    .catch(function (err) {
      deferred.reject(err);
    });

  return deferred.promise;
};

Users.get = function (config) {
  var deferred = Q.defer();

  config = config || {};

  if (config.uid) {
    Q.ninvoke(client, 'hgetall', 'user:' + config.uid)
      .then(function (data) {
        data.uid = config.uid;
        deferred.resolve(new Users(data));
      })
      .catch(function (err) {
        deferred.reject(err);
      });
  } else {
    deferred.reject('Bad params');
  }

  return deferred.promise;
};

Users.create = function (config) {
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

  Q.ninvoke(client, 'hexists', 'indexes:user:username', config.username)
    .then(function (data) {
      if (data) {
        throw new Error('username is not available');
      }

      return Q.ninvoke(client, 'hincrby', 'counters', 'nextUid', 1);
    })
    .then(function (data) {
      uid = data;

      var args = ['user:' + uid,
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
    .then(function () {
      return Q.ninvoke(client, 'hset', 'indexes:user:username', config.username, uid);
    })
    .then(function () {
      config.uid = uid;
      deferred.resolve(new Users(config));
    })
    .catch(function (err) {
      deferred.reject(err);
    });

  return deferred.promise;
};

Users.update = function (config) {
  var user;

  config = config || {};

  return Q.fcall(function () {
    if (!config.uid) {
      throw new Error('Cannot update user who does not exist in database');
    }
    else {
      return null;
    }
  })
    .then(function () {
      return Users.get({uid: config.uid});
    })
    .then(function (data) {
      user = data;

      return Q.fcall(function () {
        var args = ['user:' + config.uid];

        if (config.lastname !== user.lastname) {
          args.push('lastname', config.lastname);
        }
        if (config.firstname !== user.firstname) {
          args.push('firstname', config.firstname);
        }
        if (args.length === 1) {
          return null;
        }

        return Q.npost(client, 'hmset', args);
      });
    })
    .then(function () {
      if (config.username && config.username !== user.username) {
        return Users.checkUsername(config.username)
          .then(function (exist) {
            if (exist) {
              return null;
            }

            return Q.all([
              Q.ninvoke(client, 'hset', 'user:' + config.uid, 'username', config.username),
              Q.ninvoke(client, 'hset', 'indexes:user:username', config.username, config.uid),
              Q.ninvoke(client, 'hdel', 'indexes:user:username', user.username)
            ]);
          });
      }
      return null;
    })
    .then(function () {
      if (config.newpassword && user.password === sha1(config.oldpassword)) {
        return Q.ninvoke(client, 'hset', 'user:' + config.uid, 'password', sha1(config.newpassword));
      }
      return null;
    })
    .then(function () {
      return 'OK';
    });
};

Users.checkUsername = function (username) {
  return Q.ninvoke(client, 'hexists', 'indexes:user:username', username);
};

module.exports = Users;
