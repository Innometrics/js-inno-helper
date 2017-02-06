'use strict';

var pack = require('./package.json');
var base64 = require('gulp-base64');
var chalk = require('chalk');
var path = require('path');
var csso = require('gulp-csso');
var JsDuck = require('gulp-jsduck');
var filever = require('gulp-ver');
var gulp = require('gulp');
var eslint = require('gulp-eslint');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var Server = require('karma').Server;
var uglify = require('gulp-uglify');
var help = require('gulp-task-listing');

function errorHandler (error) {
    return console.error(chalk.red(error.message));
}

var paths = {
    js: ['inno-helper.js'],
    scss: ['inno-helper.scss']
};

function js () {
    return gulp.src(paths.js)
        .pipe(filever().on('error', errorHandler))
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
}

gulp.task('js:lint', function () {
    return gulp.src(paths.js)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('js:min', function () {
    return js()
        .pipe(uglify().on('error', errorHandler))
        .pipe(rename({
            extname: '.min.js'
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('js:normal', function () {
    return js()
        .pipe(gulp.dest('dist'));
});

gulp.task('scss', function () {
    return gulp.src(paths.scss)
        .pipe(filever().on('error', errorHandler))
        .pipe(sass().on('error', errorHandler))
        .pipe(gulp.dest('dist'))
        .pipe(base64().on('error', errorHandler))
        .pipe(csso().on('error', errorHandler))
        .pipe(rename({
            extname: '.min.css'
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('test:local', function (done) {
    new Server({
        configFile: path.join(__dirname, 'config/karma.local.conf.js')
    }, done).start();
});

gulp.task('test:local-manual', function (done) {
    new Server({
        configFile: path.join(__dirname, 'config/karma.local-manual.conf.js')
    }, done).start();
});

gulp.task('test:remote', function (done) {
    new Server({
        configFile: path.join(__dirname, 'config/karma.remote.conf.js')
    }, done).start();
});

gulp.task('watch', function () {
    gulp.watch(paths.js, ['js:normal', 'js:min', 'js:lint']);
    gulp.watch(paths.scss, ['scss']);
});

gulp.task('docs:generate', function () {
    var jsDuck = new JsDuck(["--output", "docs/" + pack.version, "--categories", "defines.json"]);
    gulp.src(paths.js).pipe(jsDuck.doc());
});

gulp.task('docs:upload', function () {
    // upload
});

gulp.task('build', ['js:normal', 'js:min', 'js:lint', 'scss']);

gulp.task('help', help);
gulp.task('default', help);
