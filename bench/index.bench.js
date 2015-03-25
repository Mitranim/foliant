'use strict'

/******************************* Dependencies ********************************/

var _ = require('lodash')
var Traits = require('../dist/index')
var Benchmark = require('benchmark')

var suite = new Benchmark.Suite()

/********************************** Benches **********************************/

suite.add('Traits#examine', function() {
  var traits = new Traits(mockSourceWords())
})
.add('Traits#examine() -> Traits#generator()', function() {
  var traits = new Traits(mockSourceWords())
  var gen = traits.generator()
})
.add('Traits#examine() -> Traits#generator() -> ' + defCount() + ' calls', function() {
  var traits = new Traits(mockSourceWords())
  var gen = traits.generator()
  _.times(defCount(), gen)
})
.add('Traits#examine() -> Traits#generator() -> all', function() {
  var traits = new Traits(mockSourceWords())
  var gen = traits.generator()
  while (gen());
})
.on('cycle', function(event) {
  console.log(String(event.target))
})
// .on('complete', function() {
//   console.log('Fastest is ' + this.filter('fastest').pluck('name'))
// })
.run({async: true})

/********************************* Constants *********************************/

function defCount() {
  return 12
}

function mockSourceWords() {
  // return ['three', 'random', 'words']
 return ['go', 'nebula', 'aurora', 'theron', 'thorax', 'deity', 'quasar']
}
