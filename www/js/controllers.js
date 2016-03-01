/* This simple app has only one view, and so only one controller.
 * Its job is to provide data (from the weatherData service) for display
 * by the html page (index.html).
 */

weatherApp.controller('MainCtrl', ['$scope', '$state', 'weatherData',  'LocationStore', function($scope, $state, weatherData, LocationStore) {
  //read default settings into scope
  console.log('inside home');
  $scope.city = LocationStore.city;
  var latitude = LocationStore.latitude;
  var longitude = LocationStore.longitude;

  //call getCurrentWeather method in factory
  var weatherInit = function(lat, lng) {
    weatherData.getCurrentWeather(latitude, longitude).then(function(resp) {
      $scope.place = resp;

      $scope.tempCurrent = weatherData.tempNow();
      $scope.tempTomorrowHigh = weatherData.tempTomorrowHigh();
      $scope.tempTonightLow = weatherData.tempToMidnightLow();
      $scope.humidity = weatherData.humidity();
      $scope.windSpeed = weatherData.windSpeed();
      $scope.visibility = weatherData.visibility();
      $scope.summary = weatherData.summary();


    });
  };
  $scope.days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  $scope.getWeek = function() {
    var week = [];
    var today = $scope.days[(new Date()).getDay()];
    for (var i = 1; i < 8; i++) {
      week.push($scope.days[((new Date()).getDay() + i) % 7]);
    }
    return week;
  };
  $scope.temperatureUnitChange = function(item) {
      celsius = !UnitsFactory.getTempUnit();

      //save
      UnitsFactory.saveTempUnit(celsius);

      //today
      weather.forecast.today.currentTemp = InvertUnitsFactory.invertTempUnit(weather.forecast.today.currentTemp);

      //week
      weather.forecast.week.forEach(function(day) {
          day.high = InvertUnitsFactory.invertTempUnit(day.high);
          day.low = InvertUnitsFactory.invertTempUnit(day.low);
      });
  };
  $scope.getLatLngAndWeather = function(zipCode) {
    if (!zipCode || zipCode.length < 5) return;
    $scope.zip = zipCode;
    $http.get('http://maps.googleapis.com/maps/api/geocode/json?address=' + zipCode)
      .then(function(data) {
        setActiveDay(0);
        var lat = data.data.results[0].geometry.location.lat;
        var lng = data.data.results[0].geometry.location.lng;
        var address = data.data.results[0].formatted_address.replace(/,/g, "").split(" ");
        var city = address[0];
        var state = address[1];
        if (state.length > 0 && state.length < 3) $scope.weather.city = city + ', ' + state;
        else $scope.weather.city = city;
        $scope.getWeather(lat, lng);
      }).catch(function(err) {
        console.log(err);
      });
  };

  $scope.getZip = function(lat, lng) {
    $http.get('http://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat + ',' + lng + '&sensor=true')
      .then(function(data) {
        $scope.zip = data.data.results[2].address_components[0].long_name; //long_name
        var city = data.data.results[1].address_components[0].long_name; //city
        var state = data.data.results[1].address_components[2].short_name; //state
        if (state.length > 0 && state.length < 3) $scope.weather.city = city + ', ' + state;
        else $scope.weather.city = city;
      }).catch(function(err) {
        console.log(err);
      });
  }


  weatherData.getLocation() // getLocation returns the position obj
    .then(function(position) {
      weatherInit(position.latitutde, position.longitude);
    }, function(err) {
      console.log(err);
      weatherInit(latitude, longitude);
    });

}]);
