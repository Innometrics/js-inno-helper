var fs = require('fs');
var list = fs.readFileSync('browsers.json');
var launchers = {};

list = JSON.parse(list);
for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var key = (item.os + item.browser + item.browser_version).replace(' ', '_');
    launchers[key] = {
        base: 'BrowserStack',
        browser: item.browser,
        browser_version: item.browser_version,
        os: item.os,
        os_version: item.os_version
    };
}

module.exports = function (config) {
    config.set({
        basePath: '../',
        singleRun: true,
        frameworks: ['mocha'],
        files: [
            'inno-helper.js',
            'node_modules/chai/chai.js',
            'node_modules/sinon/pkg/sinon.js',
            'node_modules/jquery/dist/jquery.min.js',
            'test/*.js'
        ],
        plugins: [
            'karma-mocha',
            'karma-browserstack-launcher'
        ],
        browserStack: {
            username: process.env.BROWSERSTACK_USERNAME,
            accessKey: process.env.BROWSERSTACK_KEY
        },
        customLaunchers: launchers,
        browsers: Object.keys(launchers)
    });
};
