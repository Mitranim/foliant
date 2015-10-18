'use strict'

/**
 * Requires gulp 4.0:
 *   "gulp": "gulpjs/gulp#4.0"
 *
 * Requires Node.js 4.0+
 *
 * Style per http://standardjs.com
 */

/** **************************** Dependencies ********************************/

const $ = require('gulp-load-plugins')()
const del = require('del')
const gulp = require('gulp')

/** ******************************* Globals **********************************/

// Source files.
const src = './src/*.js'

// Destination directory.
const dest = './dist/'

const wrapper = `(function(factory) {
  if (typeof module !== 'undefined' && module.exports) {
    factory(module, require('lodash'));
  } else if (typeof angular !== 'undefined' && angular.module) {
    var mod = {exports: {}}
    factory(mod, window._);
    angular.module('foliant', []).value('Traits', mod.exports);
  }
})(function(module, _) {
  <%= contents %>
  module.exports = Traits;
  if (typeof process === 'object' && process !== null && process.env.CODEX_ENV === 'testing') Traits.Pair = Pair;
  if (typeof process === 'object' && process !== null && process.env.CODEX_ENV === 'testing') Traits.PairSet = PairSet;
  Traits.StringSet = StringSet;
});
`

/** ******************************** Tasks ***********************************/

/* -------------------------------- Scripts ---------------------------------*/

gulp.task('scripts:clear', function (done) {
  return del(dest).then((_) => {done()})
})

gulp.task('scripts:all', function () {
  return gulp.src(src)
    .pipe($.plumber())
    .pipe($.babel({
      modules: 'ignore',
      optional: [
        'spec.protoToAssign',
        'es7.classProperties'
      ]
    }))
    .pipe($.wrap(wrapper))
    .pipe(gulp.dest(dest))
})

// All script tasks.
gulp.task('scripts', gulp.series('scripts:clear', 'scripts:all'))

/* -------------------------------- Config ----------------------------------*/

// Watch
gulp.task('watch', function () {
  $.watch(src, gulp.series('scripts'))
})

// Default
gulp.task('default', gulp.series('scripts', 'watch'))
