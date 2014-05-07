var passport = require('passport'),
    express = require('express'),
    router = express.Router(),
    Users = require('../src/models/users'),
    adminrequired = require('./adminrequired');

function addUser(req, res, next) {
  Users.create(req.body)
    .then(function(data) {
      res.json(data);
    })
    .catch(function(err) {
      res.send(500, err.message || err);
    });
}

function setAdmin(req, res, next) {
  var admin = !!req.body.admin;

  Users.get({uid: req.params.uid})
    .then(function(user) {
      return user.setAdmin(admin);
    })
    .then(function(data) {
      res.json({
        admin: admin
      });
    })
    .catch(function(err) {
      res.send(500, err.message || err);
    });
}

router.post('/', adminrequired, addUser);
router.post('/:uid/setadmin', adminrequired, setAdmin);

module.exports = router;
