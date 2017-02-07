var express = require('express');
var bodyParser = require('body-parser');
var Yelp = require('yelp');
var expressSanitizer = require('express-sanitizer');
var Venue = require('../models/venue.js');
var router = express.Router();
require('dotenv').config();

// yelp search
router.post('/', function(req, res) {

  // save search location
  var location = req.sanitize(req.body.location);

  // set yelp parameters
  var yelp = new Yelp({
    consumer_key: process.env.YELP_CONSUMER_KEY,
    consumer_secret: process.env.YELP_CONSUMER_SECRET,
    token: process.env.YELP_TOKEN,
    token_secret: process.env.YELP_TOKEN_SECRET,
  });

  // query yelp api
  yelp.search({ term: 'night life', location: location })
    .then(function(data) {

      // save yelp results
      var yelpResults = {};
      yelpResults.businesses = data.businesses;
      yelpResults.latitude = data.region.center.latitude.toFixed(1);
      yelpResults.longitude = data.region.center.longitude.toFixed(1);

      // collect yelp ids from results
      var ids = [];
      for (var a = 0, b = yelpResults.businesses.length; a < b; a++) {
        ids.push(yelpResults.businesses[a].id);
      }

      // find all result matches from database
      Venue.find({ yelpID: { $in: ids } }, function(err, venues) {
        if (err) return console.error(err);

        // if no matches
        if (venues.length === 0) {

          // append 0 people going to all
          for (var g = 0, h = yelpResults.businesses.length; g < h; g++) {
            yelpResults.businesses[g].going = 0;
          }

          // if matched    
        } else {

          // append number of people going
          for (var c = 0, d = yelpResults.businesses.length; c < d; c++) {
            for (var e = 0, f = venues.length; e < f; e++) {
              if (yelpResults.businesses[c].id === venues[e].yelpID) {
                yelpResults.businesses[c].going = venues[e].users.length;
                break;
              } else {
                yelpResults.businesses[c].going = 0;
              }
            }
          }
        }

        // return results
        return res.json(yelpResults);
      });
    })

  // if error occurs
  .catch(function(err) {
    return res.send('error');
  });
});

module.exports = router;
