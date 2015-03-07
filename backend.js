var express = require('express');
var http = require('http');
var app = express();


var Cache = (function() {
    
    var lifeTime = 60 * 5; // in seconds
    var lastUpdated = 0; // timestamp
    var channels = null;

    var timestamp = function() {
        return Math.floor(Date.now() / 1000);
    };

    var API = {};

    API.hasFreshData = function() {
        return (channels != null && (timestamp() - lastUpdated) < lifeTime);
    };

    API.getData = function() {
        return channels;
    };

    API.updateData = function(data) {
        channels = data;
        lastUpdated = timestamp();
    };

    return API;
})();


var ChannelApi = (function(Cache, http) {
    
    var channelsUrl = 'http://api.elisaviihde.fi/etvrecorder/ajaxprograminfo.sl?channels',
        programsUrl = 'http://api.elisaviihde.fi/etvrecorder/ajaxprograminfo.sl?24h=[:channel]',
        programUrl = 'http://api.elisaviihde.fi/etvrecorder/program.sl?programid=[:id]&ajax=true',
        defaultOrder = [
            'yle tv1',
            'yle tv2',
            'mtv3',
            'nelonen',
            'sub',
            'jim',
            'tv5',
            'kutonen',
            'fox',
            'yle teema',
            'hero',
            'liv',
            'ava',
            'yle fem',
            'alfa tv',
            'eurosport',
            'yle tv1 hd',
            'yle tv2 hd',
            'mtv3 hd',
            'yle teema hd',
            'yle fem hd',
            'eurosport hd'
        ];
    
    var getJson = function(url, success, error) {
        http.get(url, function(response) {
            var data = '';
            response.on('data', function(chunk) {
                data += chunk;
            });
            response.on('end', function() {
                try {
                    return success(JSON.parse(data));
                } catch (err) {
                    return error(err);
                }
            });
        }).on('error', function(err) {
            return error(err);
        });
    };

    var buildChannelUrls = function(channels) {
        return channels.map(function(c) {
            var channel = {};
            channel.channelname = c;
            channel.programUrl = programsUrl.replace('[:channel]', encodeURIComponent(c));
            return channel;
        });
    };

    var buildProgramUrl = function(id) {
        return programUrl.replace('[:id]', parseInt(id, 10));
    };

    var sortChannels = function(channels) {
        var normalize = function(name) {
            return decodeURIComponent(name).toLowerCase();
        };
        return channels.sort(function(a, b) {
            var aName = normalize(a.channelname),
                bName = normalize(b.channelname),
                x = defaultOrder.indexOf(aName),
                y = defaultOrder.indexOf(bName);
            return ((x < y) ? -1 : ((x > y) ? 1: 0));
        });
    };


    var API = {};

    // Fetch list of channels and their programs
    API.fetch = function(success, error) {

        if (Cache.hasFreshData()) {
            console.log('Returned cached channel data');
            return success(JSON.stringify(Cache.getData()));
        }
    
        // First fetch channel list
        getJson(channelsUrl, function(channelsObj) {

            if (!channelsObj.channels) {
                return error('Can\'t parse channels');
            }

            var channelUrls = buildChannelUrls(channelsObj.channels);
            var channels = [];

            // Callback to be executed when every request below is finished
            var allDone = function() {
                channels = sortChannels(channels);
                Cache.updateData(channels);
                console.log('Fetched fresh channel data');
                return success(JSON.stringify(channels));
            };

            // Are we done with requests
            var isFinished = function() {
                if (channels.length == channelUrls.length) {
                    allDone();
                }
            };

            // Then loopthrough all channels and 
            // fetch their programs list
            channelUrls.forEach(function(c) {
                getJson(c.programUrl, function(channelData) {
                    channels.push(channelData);
                    isFinished();
                }, function(err) {
                    c.error = err;
                    channels.push(c)
                    isFinished();
                });
            });
        }, function(err) {
            return error(err);
        });
    };

    API.fetchProgram = function(id, success, error) {

        var url = buildProgramUrl(id);
        
        getJson(url, function(data) {
            console.log('Fetched program %s-%s data', data.id, data.name);
            return success(JSON.stringify(data));
        }, function(err) {
            return error(err);
        });
    };

    return API;

})(Cache, http);


// Cors
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Application routes
app.get('/channels', function(req, res, next) {

    res.type('application/json');

    ChannelApi.fetch(
        function(data) {
            res.end(data);
        }, 
        function(err) {
            console.log('ERROR: %s', err);
            res.status(500);
            res.end('[]');
        }
    );
});
app.get('/programs/:id', function(req, res, next) {
    
    var id = parseInt(req.param('id'), 10);

    res.type('application/json');

    ChannelApi.fetchProgram(
        id,
        function(data) {
            res.end(data);
        }, 
        function(err) {
            console.log('ERROR: %s', err);
            res.status(500);
            res.end('[]');
        }
    );
});

// Start server
var server = app.listen(9090, function() {
    var host = server.address().address,
        port = server.address().port;
    console.log('Backend listening at http://%s:%s', host, port);
});
