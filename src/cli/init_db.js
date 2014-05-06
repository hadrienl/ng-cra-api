var fixtures = require('../database/fixtures'),
  _ = require('lodash'),
  args = process.argv.slice(2),
  db = _.find(args, function(v) {
    return '--db' === v.split('=')[0];
  }).split('=')[1];

fixtures(db)
  .then(function (data) {
    console.log(data);
  })
  .catch(function(err) {
    console.error(err);
  });

