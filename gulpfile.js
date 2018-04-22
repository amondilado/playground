'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    cssmin = require('gulp-cssmin'),
    rename = require('gulp-rename');
var browserSync = require('browser-sync').create();

var assetsPath = 'assets/';

gulp.task('sass', function () {
  return gulp.src(assetsPath + 'scss/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(assetsPath + 'css'))
    .pipe(browserSync.reload({
      stream: true
    }))
    ;
});

// gulp.task('sass', function () {
//  return gulp.src('./assets/**/*.scss')
//   .pipe(sourcemaps.init())
//   .pipe(sass().on('error', sass.logError))
//   .pipe(sourcemaps.write())
//   .pipe(gulp.dest('./assets/css'));
// });

gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: './'
    },
  })
})

gulp.task('watch', ['browserSync', 'sass'], function (){
  gulp.watch(assetsPath + 'scss/**/*.scss', ['sass']);
  gulp.watch('*.html', browserSync.reload);
});

gulp.task('default', ['sass', 'watch']);

gulp.task('build', function() {
  return gulp.src(assetsPath + 'css/**/*.css')
    .pipe(cssmin())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(assetsPath + 'css'))
});
