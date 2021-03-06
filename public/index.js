window.onload = function(){
spotify();
fitbit();
}
function spotify() {

    /**
     * Obtains parameters from the hash of the URL
     * @return Object
     */
    function getHashParams() {
      var hashParams = {};
      var e, r = /([^&;=]+)=?([^&;]*)/g,
          q = window.location.hash.substring(1);
      while ( e = r.exec(q)) {
         hashParams[e[1]] = decodeURIComponent(e[2]);
      }
      return hashParams;
    }

    var userProfileSource = document.getElementById('user-profile-template').innerHTML,
        userProfileTemplate = Handlebars.compile(userProfileSource),
        userProfilePlaceholder = document.getElementById('user-profile');

    // var oauthSource = document.getElementById('oauth-template').innerHTML,
    //     oauthTemplate = Handlebars.compile(oauthSource),
    //     oauthPlaceholder = document.getElementById('oauth');

    var params = getHashParams();

    var access_token = params.access_token,
        refresh_token = params.refresh_token,
        error = params.error;

    if (error) {
      alert('There was an error during the authentication');
    } else {
      if (access_token) {
        // render oauth info
        // oauthPlaceholder.innerHTML = oauthTemplate({
        //   access_token: access_token,
        //   refresh_token: refresh_token
        // });

        $.ajax({
            url: 'https://api.spotify.com/v1/me',
            headers: {
              'Authorization': 'Bearer ' + access_token
            },
            success: function(response) {
              userProfilePlaceholder.innerHTML = userProfileTemplate(response);

              $('#login').hide();
              $('#loggedin').show();
            }
        });
      } else {
          // render initial screen
          $('#login').show();
          $('#loggedin').hide();
      }

      // document.getElementById('obtain-new-token').addEventListener('click', function() {
      //   $.ajax({
      //     url: '/refresh_token',
      //     data: {
      //       'refresh_token': refresh_token
      //     }
      //   }).done(function(data) {
      //     access_token = data.access_token;
      //     oauthPlaceholder.innerHTML = oauthTemplate({
      //       access_token: access_token,
      //       refresh_token: refresh_token
      //     });
      //   });
      // }, false);
    }
  }
//////////////////////////////////////////
//FITBIT JAVASCRIPT
function fitbit(){
  'use strict';
  const OAuth2 = require('simple-oauth2').create;
  const Request = require('request');
  
  module.exports = class FitbitApiClient {
    constructor({clientId, clientSecret, apiVersion = '1.2'}) {
      this.apiVersion = apiVersion;
      this.oauth2 = OAuth2({
        client: {
          id: clientId,
          secret: clientSecret
        },
        auth: {
          tokenHost: 'https://api.fitbit.com/',
          tokenPath: 'oauth2/token',
          revokePath: 'oauth2/revoke',
          authorizeHost: 'https://api.fitbit.com/',
          authorizePath: 'oauth2/authorize'
        },
        options: {
          useBasicAuthorizationHeader: true
        }
      });
    }
  
    getUrl(path, userId){
      let userSubPath = userId === false ? '' : `/user/${userId || '-'}`;
      return `https://api.fitbit.com/${this.apiVersion}${userSubPath}${path}`;
    }
  
    mergeHeaders(accessToken, extraHeaders) {
      const headers = {
        Authorization: 'Bearer ' + accessToken
      };
      if (typeof extraHeaders !== "undefined" && extraHeaders) {
        for (let attr in extraHeaders) {
          if (extraHeaders.hasOwnProperty(attr)) {
            headers[attr] = extraHeaders[attr];
          }
        }
      }
      return headers;
    }
  
    getAuthorizeUrl(scope, redirectUrl, prompt, state) {
      return this.oauth2.authorizationCode.authorizeURL({
        scope: scope,
        redirect_uri: redirectUrl,
        prompt: prompt,
        state: state
      }).replace('api', 'www');
    }
  
    getAccessToken(code, redirectUrl) {
      return new Promise((resolve, reject) => {
        this.oauth2.authorizationCode.getToken({
          code: code,
          redirect_uri: redirectUrl
        }, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      });
    }
  
    refreshAccessToken(accessToken, refreshToken, expiresIn) {
      return new Promise((resolve, reject) => {
        if (expiresIn === undefined) expiresIn = -1;
        const token = this.oauth2.accessToken.create({
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_in: expiresIn
        });
        token.refresh((error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result.token);
          }
        });
      });
    }
  
    revokeAccessToken(accessToken) {
      return new Promise((resolve, reject) => {
        const token = this.oauth2.accessToken.create({
          access_token: accessToken,
          refresh_token: '',
          expires_in: ''
        });
        token.revoke('access_token', (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      });
    }
  
    get(path, accessToken, userId, extraHeaders) {
      return new Promise((resolve, reject) => {
        Request({
          url: this.getUrl(path, userId),
          method: 'GET',
          headers: this.mergeHeaders(accessToken, extraHeaders),
          json: true
        }, (error, response, body) => {
          if (error) {
            reject(error);
          } else {
            resolve([
              body,
              response
            ]);
          }
        });
      });
    }
  
    post(path, accessToken, data, userId, extraHeaders) {
      return new Promise((resolve, reject) => {
        Request({
          url: this.getUrl(path, userId),
          method: 'POST',
          headers: this.mergeHeaders(accessToken, extraHeaders),
          json: true,
          form: data
        }, (error, response, body) => {
          if (error) {
            reject(error);
          } else {
            resolve([
              body,
              response
            ]);
          }
        });
      });
    }
  
    put(path, accessToken, data, userId, extraHeaders) {
      return new Promise((resolve, reject) => {
        Request({
          url: this.getUrl(path, userId),
          method: 'PUT',
          headers: this.mergeHeaders(accessToken, extraHeaders),
          json: true,
          form: data
        }, (error, response, body) => {
          if (error) {
            reject(error);
          } else {
            resolve([
              body,
              response
            ]);
          }
        });
      });
    }
  
    delete(path, accessToken, userId, extraHeaders) {
      return new Promise((resolve, reject) => {
        Request({
          url: this.getUrl(path, userId),
          method: 'DELETE',
          headers: this.mergeHeaders(accessToken, extraHeaders),
          json: true
        }, (error, response, body) => {
          if (error) {
            reject(error);
          } else {
            resolve([
              body,
              response
            ]);
          }
        });
      });
    }
  };
  
    }
  
  

