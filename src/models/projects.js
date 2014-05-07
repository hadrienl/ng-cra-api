var _ = require('lodash'),
  client = require('../database/redisclient'),
  Q = require('q'),
  Models = require('./models');

function Projects(config) {
  this.constructor.$_super.apply(this, arguments);
}
Models.extend(Projects);

Projects.prototype.$load = function() {
  var deferred = Q.defer(),
    self = this;

  Q.ninvoke(client, 'hgetall', 'project:' + self.pid)
    .then(function(data) {
      self.$populate(data);
      return Q.ninvoke(client, 'hgetall', 'client:' + self.cid);
    })
    .then(function(data) {
      self.client = data;
      deferred.resolve(self);
    });

  return deferred.promise;
};

Projects.get = function(config) {
  var deferred = Q.defer(),
    projects = [];

  Q.ninvoke(client, 'hgetall', 'indexes:client:project')
    .then(function(data) {
      var promises = [];
      _.each(data, function(cid, pid) {
        var project = new Projects({
          pid: pid,
          cid: cid
        });
        projects.push(project);
        promises.push(project.$load());
      });

      return Q.all(promises);
    })
    .then(function(data) {
      deferred.resolve(data);
    });

  return deferred.promise;
};

function getCid(name) {
  var deferred = Q.defer(),
    cid;

  Q.ninvoke(client, 'hget', 'indexes:client:name', name)
    .then(function(data) {
      var deferred = Q.defer();

      if (data) {
        return Q.fcall(function() {
          deferred.resolve(data);
        });
      } else {
        return Q.ninvoke(client, 'hincrby', 'counters', 'nextCid', 1)
          .then(function(data) {
            cid = data;
            return Q.all([
              Q.ninvoke(client, 'hset', 'client:' + cid, 'name', name),
              Q.ninvoke(client, 'hset', 'indexes:client:name', name, cid)
            ]);
          })
          .then(function(data) {
            return Q.fcall(function() {
              return cid;
            });
          });
      }

      return deferred.promise;
    })
    .then(function(cid) {
      deferred.resolve(cid);
    })
    .catch(function(err) {
      deferred.reject(err);
    });

  return deferred.promise;
}

Projects.create = function(config) {
  var deferred = Q.defer(),
    pid, cid;

  config = config || {};

  if (!config.name) {
    deferred.reject('name is mandatory');
    return deferred.promise;
  }
  if (!config.client) {
    deferred.reject('client is mandatory');
    return deferred.promise;
  }

  getCid(config.client)
    .then(function(data) {
      cid = data;
      return Q.ninvoke(client, 'hget', 'indexes:project:name', config.name);
    })
    .then(function(data) {
      if (data) {
        deferred.reject('Project ' + config.name + ' already exists.');
      } else {
        return Q.ninvoke(client, 'hincrby', 'counters', 'nextPid', 1)
          .then(function(data) {
            pid = data;

            return Q.all([
              Q.ninvoke(client, 'hmset', 'project:' + pid,
                'name', config.name,
                'cid', cid
              ),
              Q.ninvoke(client, 'hset', 'indexes:project:name', config.name, pid),
              Q.ninvoke(client, 'hset', 'indexes:client:project', pid, cid)
            ]);
          });
      }
    })
    .then(function(data) {
      config.pid = pid;
      config.cid = cid;
      deferred.resolve(config);
    })
    .catch(function(err) {
      deferred.reject(err);
    });

  return deferred.promise;
};

module.exports = Projects;