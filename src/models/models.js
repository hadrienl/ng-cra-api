var _ = require('lodash');

function Models(config) {
  this.$populate(config);
}
Models.extend = function(child) {
  _.extend(child, this);
  _.extend(child.prototype, this.prototype);
  child.prototype.constructor = child;
  child.$_super = this;
};

Models.prototype.$populate = function(config) {
  var self = this;
  _.each(config, function(v, k) {
    self[k] = v;
  });
};


module.exports = Models;