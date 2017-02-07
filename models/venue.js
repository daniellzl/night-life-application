var mongoose = require('mongoose');

var venueSchema = new mongoose.Schema({
  yelpID: String,
  users: [String],
  latitude: Number,
  longitude: Number,
  createdAt: { type: Date, default: Date.now },
  expireAt: { type: Date, default: undefined, expires: 0 }
});

module.exports = mongoose.model('venue', venueSchema);
