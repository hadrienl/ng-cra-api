var express = require('express'),
    router = express.Router(),
    authrequired = require('./authrequired'),
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

router.get('/', /*authrequired,*/ getProjects);

module.exports = router;
