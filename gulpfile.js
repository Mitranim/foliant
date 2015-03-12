'use strict'

/**
 * Requires gulp 4.0:
 *   "gulp": "git://github.com/gulpjs/gulp#4.0"
 */

/******************************* Dependencies ********************************/

var $     = require('gulp-load-plugins')()
var gulp  = require('gulp')
var shell = require('shelljs')

/********************************** Globals **********************************/

// Source files.
var src = './src/*.js'

// Declarations.
var decl = './declarations/*.js'

// Destination directory.
var dest = './dist/'

var wrapper =
  "(function(factory) {\n\
    if (typeof module !== 'undefined' && module.exports) {\n\
      factory(module, require('lodash'));\n\
    } else if (typeof angular !== 'undefined' && angular.module) {\n\
      var mod = {exports: {}}\n\
      factory(mod, window._);\n\
      angular.module('foliant', []).value('Traits', mod.exports);\n\
    }\n\
  })(function(module, _) {\n\
    <%= contents %>\n\
    module.exports = Traits;\n\
    if (typeof process === 'object' && process !== null && process.env.CODEX_ENV === 'testing') Traits.Pair = Pair;\n\
    if (typeof process === 'object' && process !== null && process.env.CODEX_ENV === 'testing') Traits.PairSet = PairSet;\n\
    Traits.StringSet = StringSet;\n\
  });"

/*********************************** Tasks ***********************************/

/*--------------------------------- Scripts ---------------------------------*/

gulp.task('scripts:clear', function() {
  return gulp.src(dest, {read: false}).pipe($.rimraf())
})

gulp.task('scripts:all', function() {
  return gulp.src(src)
    .pipe($.plumber())
    .pipe($.babel({modules: 'ignore'}))
    .pipe($.concat('index.js'))
    .pipe($.wrap(wrapper))
    .pipe(gulp.dest(dest))
})

// All script tasks.
gulp.task('scripts', gulp.series('scripts:clear', 'scripts:all'))

/*--------------------------------- Config ----------------------------------*/

// Watch
gulp.task('watch', function() {
  $.watch(src,  gulp.series('scripts'))
  $.watch(decl, gulp.series('scripts'))
})

// Default
gulp.task('default', gulp.series('scripts', 'watch'))
