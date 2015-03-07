'use strict';

angular.module('tvNytApp').factory('Settings', function($cookies) {
    var API = {},
        Storage = {}; 

    if ('localStorage' in window && window.localStorage !== null) {
        // Use local storage if supported
        Storage.get = function(key) {
            return localStorage.getItem(key);
        };
        Storage.set = function(key, value) {
            localStorage.setItem(key, value);
        };
        Storage.unset = function(key) {
            localStorage.removeItem(key);
        };
    } else {
        // Fallback, use cookies.
        // ($cookies is supposed to be lib with get, put and etc?)
        Storage.get = function(key) {
            return $cookies[key];
        };
        Storage.set = function(key, value) {
            $cookies[key] = value;
        };
        Storage.unset = function(key) {
            delete $cookies[key];
        };
    }

    // Store data in json format
    var get = function(key, defaultValue) {
        var value = Storage.get(key);
        return (value) ? JSON.parse(value) : defaultValue;
    };

    var set = function(key, value) {
        Storage.set(key, JSON.stringify(value));
    };

    var unset = function(key) {
        Storage.unset(key);
    };

    // Helper for filters and maps
    var normalize = function(key) {
        return decodeURIComponent(key).toLowerCase();
    };


    // API -->
    // Return saved data
    API.getSavedChannelList = function() {
        return get('channels', []);
    };

    // Save data
    API.setSavedChannelList = function(data) {
        set('channels', data);
    };

    // Clear save data
    API.clearSavedChannelList = function() {
        unset('channels');
    };

    // List of (normalized) channel names
    API.getSavedChannelNames = function() {
        return API.getSavedChannelList().map(function(c) {
            return normalize(c.name);
        });
    };

    // List of channels which are enabled
    API.getSavedEnabledChannelNames = function() {
        return API.getSavedChannelList().filter(function(c) {
            return !c.disabled;
        }).map(function(c) {
            return normalize(c.name);
        });
    };

    // Helper to sort channels list (note use of channelname).
    API.sortChannelList = function(channels) {

        var order = API.getSavedChannelNames();

        return channels.sort(function(a, b) {
            var aName = normalize(a.channelname),
                bName = normalize(b.channelname),
                x = order.indexOf(aName),
                y = order.indexOf(bName);
            return ((x < y) ? -1 : ((x > y) ? 1: 0));
        });
    };

    // Helper to filter channel list.
    API.takeEnabledChannels = function(channels) {

        var enabled = API.getSavedEnabledChannelNames();

        return channels.filter(function(c) {
            return enabled.indexOf(normalize(c.channelname)) !== -1;
        });
    };

    return API;
});
