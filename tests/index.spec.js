'use strict'

/******************************* Dependencies ********************************/

var _ = require('lodash')
var Traits = require('../dist/index')
var PairSet = Traits.PairSet
var Pair = Traits.Pair

/*********************************** Specs ***********************************/

describe('Traits constructor', function() {

  it('is a function', function() {
    expect(Traits).toEqual(jasmine.any(Function))
  })

  it('survives any argument', function() {
    function caller(input) {new Traits(input)}
    expect(_.wrap(caller, callWithAllInputs)).not.toThrow()
  })

  it('sets default fields', function() {
    var traits = new Traits()
    expect(traits.minNSounds).toBe(0)
    expect(traits.maxNSounds).toBe(0)
    expect(traits.minNVowels).toBe(0)
    expect(traits.maxNVowels).toBe(0)
    expect(traits.maxConseqVow).toBe(0)
    expect(traits.maxConseqCons).toBe(0)
    expect(traits.soundSet).toEqual(jasmine.any(Set))
    expect(traits.pairSet).toEqual(jasmine.any(Object))
  })

})

describe('Traits instance', function() {

  it('examines words and learns their traits', function() {
    var traits = new Traits()
    traits.examine(mockSourceWords())

    expect(traits.minNSounds).toBe(4)
    expect(traits.maxNSounds).toBe(6)
    expect(traits.minNVowels).toBe(1)
    expect(traits.maxNVowels).toBe(2)
    expect(traits.maxConseqVow).toBe(2)
    expect(traits.maxConseqCons).toBe(3)

    // Expected set of sounds.
    var soundSet = mockSoundSet()

    // Compare soundsets.
    expect(soundSet.size).toBe(10)
    expect(traits.soundSet.size).toBe(soundSet.size)
    for (var sound of soundSet.values()) {
      expect(traits.soundSet.has(sound)).toBe(true)
    }

    // Expected set of pairs of sounds.
    var pairSet = mockPairSet()

    // Compare sets of pairs.
    expect(pairSet.length).toBe(12)
    expect(traits.pairSet.length).toBe(pairSet.length)
    for (var pair of pairSet.values()) {
      expect(traits.pairSet.has(pair)).toBe(true)
    }
  })

  it('creates a generator function', function() {
    var traits = mockTraits()
    expect(traits.generator()).toEqual(jasmine.any(Function))
  })

})

describe('generator function', function() {

  beforeEach(function() {
    this.traits = mockTraits()
    this.gen = this.traits.generator()
  })

  it('returns a word', function() {
    expect(typeof this.gen()).toBe('string')
  })

  it('never repeats a word and eventually exhausts', function() {
    var words = new Set()

    while (true) {
      var word = this.gen()
      expect(typeof word).toBe('string')
      expect(words.has(word)).toBe(false)
      if (word === '') break
      words.add(word)
    }

    // Check the size, too.
    expect(words.size).toBeGreaterThan(50)
  })

  it('only returns valid complete words', function() {
    var words = new Set()
    var word
    while (word = this.gen()) words.add(word)

    for (var word of words) {
      var valid = isValid(word)
      expect(valid).toBe(true)
      if (!valid) return
    }
  })

  it('includes source words', function() {
    var words = new Set()
    var word
    while (word = this.gen()) words.add(word)

    for (var word of mockSourceWords()) {
      var includes = words.has(word)
      expect(includes).toBe(true)
      if (!includes) return
    }
  })

})

/********************************* Constants *********************************/

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

/********************************* Utilities *********************************/

/**
 * Calls the given function without arguments and with lots of different
 * arguments.
 * @param Function
 */
function callWithAllInputs(fn) {
  fn()
  fn(undefined)
  fn('')
  fn("what's up honeybunch")
  fn(NaN)
  fn(Infinity)
  fn(123)
  fn(false)
  fn(true)
  fn(null)
  fn(Object.create(null))
  fn({})
  fn([])
  fn(/reg/)
  fn(function() {})
}

/**
 * Splits the given word into a series of sound glyphs, using mock sounds as
 * reference.
 */
function getSounds(word /* : string */) /* : string[] */ {
  var known = mockSoundSet()
  var sounds = []
  for (var i = 0; i < word.length; i++) {
    var monograph = word[i]
    var digraph = monograph + word[i + 1]
    if (known.has(digraph)) {
      sounds.push(digraph)
      i++
    } else if (known.has(monograph)) {
      sounds.push(monograph)
    } else {
      throw new Error('unknown sound: ' + monograph)
    }
  }
  return sounds
}

/**
 * Extracts the sequence of vowels from the given word, using mock sounds as
 * reference.
 */
function getVowels(word /* : string */) /* : string[] */ {
  var known = mockVowelSet()
  var vowels = []
  for (var sound of getSounds(word)) {
    if (known.has(sound)) vowels.push(sound)
  }
  return vowels
}

/**
 * Returns the max number of consequtive vowels from the given word, using
 * mock vowels as reference.
 */
function maxConseqVow(word /* : string */) /* : number */ {
  var count = 0
  var max = 0
  var vowels = mockVowelSet()
  for (var sound of getSounds(word)) {
    if (vowels.has(sound)) max = Math.max(max, ++count)
    else count = 0
  }
  return max
}

/**
 * Returns the max number of consequtive consonants from the given word, using
 * mock vowels as reference.
 */
function maxConseqCons(word /* : string */) /* : number */ {
  var count = 0
  var max = 0
  var vowels = mockVowelSet()
  for (var sound of getSounds(word)) {
    if (!vowels.has(sound)) max = Math.max(max, ++count)
    else count = 0
  }
  return max
}

/**
 * Verifies that the given word satisfies our rough criteria for a valid
 * complete word matching the mock traits.
 */
function isValid(word /* : string */) /* : boolean */ {
  var traits = mockTraits()
  var knownSounds = mockSoundSet()
  var knownPairs = mockPairSet()

  // The word must contain only valid glyphs.
  try {var sounds = getSounds(word)} catch (err) {return false}
  for (var sound of sounds) if (!knownSounds.has(sound)) return false

  // The word must contain only known pairs.
  for (var i = 0; i < sounds.length - 1; i++) {
    var pair = new Pair(sounds[i], sounds[i + 1])
    if (!knownPairs.has(pair)) return false
  }

  // The number of sounds must not be smaller than allowed.
  if (sounds.length < traits.minNSounds) return false

  // The number of sounds must not be higher than allowed.
  if (sounds.length > traits.maxNSounds) return false

  // The number of vowels must not be smaller than allowed.
  if (getVowels(word).length < traits.minNVowels) return false

  // The number of vowels must not be higher than allowed.
  if (getVowels(word).length > traits.maxNVowels) return false

  // The number of consequtive vowels must not be higher than allowed.
  if (maxConseqVow(word) > traits.maxConseqVow) return false

  // The number of consequtive consonants must not be higher than allowed.
  if (maxConseqCons(word) > traits.maxConseqCons) return false

  return true
}
