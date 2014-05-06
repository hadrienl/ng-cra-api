var LocalStrategy = require('passport-local').Strategy,
  Users = require('../models/users');

module.exports = function(passport) {
  passport.use(new LocalStrategy(
    function(username, password, done) {
      // Get user with this email
      Users.checkAuth(username, password)
        .then(function(data) {
          done(null, data);
        })
        .catch(function(err) {
          done(null, false, { message: err });
        });
    }
  ));

  passport.serializeUser(function(user, done) {
    done(null, user.uid);
  });

  passport.deserializeUser(function(uid, done) {
    Users.get({uid: uid})
      .then(function(data) {
        done(null, data);
      })
      .catch(function(err) {
        done(err);
      });
  });
};