var process = require('process');
var express = require('express');
var wizard = require('../index');

var app = express();

app.get('/overpass-wizard', function(req, res) {
  // parse boolean values
  Object.keys(req.query).forEach(function(key) {
    if (req.query[key] === 'false') {
      req.query[key] = false;
    } else if (req.query[key] === 'true') {
      req.query[key] = true;
    }
  });

  // run overpass-wizard and send results
  var result = wizard(req.query.search, req.query);
  res.set('Content-Type', 'text/plain')
  res.send(result);
});

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log('overpass-wizard-server is running on port ' + port);
});
