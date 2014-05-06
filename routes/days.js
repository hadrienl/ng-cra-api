var express = require('express'),
    router = express.Router(),
    authrequired = require('./authrequired'),
    Days = require('../src/models/days');

function getDaysFromCurrentMonth(req, res, next) {
  var now = new Date(),
    currentmonth = new Date(now.getFullYear(), now.getMonth(), 1);

  Days.get({
      uid: req.user.uid,
      month: currentmonth
    })
    .then(function(data) {
      res.send(data);
    })
    .catch(function(err) {
      res.send(500, err);
    });
}

function getDaysFromMonth(req, res, next) {
  var month = req.params.month;

  if (!month.match(/^[0-9]{4}\-[0-9]{2}$/)) {
    return res.send(400, 'Wrong date format');
  }

  month = new Date(month);

  Days.get({
      uid: req.user.uid,
      month: month
    })
    .then(function(data) {
      res.send(data);
    })
    .catch(function(err) {
      res.send(500, err);
    });
}

function saveDay(req, res, next) {
  var date = req.params.date;

  if (!date.match(/^[0-9]{4}\-[0-9]{2}\-[0-9]{2}$/)) {
    return res.send(400, 'Wrong date format');
  }

  var day = new Days(req.body);
  day.uid = req.user.uid;
  day.date = new Date(date);
  day.$save()
    .then(function(data) {
      res.json(data);
    })
    .catch(function(err) {
      res.send(500, err);
    });
}


router.get('/', authrequired, getDaysFromCurrentMonth);
router.get('/:month', authrequired, getDaysFromMonth);
router.post('/:date', authrequired, saveDay);

module.exports = router;
