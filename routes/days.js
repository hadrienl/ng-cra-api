var express = require('express'),
    router = express.Router(),
    authrequired = require('./authrequired'),
    Days = require('../src/models/days');

function getDays(req, res, next) {
  var from = req.query.from,
    to = req.query.to;

  if (!from && !to) {
    from = new Date();
    from.setDate(1);
    to = new Date();
    to.setDate(1);
    to.setMonth(from.getMonth() + 1);
    to = new Date(to - 1000 * 60 * 60 * 24);
  } else {
    from = new Date(from);
    to = new Date(to);
  }

  if (isNaN(from.getTime())) {
    return res.json(400, {
      code: 10001,
      message: '`from` and `to` must be valid dates'
    });
  }

  if (isNaN(to.getTime())) {
    to = from;
  }

  Days.query({
      from: from,
      to: to
    })
  .then(function(data) {
    res.json(data);
  })
  .catch(function(err) {
    res.json(500, err);
  });
}

router.get('/', authrequired, getDays);

module.exports = router;
