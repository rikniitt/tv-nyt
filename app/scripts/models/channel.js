'use strict';

angular.module('tvNytApp').factory('Channel', function($resource) {
    var protocol = document.location.protocol,
        host = document.location.hostname;
    return $resource(protocol + '//' + host +':9090/channels/:id');
});
