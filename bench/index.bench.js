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
  return ['three', 'random', 'words']
}

function mockSounds() {
  return ['th', 'r', 'e', 'a', 'n', 'd', 'o', 'm', 'w', 's']
}

function mockVowels() {
  return ['e', 'a', 'o']
}

function mockSoundSet() {
  var set = new Set()
  for (var sound of mockSounds()) set.add(sound)
  return set
}

function mockVowelSet() {
  var set = new Set()
  for (var vowel of mockVowels()) set.add(vowel)
  return set
}

function mockPairSet() {
  return new PairSet([
    new Pair('th', 'r'),
    new Pair('r', 'e'),
    new Pair('e', 'e'),
    new Pair('r', 'a'),
    new Pair('a', 'n'),
    new Pair('n', 'd'),
    new Pair('d', 'o'),
    new Pair('o', 'm'),
    new Pair('w', 'o'),
    new Pair('o', 'r'),
    new Pair('r', 'd'),
    new Pair('d', 's')
  ])
}

function mockTraits() {
  var traits = new Traits()
  traits.examine(mockSourceWords())
  return traits
}
