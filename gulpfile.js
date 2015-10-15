'use strict';

var base64 = require('gulp-base64');
var chalk = require('chalk');
var csso = require('gulp-csso');
var filever = require('gulp-version-filename');
var gulp = require('gulp');
var jscs = require('gulp-jscs');
var jshint = require('gulp-jshint');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');

function errorHandler (error) {
    return console.log(chalk.red(error.message));
}

var paths = {
    js: ['inno-helper.js'],
    scss: ['inno-theme.scss']
};

function js () {
    return gulp.src(paths.js)
        .pipe(filever().on('error', errorHandler))
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
}

gulp.task('js:lint', function () {
    return gulp.src(paths.js)
        .pipe(jscs())
        .pipe(jscs.reporter())
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
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
        .pipe(base64().on('error', errorHandler))
        .pipe(csso().on('error', errorHandler))
        .pipe(gulp.dest('dist'));
});

gulp.task('watch', function () {
    gulp.watch(paths.js, ['js:normal', 'js:min', 'js:lint']);
    gulp.watch(paths.scss, ['scss']);
});

gulp.task('default', ['js:normal', 'js:min', 'js:lint', 'scss']);
