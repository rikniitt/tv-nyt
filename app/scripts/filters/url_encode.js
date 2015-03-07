'use strict';

angular
    .module('tvNytApp')
    .filter('urlDecode', function() {
        return function(str) {
            return decodeURIComponent(str);
        };
    })
    .filter('urlEncode', function() {
        return function(str) {
            return encodeURIComponent(str);
        };
    });