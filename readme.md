## Description

Generator of random synthetic words or names. Port
[`from Go`](https://github.com/Mitranim/codex). Takes sample words, analyses
them, and lazily produces a set of similar derived words. Works for
[any language](#traitsexamine--string-).

Packaged in a format compatible with CommonJS / Node.js and AngularJS.

## Contents

* [Description](#description)
* [Contents](#contents)
* [Installation](#installation)
* [Usage](#usage)
* [API Reference](#api-reference)
  * [Traits](#traits)
    * [Traits#examine](#traitsexamine--string-)
    * [Traits#generator](#traitsgenerator-----string-)
* [ToDo / WIP](#todo--wip)

## Installation

### CommonJS

In a shell:

```sh
npm i --save foliant
# or
npm i --save-dev foliant
```

In your program:

```javascript
var Traits = require('foliant')
```

### AngularJS

Assuming you have a [bower](http://bower.io)-centric build system, in a shell:

```sh
bower i --save foliant
# or
bower i --save-dev foliant
```

In your program:

```javascript
angular.module('MyGenerator', ['foliant'])
.factory('MyGenerator', ['Traits', function(Traits) {
  /* do things with Traits */
}])
```

foliant depends on [lodash](http://lodash.com), so make sure you have `window._`
available. It's specified as a bower dependency, but not bundled. You might want
to use [`main-bower-files`](https://github.com/ck86/main-bower-files) to
automatically read dependencies and organise their order.

## Usage

```javascript
// Examine source words and get their shared traits.
var traits = new Traits(['several', 'source', 'words'])
var gen = traits.generator()

// Print twelve random results.
for (var i = 0; i < 12; i++) {
  console.log(gen())
}

/*
woral
ordora
everdo
verdser
verand
andora
andoran
veral
sever
randser
seral
veran
*/

// Find out how many words may be derived from this sample.
var gen = traits.generator()
i = 0
while (gen() !== '') i++
console.log(i)
// -> 213
```

Example with names:

```javascript
// Examine source names and get their shared traits.
var traits = new Traits(['jasmine', 'katie', 'nariko', 'karen'])
var gen = traits.generator()

// Print twelve random results.
for (var i = 0; i < 12; i++) {
  console.log(gen())
}

/*
jarik
smiko
ikatik
arinat
nasmin
katie
rikatin
smikas
minena
ikatin
jasmika
rinaren
*/

// Find out how many names may be derived from this sample.
var gen = traits.generator()
i = 0
while (gen() !== '') i++
console.log(i)
// -> 431
```

To run tests, clone the repo, `cd` to its directory, run `npm i`, and use:

```sh
npm test
```

To watch files and rerun tests while tinkering with the source, use:

```sh
npm run autotest
```

To run benchmarks:

```sh
node bench/index.bench.js
```

## API Reference

### `Traits`

The `Traits` class is the package's entry point.

```javascript
// Transcript of the constructor, using ES5 syntax for accessibility.
function Traits(words /* : string[] */) {
  // Minimum and maximum number of sounds.
  this.minNSounds = 0
  this.maxNSounds = 0
  // Minimum and maximum number of vowels.
  this.minNVowels = 0
  this.maxNVowels = 0
  // Maximum number of consequtive vowels.
  this.maxConseqVow = 0
  // Maximum number of consequtive consonants.
  this.maxConseqCons = 0
  // Set of sounds that occur in the words.
  this.soundSet = new StringSet()
  // Set of pairs of sounds that occur in the words.
  this.pairSet = new PairSet()

  // Replacement sound set to use instead of the default `knownSounds`.
  this.knownSounds = null
  // Replacement sound set to use instead of the default `knownVowels`.
  this.knownVowels = null

  if (words instanceof Array) this.examine(words)
}
```

`Traits` represent rudimental characteristics of a word or group of words. A
traits object unequivocally defines a set of synthetic words that may be derived
from it.

The constructor optionally takes existing words as input and examines them with
[`Traits#examine()`](#traitsexamine--string-). The resulting characteristics are assigned to the newly created Traits object. Words must consist of known glyphs, as
defined by the default
[sound sets](https://github.com/Mitranim/foliant/blob/master/src/index.js#L463)
or by custom sets assigned to a traits object (see below). If an invalid word
is encountered, an error is thrown.

The optional fields `knownSounds` and `knownVowels` specify custom sets of
sounds and vowels. This lets you use `foliant` with any character set,
including non-Latin alphabets.

#### `Traits#examine(/* : string[] */)`

Analyses the given words and merges their characteristics into self.

```javascript
var traits = new Traits()
traits.examine(['mountain', 'waterfall', 'grotto'])
```

By default, this uses the sets of known sounds and vowels defined in
[index.js](https://github.com/Mitranim/foliant/blob/master/src/index.js#L463).
This includes the 26 letters of the standard US English alphabet and some
common digraphs like `th`, which are treated as single phonemes.

However, `foliant` is language-independent. Assign custom `knownSounds` and
`knownVowels` to teach it a sound system of your choosing. It can be Greek or
Cyrillic or Elvish or Clingon — doesn't matter as long as the given sounds and
vowels cover the words in your input. Refer to
[index.js](https://github.com/Mitranim/foliant/blob/master/src/index.js#L463)
as an example.

Here's how to teach it Greek:

```javascript
var traits = new Traits()

traits.knownSounds = new Traits.StringSet([
  'α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ', 'λ', 'μ',
  'ν', 'ξ', 'ο', 'π', 'ρ', 'σ', 'ς', 'τ', 'υ', 'φ', 'χ', 'ψ', 'ω'
])

traits.knownVowels = new Traits.StringSet([
  'α', 'ε', 'η', 'ι', 'ο', 'υ', 'ω'
])

traits.examine(['ελ', 'διδασκω', 'ελληνικο', 'αλφαβητο'])

var gen = traits.generator()
for (var word = gen(); word != ''; word = gen()) {
  console.log(word)
}

// ιδαλφ
// κο
// ηνικο
// ...
```

#### `Traits#generator() /* : () => string */`

Creates a generator function that yields a new random synthetic word on each
call. The words are guaranteed to never repeat, and to be randomly distributed
across the total set of possible words for these traits.

After a generator is exhausted, subsequent calls return `''`.

A traits object is stateless, and `generator()` produces a completely new
generator on each call. Generators don't affect each other.

Generators are [lazy](https://en.wikipedia.org/wiki/Lazy_evaluation) and
individual calls are very fast, making foliant suitable for web clients and
Node.js servers. See [bench/index.bench.js](bench/index.bench.js).

```javascript
var traits = new Traits(['goblin', 'smoke'])
var gen = traits.generator()

var words = [], word
while ((word = gen()) !== '') words.push(word)

console.log(words.join(' '))

// oblin smobli smoke goblin gobli moblin mobli
// this generator is exhausted
```

## ToDo / WIP

* Port more tests from the Go version, particularly the randomness test.
* In a large dataset, the last few words returned by a generator are too
  similar; random distribution needs improvement.
* Consider restricting repeated triples in `Traits#validComplete()`.
