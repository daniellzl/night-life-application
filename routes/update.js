var express = require('express');
var bodyParser = require('body-parser');
var http = require('http');
var Venue = require('../models/venue.js');
var router = express.Router();
require('dotenv').config();

// update user attendee status
router.post('/', function(req, res) {

  // save yelpID and userID
  var yelpID = req.body.yelpID;
  var latitude = req.body.latitude;
  var longitude = req.body.longitude;
  var userID = req.body.userID;

  // find all yelpID venue matches from database
  Venue.findOne({ yelpID: yelpID }, function(err, dbResults) {
    if (err) return console.error(err);

    // no yelpID venue matches
    if (dbResults === null) {

      // get local time from search location
      // http.get() is a nodeJS method
      http.get("http://api.geonames.org/timezoneJSON?lat=" + latitude + "&lng=" + longitude + "&username=" + process.env.GEONAMES_API_USERNAME, function(response) {

        // calculate 4-5 AM local time for venue information to expire
        response.on('data', function(data) {
          var object = JSON.parse(data);
          var localTime = new Date(object.time);
          var currentTime = new Date();
          var expirationTime = new Date();
          expirationTime.setHours(currentTime.getHours() + (28 - localTime.getHours()));

          // create new venue and save
          var newVenue = new Venue({
            yelpID: yelpID,
            users: [userID],
            latitude: latitude,
            longitude: longitude,
            createdAt: currentTime,
            expireAt: expirationTime
          });
          newVenue.save(function(err) {
            if (err) throw err;

            // return result to script
            return res.send(newVenue.users.length.toString());
          });
        });

        response.on('error', console.error);
      }).on('error', console.error);

      // yelpID venue matched
    } else {

      // find userID match
      var counter = 0;
      var arrayLength = dbResults.users.length;
      for (var i = 0; i < arrayLength; i++) {

        // if userID matched, delete user
        if (dbResults.users[i] === userID) {
          dbResults.users.splice(i, 1);
          break;
        }
        counter++;
      }

      // if no userID match, add user to venue
      if (counter === arrayLength) {
        dbResults.users.push(userID);
      }

      // save document
      dbResults.save(function(err) {
        if (err) throw err;

        // return result to script
        return res.send(dbResults.users.length.toString());
      });
    }
  });
});

module.exports = router;
