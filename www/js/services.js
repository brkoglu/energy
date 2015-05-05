/**
 * Created by BRKOGLU on 29.04.2015.
 */
angular.module('starter.services', [])

////NOTE: We are including the constant `ApiEndpoint` to be used here.
//    .factory('Api', function($http, ApiEndpoint) {
//        console.log('ApiEndpoint', ApiEndpoint)
//
//        var getApiData = function() {
//            return $http.get(ApiEndpoint.url + '/Burak')
//                .then(function(data) {
//                    console.log('Got some data: ', data);
//                    return data;
//                });
//        };
//
//        return {
//            getApiData: getApiData
//        };
//    })