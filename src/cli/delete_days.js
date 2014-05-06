var client,
  Q = require('q'),
  _ = require('lodash'),
  args = process.argv.slice(2),
  db = (_.find(args, function(v) {
    return '--db' === v.split('=')[0];
  }) || '').split('=')[1],
  username = (_.find(args, function(v) {
    return '--username' === v.split('=')[0];
  }) || '').split('=')[1];

if (!username) {
  return;
}

client = require('../database/redisclient');

Q.ninvoke(client, 'select', db)
.then(function() {
  return Q.ninvoke(client, 'hget', 'indexes:user:username', username);
})
.then(function(uid) {
  if (!uid) throw new Error('user ' + username + ' not found');
  return Q.ninvoke(client, 'keys', 'user:'+uid+':day:*');
})
.then(function(data) {
  return Q.all(_.map(data, function(k) {
    return Q.ninvoke(client, 'del', k);
  }));
})
.catch(function (err) {
  console.error(err);
})
.finally(function(data) {
  client.quit();
});