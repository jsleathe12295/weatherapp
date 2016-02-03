'use strict';

/* Notes on forecast.io's API:
 *  - daily.data[0] is today
 */

weatherApp.constant('FORECASTIO_KEY', '23ecdce8d3b27ef562c7a1ccb5711b9f');

/* weatherStore holds data for weatherData service.
 */
weatherApp.factory('weatherStore', function() {
  var weatherStore = {
    current: {}
  };

  return weatherStore;
});



/* weatherData service gets weather data (current, forecasts, and
 * historical), processes it as necessary, and provides it to controllers.
 */
weatherApp.service('weatherData', ['$q', '$resource', '$http',
  'FORECASTIO_KEY', 'weatherStore',
  function($q, $resource, $http, FORECASTIO_KEY, weatherStore) {
    this.getCurrentWeather = function(lat, lng) {
      var url = 'https://api.forecast.io/forecast/' + FORECASTIO_KEY + "/" + lat + ',' + lng;
      console.log(url);
      // JSONP is only needed for "ionic serve".
      // Simpler $http.get(url) works on devices.
      return $http.jsonp(url + '?callback=JSON_CALLBACK').then(
        function success(resp) {
          weatherStore.current = resp.data;
          console.log('GOT CURRENT');
          console.dir(weatherStore.current);
          return resp.data;
        },
        function failure(error) {
          alert('Unable to get current conditions');
          console.error(error);
        });
    };

    this.getLocation = function() {
      return $q(function(resolve, reject) {
        navigator.geolocation.getCurrentPosition(function(position) {
          resolve({
            latitutde: position.coords.latitude,
            longitude: position.coords.longitude
          });
        }, function(err) {
          reject(err);
        });
      });
    };

    // TODO: move roundTemp into controller, since it is part of
    // presentation, not weather data.

    // Round temp to tenths of a degree.
    this.roundTemp = function(temp) {
      if (Math.abs(temp) >= 10) {
        return temp.toPrecision(3);
      } else {
        return temp.toPrecision(2);
      }
    };

    // Return current temperature
    this.tempNow = function() {
      return this.roundTemp(weatherStore.current.currently.temperature);
    };

    this.windSpeed = function() {
      return this.roundTemp(weatherStore.current.currently.windSpeed);
    };

    this.humidity = function() {
      return this.roundTemp(weatherStore.current.currently.humidity * 100);
    };

    this.visibility = function() {
      return this.roundTemp(weatherStore.current.currently.visibility);
    };

    this.summary = function() {
      return (weatherStore.current.currently.summary);
    };


    // Return tomorrow's high temperature.
    this.tempTomorrowHigh = function() {
      return this.roundTemp(weatherStore.current.daily.data[0].temperatureMax);
    };





    this.tempToMidnightLow = function() {
      var low = this.tempNow();
      var start = this.findHourNow();
      var end = this.findHourMidnight();
      if (start >= 0 && end >= 0) {
        for (var i = start; i <= end; i++) {
          low = Math.min(low,
            weatherStore.current.hourly.data[i].temperature);
        }
      }

      return this.roundTemp(low);
    };

    // Return the index into hourly of the hour, if any, which
    // contains time (unix time in sec).  Return -1 if not found.
    // Assume the time in hourly.data is the start of the hour.
    this.findHour = function(time) {
      var i = 0;
      while (i < weatherStore.current.hourly.data.length &&
        weatherStore.current.hourly.data[i].time > time) {
        i++;
      }
      if (i < weatherStore.current.hourly.data.length) {
        return i;
      } else {
        return -1;
      }
    };

    // Return findHour() (i.e., index into hourly) for current time.
    this.findHourNow = function() {
      return this.findHour(Date.now() / 1000); // millisec -> sec
    };

    // Return findHour() (i.e., index into hourly) for 11:50pm today.
    this.findHourMidnight = function() {
      var d = new Date();
      d.setHours(23);
      d.setMinutes(50); // 11:50pm today
      return this.findHour(d.getTime() / 1000); // millisec -> sec
    };
  }
]);

weatherApp.factory('LocationStore', function() {
  //create location store with default values
  var LocationStore = {
    city: 'Wenham',
    latitude: 42.589611,
    longitude: -70.819806
  };

  return LocationStore;
});
