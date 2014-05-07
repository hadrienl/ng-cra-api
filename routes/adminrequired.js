module.exports = [function(req, res, next) {
  if (req.user) {
    req.user.isAdmin()
      .then(function(data) {
        if (true === data) {
          next();
        } else {
          res.send(403);
        }
      });
  } else {
    return res.send(401);
  }
}];