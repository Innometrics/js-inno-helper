'use strict';

var base64 = require('gulp-base64');
var chalk = require('chalk');
var csso = require('gulp-csso');
var filever = require('gulp-version-filename');
var gulp = require('gulp');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');

function errorHandler (error) {
    return console.log(chalk.red(error.message));
}

function js () {
    return gulp.src(['inno-helper.js'])
        .pipe(filever().on('error', errorHandler));
}

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
    return gulp.src(['inno-theme.scss'])
        .pipe(filever().on('error', errorHandler))
        .pipe(sass().on('error', errorHandler))
        .pipe(base64().on('error', errorHandler))
        .pipe(csso().on('error', errorHandler))
        .pipe(gulp.dest('dist'));
});

gulp.task('watch', function () {
    gulp.watch(['inno-helper.js'], ['js:normal', 'js:min']);
    gulp.watch(['inno-theme.scss'], ['scss']);
});

gulp.task('default', ['js:normal', 'js:min', 'scss', 'watch']);
