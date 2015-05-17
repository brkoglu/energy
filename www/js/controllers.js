angular.module('starter.controllers', ['angularSoap', 'starter.services','ui.router'])

    .factory("testService", ['$soap',function($soap){
      //var base_url = "https://white-webservices.energieoptimierer.de";
      var base_url = "http://localhost:8100/api";

      return {
        ListDefaultSuppliers: function(yearlyUsage, plz,energyType , customerType, townName){
          return $soap.post(base_url + "/SwitchEnergySupplier.asmx","ListDefaultSuppliers",
              {
                "yearlyUsage": yearlyUsage,
                "postalCode": plz,
                "energyType": energyType,
                "customerType": customerType,
                "townName" : townName
              });
        },
        ListTownsWithOffer: function( plz ){
          return $soap.post(base_url + "/SwitchEnergySupplier.asmx","ListTownsWithOffer",
              {
                "yearlyUsage": "1",
                "postalCode": plz
              });
        },
        ListGlobalSuppliers: function( ){
          return $soap.post(base_url + "/SwitchEnergySupplier.asmx","ListGlobalSuppliers",
              {
                "energyType": "Gas"
              });
        },
        ListOfferedSuppliersWithDate: function(yearlyUsage, plz,energyType , customerType, townName, datum){
          return $soap.post(base_url + "/SwitchEnergySupplier.asmx","ListOfferedSuppliersWithDate",
              {
                "yearlyUsage": yearlyUsage,
                "postalCode": plz,
                "energyType": energyType,
                "customerType": customerType,
                "townName" : townName,
                "offeredDate" : datum
              });
        },

        // Mit logo
        ListOfferedSuppliers: function(){
          return $soap.post(base_url + "/SwitchEnergySupplier.asmx","ListOfferedSuppliers",
              {
                "yearlyUsage": "2000",
                "postalCode": "42853",
                "energyType": "Electricity",
                "customerType": "Private",
                "townName" : "Remscheid"
              });
        }
      }
    }])

    .service('productService', function($filter) {
      var productList = [];
      var calculated = [];

      var propertyObject = [];


      var addProduct = function(newObj) {
        productList = [];
        productList.push(newObj);
        console.log(productList)
        calculatedProducts();
      };

      var getProducts = function(){
        console.log(calculated);
        return calculated;

      };

      var addProperty = function(propName,newObj) {
        propertyObject[propName] = newObj
      };

      var getProperty = function(propName){
        return propertyObject[propName];
      };

      var calculatedProducts = function(){
        calculated = [];
        var _calculated = [];

        angular.forEach(productList[0], function(value, key) {
          if (value.Tariffs.length > 0)
          {
            var mainTariff = clone(value);
            delete mainTariff["Tariffs"];

            angular.forEach(value.Tariffs, function(tariff_value, tariff_key) {
              //console.log(tariff_value.Name);
              function getCostValues (tariff_value){
                tariff_value.Cost["Grundpreis"] = parseFloat(tariff_value.Cost.BaseCost) / 12;
                tariff_value.Cost["Arbeitspreis"] = (parseFloat(tariff_value.Cost.UnitCost) / propertyObject["range"]) * 100;
                tariff_value.Cost["KostenJahr"] =  (parseFloat(tariff_value.Cost.UnitCost) +  parseFloat(tariff_value.Cost.BaseCost)) - parseFloat(tariff_value.Cost.TotalRabat);

                return tariff_value;
              }
              //console.log(tariff_value.Name);

              var singleTariffObject = clone(mainTariff);
              singleTariffObject["TariffName"] = tariff_value.Name;

              singleTariffObject["Tariff"] = getCostValues(tariff_value);

              _calculated.push(singleTariffObject);
            });
          }
          //for (var i = 0; i < _calculated.length; i++){
          //  console.log(_calculated[i].TariffName);
          //}
        });

        var temp = $filter('unique')(_calculated,"TariffName");
        calculated = $filter('orderBy')(temp, "Tariff.Cost.KostenJahr", false);


      };

      return {
        addProduct: addProduct,
        getProducts: getProducts,
        addProperty: addProperty,
        getProperty: getProperty
      };
    })

    .controller('SearchResults', function ($scope, productService) {
      $scope.resultData = productService.getProducts();
      $scope.range = productService.getProperty("range");

    })

    .controller('MainFormCtrl', function($scope, testService, $state, productService) {

      $scope.plz = "";
      $scope.town = "";
      $scope.client = "Private";
      $scope.lbltown = false;

      $scope.operators= [];
      $scope.selectedCompany = "";

      $scope.date = new Date();
      $scope.date.setDate($scope.date.getDate() - 1);

      $scope.setPlz = function(word){
        if (word.length == 5){
          $scope.loader = true;

          testService.ListTownsWithOffer(word).then(function(response){
            if (response.toString() != ""){
              $scope.lbltown = true;
              $scope.town = response.toString();

              $scope.getSearchResult();

              testService.ListDefaultSuppliers($scope.range.value.toString(), $scope.plz, "Gas",$scope.client, $scope.town).then(function(response){
                $scope.operators = response;
                $scope.selectedCompany = response[0];
                $scope.selectedTariff = response[0].Tariffs[0];

                testService.ListGlobalSuppliers().then(function(response){
                  $scope.operators = $scope.operators.concat(response);
                  $scope.loader = false;
                });

              });
            }
          });
        }
        else
        {
          $scope.loader = false;
          $scope.lbltown = false;
        }
      };

      $scope.clickSearch = function () {
        $state.go('app.results');
      };

      $scope.range= {
        min:0,
        max:5000,
        value:2500
      };

      $scope.getSearchResult = function() {

        $scope.date = new Date();
        $scope.date.setDate($scope.date.getDate() - 1);

        if ($scope.plz.length == 5){
          testService.ListOfferedSuppliersWithDate($scope.range.value.toString(), $scope.plz, "Gas",$scope.client, $scope.town, $scope.date).then(function(response){
            productService.addProperty("range", $scope.range.value);
            productService.addProduct(response);

            var resultData = productService.getProducts();
            $scope.searchResultCountsText = "(" + resultData.length + " Treffer)";
            //console.log($scope.resultData);
          });
        }

      };
    })

    .controller('BarCtrl', function($scope, productService) {
      $scope.active = '2500';
      $scope.setActive = function(type) {
        $scope.range.value = type;
        $scope.active = type;
      };
    })

    .filter('unique', function() {
      return function (arr, field) {
        var o = {}, i, l = arr.length, r = [];
        for(i=0; i<l;i+=1) {
          o[arr[i][field]] = arr[i];
          //console.log(arr[i][field] )
        }
        for(i in o) {
          r.push(o[i]);
        }
        return r;
      };
    })

    .filter('split', function() {
      return function(input, splitChar, splitIndex) {
        // do some bounds checking here to ensure it has that index
        return input.split(splitChar)[splitIndex];
      }
    })

    .controller('WebserviceCtrl', function($scope, testService) {
      testService.ListOfferedSuppliers().then(function(response){
        console.log(response);
        $scope.data = response;
      });

    })

//angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {
  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

.controller('PlaylistsCtrl', function($scope) {
  $scope.playlists = [
    { title: 'Test', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})

.controller('PlaylistCtrl', function($scope, $stateParams) {

});

function clone(obj) {
  if (null == obj || "object" != typeof obj) return obj;
  var copy = obj.constructor();
  for (var attr in obj) {
    if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
  }
  return copy;
}