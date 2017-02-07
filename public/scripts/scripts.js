$(document).ready(function() {

  $('body').hide().show(1500);

  // GO button pressed
  $('#button').click(function() {
    yelpSearch($('#location').val());
  });

  // enter key pressed
  $('#location').keypress(function(e) {
    if (e.which == 13) {
      yelpSearch($('#location').val());
    }
  });
});

/**********
Yelp Search
**********/

var yelpSearch = function(location) {

  // error check empty
  if (location === '') {
    $('.modal-body').html('<h3>Please enter a valid location.</h3>');
    $('.modal').modal();
  } else {

    // make a post request
    $.post('/search', { location: location }, function(data, status) {

      // take returned JSON from yelp and create HTML search results
      var html = '';

      // if nothing is found and error is returned
      if (data === 'error') {
        html += '<div class="text-center"><h3>No results found based on given location.</h3></div>';

        // else if search was successful
      } else {

        // create html to be added using results from search query
        for (var i = 0; i < data.businesses.length; i++) {
          html += '<div class="row"><div class="col-sm-10 col-md-10 col-lg-10"><div class="media"><div class="media-left"><a href="' + data.businesses[i].url + '" title="Go to Yelp entry"><img alt="Venue Image" src="' + data.businesses[i].image_url + '" class="img-rounded"></a></div><div class="media-body"><a href="' + data.businesses[i].url + '" title="Go to Yelp entry"><h3>' + data.businesses[i].name + '</h3><p>' + data.businesses[i].location.address[0] + ', ' + data.businesses[i].location.city + ', ' + data.businesses[i].location.state_code + ' ' + data.businesses[i].location.postal_code + '</p><p class="text-left">"' + data.businesses[i].snippet_text + '"</p></a></div></div></div><div class="col-sm-2 col-md-2 col-lg-2"><h5 id=' + data.businesses[i].id + '>People Going: ' + data.businesses[i].going + '</h5><button class="status btn" title="Add/Remove me to the number of people going" onclick="update(' + "'" + data.businesses[i].id + '&' + data.latitude + '&' + data.longitude + "'" + ')">Add/Remove Me</button></div></div>';
        }
      }

      // add result to page
      return $('#result').empty().hide().html(html).show(1500);

    });
  }
};

/****************************
Facebook Javascript SDK Login
****************************/

window.fbAsyncInit = function() {
  FB.init({
    appId: '172088366601280',
    cookie: true,
    xfbml: true,
    version: 'v2.6'
  });
};

(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s);
  js.id = id;
  js.src = "//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.8&appId=172088366601280";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

// facebook login callback function
function statusChangeCallback(response) {
  if (response.status === 'connected') {
    return 'connected';
  } else {
    return 'not connected';
  }
}

/**************************
UPDATE USER ATTENDEE STATUS
**************************/
function update(string) {

  // parse string
  var array = string.split('&');
  var yelpID = array[0];
  var latitude = array[1];
  var longitude = array[2];

  // check facebook login status
  FB.getLoginStatus(function(response) {
    var status = statusChangeCallback(response);

    // user is logged in
    if (status === 'connected') {

      // check to see how many people are going and update
      $.post('/update', { yelpID: yelpID, latitude: latitude, longitude: longitude, userID: response.authResponse.userID }, function(data, status) {

        // display result
        $('#' + yelpID).text('People Going: ' + data);

        // notify user
        $('.modal-body').html('<h3>Your attendee status has been updated.</h3>');
        $('.modal').modal();
      });

      // user is logged out
    } else {
      $('.modal-body').html('<h3>Please login to Facebook before adding/removing yourself.</h3>');
      $('.modal').modal();
    }
  });
}

