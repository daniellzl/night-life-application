var express = require('express');
var router = express.Router();

// index
router.get('/', function(req, res) {
  res.render('index');
});

module.exports = router;
