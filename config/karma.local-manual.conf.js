module.exports = function (config) {
    config.set({
        basePath: '../',
        autoWatch: true,
        singleRun: false,
        frameworks: ['mocha'],
        files: [
            'inno-helper.js',
            'node_modules/chai/chai.js',
            'node_modules/sinon/pkg/sinon.js',
            'node_modules/jquery/dist/jquery.min.js',
            'test/phantomjs-polyfill.js',
            'test/*.js'
        ],
        plugins: [
            'karma-coverage',
            'karma-mocha'
        ],

        reporters: ['progress', 'coverage'],
        preprocessors: {
            'inno-helper.js': ['coverage']
        },
        coverageReporter: {
            dir: 'coverage/',
            reporters: [{
                type: 'html',
                subdir: 'html'
            }]
        }
    });
};
