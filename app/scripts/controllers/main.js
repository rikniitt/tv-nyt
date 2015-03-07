'use strict';

/**
 * @ngdoc function
 * @name tvNytApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the tvNytApp
 */
angular.module('tvNytApp')
    .controller('MainCtrl', function ($scope, Channel, Program, Settings) {
        var nFirstShown = 6,
            perRow = 6;

        function channelsPrepare(channels) {
            var rows = [];

            var enabled = Settings.takeEnabledChannels(channels);
            $scope.channels = Settings.sortChannelList(enabled);

            $scope.channels.forEach(function(channel) {
                channel.collapsed = true;
                channel.programs.forEach(function(program, i ,a) {
                    a[i].hidden = (i > nFirstShown);
                });
            });

            while ($scope.channels.length > 0) {
                rows.push($scope.channels.splice(0, perRow));
            }

            $scope.channels.rows = rows;
            $scope.colSize = 12 / perRow;
        }


        Channel.query(function(data) {
            channelsPrepare(data);
        });

        $scope.collapseToggle = function(channel) {
            channel.programs.forEach(function(program, i ,a) {
                a[i].hidden = (!channel.collapsed && i > nFirstShown);
            });
            channel.collapsed = !channel.collapsed;
        };

        $scope.sortableOptions = {
            items: '.row > .channel-col',
            placeholder: '.channel-col'
        };

        $scope.detailsToggle = function(program) {
            if (!program.details) {
                Program.get({ id: program.id }, function(data) {
                    program.details = data;
                    program.details.collapsed = false;
                });
            } else {
                program.details.collapsed = !program.details.collapsed;
            }
        };
    });
