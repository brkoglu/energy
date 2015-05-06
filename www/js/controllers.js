angular.module('starter.controllers', ['angularSoap', 'starter.services'])

    .factory("testService", ['$soap',function($soap){
      //var base_url = "https://white-webservices.energieoptimierer.de";
      var base_url = "http://localhost:8100/api";

      return {
        HelloWorld: function(){
          return $soap.post(base_url + "/SwitchEnergySupplier.asmx","ListGlobalSuppliers", {"energyType": "Gas"});
        },
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

    .controller('MainFormCtrl', function($scope, testService) {
      $scope.plz = "";
      $scope.town = "";
      $scope.client = "Private";
      $scope.lbltown = false;

      $scope.filteredCompany={
        operator: '',
        tariffId: ''
      };
      $scope.operators = [];

      $scope.setPlz = function(word){
        if (word.length == 5){
          $scope.loader = true;

          testService.ListTownsWithOffer(word).then(function(response){
            if (response.toString() != ""){
              $scope.lbltown = true;
              $scope.town = response.toString();

              testService.ListDefaultSuppliers($scope.range.value.toString(), $scope.plz, "Gas",$scope.client, $scope.town).then(function(response){
                console.log(response);
                $scope.filteredCompany.operator = response[0].SupplierId;
                $scope.filteredCompany.tariffId = response[0].Tariffs[0].TariffId;
                $scope.operators = response;

                $scope.loader = false;
              });

            }
          });
        }
        else{
          $scope.loader = false;
          $scope.lbltown = false;
        }
      };


      $scope.range= {
        min:0,
        max:5000,
        value:2500
      };
    })

    .controller('BarCtrl', ['$scope', function($scope) {
      $scope.active = '2500';
      $scope.setActive = function(type) {
        $scope.range.value = type;
        $scope.active = type;
      };

    }])

    //.controller('LoadingCtrl', function($scope, $ionicLoading) {
    //  $scope.show = function() {
    //    $ionicLoading.show({
    //      template: 'Loading...'
    //    });
    //  };
    //  $scope.hide = function(){
    //    $ionicLoading.hide();
    //  };
    //})

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

      //testService.ListDefaultSuppliers().then(function(response){
      //  console.log(response);
      //  $scope.data = response;
      //});

      //testService.HelloWorld().then(function(response){
      //  console.log(response);
      //  $scope.data = response;
      //});
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

