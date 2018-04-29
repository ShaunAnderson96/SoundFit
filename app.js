/**
 * DISCLAIMER - USING SPOTIFY API AND FITBIT API TO RETRIEVE DATA
 * NOT FOR COMMERICAL USE
 * NO PROFIT ACHIEVED
 * NO COPYRIGHT INTENDED
 */

var spotexpress = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var querystring = require('querystring');
var cookieParser = require('cookie-parser');

var client_id = '23e431d3924543c3b3417b4ecc27cbcb'; // Spotify Client ID
var client_secret = 'c06c88d08e6c443099346b62586714ce'; // Spotify Client Secret
var redirect_uri = 'http://localhost:5000/callback'; // Redirect URI

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = spotexpress();

app.use(spotexpress.static(__dirname + '/public'))
   .use(cookieParser());

app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  var scope = 'user-read-private user-read-email';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});


app.get('/callback', function(req, res) {

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };
         // use the access token to access the Spotify Web API
         request.get(options, function(error, response, body) {
          
        });

        var songs = {
          url: 'https://api.spotify.com/v1/tracks?ids=7ouMYWpwJ422jRcDASZB7P,4VqPOruhp5EdPBeR92t6lQ,2takcwOaAZWiXQijPHIx7B',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        }

        request.get(songs, function(error, response, body) {
          
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

console.log('Server started on port 5000');
app.listen(5000);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//FITBIT CODE

const express = require("express");
const fitapp = express();

// initialize the Fitbit API 
const FitbitApiClient = require("fitbit-node");
const client = new FitbitApiClient({
	clientId: "22CVC2",
	clientSecret: "273cb9d910ad74ad4367714e6b8ea859",
	apiVersion: '1.2' 
});

// redirect the user to the Fitbit authorization page
fitapp.get("/authorize", (req, res) => {
	// request access to the user's heartrate and redirect to port 5001
	res.redirect(client.getAuthorizeUrl('heartrate', 'http://localhost:5001/callback'));
});

// handle the callback from the Fitbit 
fitapp.get("/callback", (req, res) => {
	// exchange the authorization code received for an access token
	client.getAccessToken(req.query.code, 'http://localhost:5001/callback').then(result => {
    // use the access token to get the user's profile information
      client.get("/activities/heart/date/today/1d/1min.json", result.access_token).then(results => {
      res.send(results[0]);
      
      
		}).catch(err => {
			res.status(err.status).send(err);
    });
    
	}).catch(err => {
		res.status(err.status).send(err);
	});
});


// launch the server
fitapp.listen(5001);
console.log("Server started on port 5001");