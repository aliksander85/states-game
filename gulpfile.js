var gulp = require('gulp'),
    autoPreFixer = require('gulp-autoprefixer'),
    minifyCss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    clean = require('gulp-clean');

// Styles
gulp.task('styles', function () {
    return gulp.src('./public/style/*.css')
        .pipe(autoPreFixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(gulp.dest('public/dist'))
        .pipe(rename({suffix: '.min'}))
        .pipe(minifyCss())
        .pipe(gulp.dest('public/dist'));
});

// Scripts
gulp.task('scripts', function () {
    return gulp.src(
        [
            './public/js/index.module.js',
            './public/js/index.route.js',
            './public/js/*.js'
        ])
        .pipe(jshint.reporter('default'))
        .pipe(concat('app.js'))
        .pipe(gulp.dest('public/dist'))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(gulp.dest('public/dist'));
});

// Clean
gulp.task('clean', function () {
    return gulp.src('public/dist/**', {read: false})
        .pipe(clean());
});

// Default task
gulp.task('default', ['clean'], function () {
    gulp.start('styles', 'scripts');
});