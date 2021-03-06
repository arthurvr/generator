'use strict';
var path = require('path');
var gulp = require('gulp');
var mocha = require('gulp-mocha');
var jshint = require('gulp-jshint');
var jscs = require('gulp-jscs');
var eslint = require('gulp-eslint');
var istanbul = require('gulp-istanbul');
var coveralls = require('gulp-coveralls');
var plumber = require('gulp-plumber');

var handleErr = function (err) {
  console.log(err.message);
  process.exit(1);
};

gulp.task('static', function () {
  return gulp.src([
    'test/*.js',
    'lib/**/*.js',
    'benchmark/**/*.js',
    'index.js',
    'doc.js',
    'gulpfile.js'
  ])
  .pipe(jshint('.jshintrc'))
  .pipe(jshint.reporter('jshint-stylish'))
  .pipe(jshint.reporter('fail'))
  .pipe(jscs())
  .on('error', handleErr);
  // .pipe(eslint())
  // .pipe(eslint.format())
  // .pipe(eslint.failOnError());
});

gulp.task('test', function (cb) {
  var mochaErr;

  gulp.src([
    'lib/**/*.js',
    'index.js'
  ])
  .pipe(istanbul({
    includeUntested: true
  }))
  .pipe(istanbul.hookRequire())
  .on('finish', function () {
    gulp.src(['test/*.js'])
      .pipe(plumber())
      .pipe(mocha({
        reporter: 'spec'
      }))
      .on('error', function (err) {
        mochaErr = err;
      })
      .pipe(istanbul.writeReports())
      .on('end', function () {
        cb(mochaErr);
      });
  });
});

gulp.task('coveralls', ['test'], function () {
  if (!process.env.CI) {
    return;
  }

  return gulp.src(path.join(__dirname, 'coverage/lcov.info'))
    .pipe(coveralls());
});

gulp.task('default', ['static', 'test', 'coveralls']);
