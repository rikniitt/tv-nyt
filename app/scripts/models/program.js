'use strict';

angular.module('tvNytApp').factory('Program', function($resource) {
    var protocol = document.location.protocol,
        host = document.location.hostname;
    return $resource(protocol + '//' + host +':9090/programs/:id');
});
