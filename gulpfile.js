'use strict';

const { task, series, parallel, src, dest, watch } = require('gulp'),
    del = require('del'),
    rename = require('gulp-rename'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    cssmin = require('gulp-cssmin'),
    autoprefixer = require('gulp-autoprefixer'),
    assetsPath = './assets/',
    buildPath = './build/';

function css(done) {
    src(assetsPath + 'scss/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(sourcemaps.write())
        .pipe(dest(buildPath + 'css/'))
    ;
    done();
}

function cssbuild(done) {
    src(buildPath + 'css/**/*.css')
        .pipe(cssmin())
        .pipe(rename({ suffix: '.min' }))
        .pipe(dest(buildPath + 'css/'))
    done();
}

function watchFiles() {
    watch(assetsPath + 'scss/**/*.scss', css);
}

task('css', css);
task('cssbuild', cssbuild);
exports.build = series(css, cssbuild);
exports.default = watchFiles;
