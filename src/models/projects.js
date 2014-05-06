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

module.exports = Projects;