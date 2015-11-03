module.exports = function (config) {
    config.set({
        basePath: './',
        autoWatch: true,
        frameworks: ['mocha'],
        files: [
            'inno-helper.js',
            'node_modules/chai/chai.js',
            'node_modules/sinon/pkg/sinon.js',
            'node_modules/phantomjs-polyfill/bind-polyfill.js',
            'test/*.js'
        ],
        plugins: [
            'karma-coverage',
            'karma-mocha',
            'karma-phantomjs-launcher'
        ],

        browsers: ['PhantomJS'],
        reporters: ['progress', 'coverage'],
        preprocessors: {
            'inno-helper.js': ['coverage']
        },
        singleRun: true,
        coverageReporter: {
            dir: 'coverage/',
            reporters: [{
                type: 'html',
                subdir: 'html'
            }]
        }
    });
};
