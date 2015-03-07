'use strict';

/**
 * @ngdoc function
 * @name tvNytApp.controller:SettingsCtrl
 * @description
 * # SettingsCtrl
 * Controller of the tvNytApp
 */
angular.module('tvNytApp')
    .controller('SettingsCtrl', function ($scope, Channel, Settings) {

        var saveSettings = function() {
            Settings.setSavedChannelList($scope.channelList);
        };
        
        // Fetch fresh list of channels
        Channel.query(function(data) {

            var channelList = [],
                savedList = Settings.getSavedChannelList();

            // Build settings list defaults
            data.forEach(function(c) {
                var channel = {};
                channel.disabled = false;
                channel.name = c.channelname;

                channelList.push(channel);
            });

            // Loop fresh list if some one is new
            channelList.forEach(function(e1, i1, a1) {
                var found = false;
                savedList.forEach(function(e2, i2, a2) {
                    if (a1[i1].name === a2[i2].name) {
                        found = true;
                    }
                });
                if (!found) {
                    savedList.push(e1);
                }
            });

            $scope.channelList = savedList;
        });

        $scope.disableToggle = function(channel) {
            channel.disabled = !channel.disabled;
            saveSettings();
        };

        $scope.sortableOptions = {
            stop: function() {
                saveSettings();
            }
        };

    });
