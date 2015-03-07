'use strict';

/**
 * @ngdoc function
 * @name tvNytApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the tvNytApp
 */
angular.module('tvNytApp')
    .controller('AboutCtrl', function ($scope) {
        $scope.year = (new Date()).getFullYear();
    });
