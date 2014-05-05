var _ = require('lodash'),
  Q = require('q'),
  Models = require('./models');

function Days(config) {
  this.constructor.$_super.apply(this, arguments);
}
Models.extend(Days);

var fixtures = [{
  date: new Date('2014-05-01'),
  morning: 'ng-cra',
  afternoot: 'ng-cra'
}, {
  date: new Date('2014-05-02'),
  morning: 'ng-cra',
  afternoot: 'ng-cra'
}, {
  date: new Date('2014-05-03'),
  morning: 'plm',
  afternoot: 'plm'
}, {
  date: new Date('2014-05-04'),
  morning: 'plm',
  afternoot: 'ng-cra'
}, {
  date: new Date('2014-05-05'),
  morning: 'ng-cra',
  afternoot: 'ng-cra'
}];

Days.query = function(config) {
  var deferred = Q.defer();

  deferred.resolve(_.filter(fixtures, function(v, k) {
    return (v.date >= config.from &&
            v.date <= config.to);
  }));

  return deferred.promise;
};

module.exports = Days;