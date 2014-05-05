var passport = require('passport'),
    express = require('express'),
    router = express.Router(),
    authrequired = require('./authrequired');

require('../src/auth/local')(passport);

function login(req, res, next) {
  passport.authenticate(
    'local', function(err, user, info) {
      if (err) { return next(err); }
      if (!user) { return res.json({error: 'Wrong credentials'}); }
      req.logIn(user, function(err) {
        if (err) { return next(err); }
        return res.json(req.user);
      });
    }
  )(req, res, next);
}

function logout(req, res, next) {
  req.logout();
  res.json({user: false});
}

function test(req, res, next) {
  res.json(req.user);
}

router.post('/login', login);
router.get('/logout', authrequired, logout);
router.get('/test', authrequired, test);

module.exports = router;
