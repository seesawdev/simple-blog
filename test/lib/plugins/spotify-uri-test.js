'use strict';

var buster = require('buster'),
    assert = buster.assert,
    Plugin = require('../../../lib/plugins/spotify-uri'),
    plugin = new Plugin();

buster.testCase('lib/plugins/spotify-uri', {
    setUp: function () {
    },
    tearDown: function () {
    },
    'Test plugin flot:': {
        'set/get': function () {
            assert(plugin.set('simple', 'blog is fun'));
            assert.equals(plugin.get('simple'), 'blog is fun');
        },
        // jscs:disable
        'replacer playlist': function () {
            var inputStr = 'See my music spotify:user:jarlelk:playlist:1HjpdqHWIZCAsod0RBvjFX';
            var result = inputStr.replace(plugin.get('regexp'), plugin.replacer);
            var regexp = new RegExp('https://embed.spotify.com/\\?uri=spotify%3Auser%3Ajarlelk%3Aplaylist%3A1HjpdqHWIZCAsod0RBvjFX');
            assert.match(result, regexp);
            assert.match(result, /<div class="videoWrapper">/i);
            assert.match(result, /<iframe width="560" height="349"/i);
            assert.match(result, /webkitallowfullscreen mozallowfullscreen allowfullscreen>/i);
            assert.match(result, /<\/iframe><\/div>/i);
        },
        'replacer track': function () {
            var inputStr = 'See my music track spotify:track:0qRXZNsoVdU9xXJIFqQkCQ';
            var result = inputStr.replace(plugin.get('regexp'), plugin.replacer);
            var regexp = new RegExp('https://embed.spotify.com/\\?uri=spotify%3Atrack%3A0qRXZNsoVdU9xXJIFqQkCQ');
            assert.match(result, regexp);
            assert.match(result, /<div class="videoWrapper">/i);
            assert.match(result, /<iframe width="560" height="349"/i);
            assert.match(result, /webkitallowfullscreen mozallowfullscreen allowfullscreen>/i);
            assert.match(result, /<\/iframe><\/div>/i);
        }
        // jscs:enable

    }
});
