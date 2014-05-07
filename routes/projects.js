var express = require('express'),
    router = express.Router(),
    authrequired = require('./authrequired'),
    adminrequired = require('./adminrequired'),
    Projects = require('../src/models/projects');

function getProjects(req, res, next) {
  Projects.get()
    .then(function(data) {
      res.json(data);
    })
    .catch(function(err) {
      res.send(500, err);
    });
}

function addProjects(req, res, next) {
  Projects.create(req.body)
    .then(function(data) {
      res.json(data);
    })
    .catch(function(err) {
      res.send(500, err.message || err);
    });
}

router.get('/', authrequired, getProjects);
router.post('/', adminrequired, addProjects);

module.exports = router;
