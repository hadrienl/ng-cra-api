var _ = require('lodash'),
  Q = require('q'),
  Models = require('./models');

function Users(config) {
  this.constructor.$_super.apply(this, arguments);
}
Models.extend(Users);

Users.checkAuth = function(username, password) {
  return Q.fcall(function () {
    if ('hadrien' === username &&
        '123456' === password) {
      return Users.get({uid: 1});
    }
  });
};

Users.get = function(config) {
  config = config || {};

  return Q.fcall(function() {
    if (1 === config.uid) {
      return new Users({
        uid: 1,
        username: 'hadrien',
        firstname: 'Hadrien',
        lastname: 'Lanneau'
      });
    }
    throw new Error('No user found');
  });
};

module.exports = Users;