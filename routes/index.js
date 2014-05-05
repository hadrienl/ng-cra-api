var passport = require('passport');

module.exports = function(app) {
  app.use(passport.initialize());
  app.use(passport.session());
  app.use('/api/auth/', require('./auth'));
  app.use('/api/days/', require('./days'));
};
