var express = require('express'),
  router = express.Router(),
  Users = require('../src/models/users'),
  authrequired = require('./authrequired'),
  adminrequired = require('./adminrequired');

function getCurrentUser(req, res) {
  res.json(req.user);
}

function getUserByUid(req, res) {
  Users.get({uid: req.params.uid})
    .then(function (user) {
      return user;
    })
    .catch(function (err) {
      res.send(500, err.message || err);
    });
}

function addUser(req, res, next) {
  Users.create(req.body)
    .then(function (data) {
      res.json(data);
    })
    .catch(function (err) {
      res.send(500, err.message || err);
    });
}

function updateUser(req, res, next) {
  Users.update(req.body)
    .then(function (data) {
      res.json(data);
    })
    .catch(function (err) {
      res.send(500, err.message || err);
    });
}

function setAdmin(req, res, next) {
  var admin = !!req.body.admin;

  Users.get({uid: req.params.uid})
    .then(function (user) {
      return user.setAdmin(admin);
    })
    .then(function (data) {
      res.json({
        admin: admin
      });
    })
    .catch(function (err) {
      res.send(500, err.message || err);
    });
}

function checkUsername(req, res) {
  if (!req.params.username) {
    res.send(500, new Error('Bad params'));
  }
  Users.checkUsername(req.params.username)
    .then(function (data) {
      res.json(data);
    })
    .catch(function (err) {
      res.send(500, err.message || err);
    });
}

router.get('/:uid', adminrequired, getUserByUid);
router.get('/', authrequired, getCurrentUser);
router.post('/', adminrequired, addUser);
router.put('/:uid', authrequired, updateUser);
router.post('/:uid/setadmin', adminrequired, setAdmin);
router.get('/username/exists/:username', authrequired, checkUsername);

module.exports = router;
