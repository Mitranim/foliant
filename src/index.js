/********************************** Traits ***********************************/

/*--------------------------------- Public ----------------------------------*/

class Traits extends null {

  // Minimum and maximum number of sounds.
  minNSounds: number;
  maxNSounds: number;
  // Minimum and maximum number of vowels.
  minNVowels: number;
  maxNVowels: number;
  // Maximum number of consequtive vowels.
  maxConseqVow: number;
  // Maximum number of consequtive consonants.
  maxConseqCons: number;
  // Set of sounds that occur in the words.
  soundSet: Set;
  // Set of pairs of sounds that occur in the words.
  pairSet: PairSet;

  // Replacement sound set to use instead of the default `knownSounds`.
  knownSounds: Set;
  // Replacement sound set to use instead of the default `knownVowels`.
  knownVowels: Set;

  constructor(words?: string[]) {
    this.minNSounds    = 0
    this.maxNSounds    = 0
    this.minNVowels    = 0
    this.maxNVowels    = 0
    this.maxConseqVow  = 0
    this.maxConseqCons = 0
    this.soundSet      = new Set()
    this.pairSet       = new PairSet()

    if (words instanceof Array) this.examine(words)
  }

  // Examines an array of words and merges their traits into self.
  examine(words: string[]): void {
    for (let word of words) traits$examineWord.call(this, word)
  }

  // Creates a generator function that returns a new word on each call. The
  // words are guaranteed to never repeat and be randomly distributed in the
  // traits' word set. When the set is exhausted, further calls return "".
  generator(): () => string {
    var state = new State(this)
    return function(): string {
      var result = ''
      state.trip(function(...sounds: string[]) {result = sounds.join('')})
      return result
    }
  }

  static validate(value: ?Traits) {
    if (!(value instanceof Traits)) {
      throw new TypeError('expected a Traits object, got: ' + value)
    }
  }

}

/*--------------------------------- Private ---------------------------------*/

// Takes a word, extracts its characteristics, and merges them into self. If the
// word doesn't satisfy our limitations, returns an error.
function traits$examineWord(word: string) {
  string$validate(word)

  // Make sure the length is okay.
  if (!validLength(word)) {
    throw new Error('the word is too short or too long')
  }

  // Split into sounds.
  var sounds = getSounds(word, traits$knownSounds.call(this))

  // Mandate at least two sounds.
  if (sounds.length < 2) {
    throw new Error('a word must have at least two sounds, found: ' + sounds)
  }

  // Merge min and max number of consequtive sounds.
  this.minNSounds = Math.min(this.minNSounds || sounds.length, sounds.length)
  this.maxNSounds = Math.max(this.maxNSounds, sounds.length)

  // Merge min and max total number of vowels.
  let nVow = traits$countVowels.call(this, sounds)
  this.minNVowels = Math.min(this.minNVowels || nVow, nVow)
  this.maxNVowels = Math.max(this.maxNVowels, nVow)

  // Merge max number of consequtive vowels.
  this.maxConseqVow = Math.max(this.maxConseqVow, traits$maxConsequtiveVowels.call(this, sounds))

  // Merge max number of consequtive consonants.
  this.maxConseqCons = Math.max(this.maxConseqCons, traits$maxConsequtiveConsonants.call(this, sounds))

  // Merge set of used sounds.
  for (let sound of sounds) this.soundSet.add(sound)

  // Find set of pairs of sounds.
  for (let pair of getPairs(sounds)) this.pairSet.add(pair)
}

function traits$knownSounds(): Set {
  if (this.knownSounds instanceof Set && this.knownSounds.size) {
    return this.knownSounds
  }
  return knownSounds
}

function traits$knownVowels() {
  if (this.knownVowels instanceof Set && this.knownVowels.size) {
    return this.knownVowels
  }
  return knownVowels
}

// Checks whether the given combination of sounds satisfies the conditions for
// a partial word. This is defined as follows:
//   1) the sounds don't exceed any of the numeric criteria in the given traits;
//   2) if there's only one sound, it must be the first sound in at least one
//      of the sound pairs in the given traits;
//   3) if there's at least one pair, the sequence of pairs must be valid as
//      defined in Traits.validPairs.
function traits$validPart(...sounds: string[]): boolean {
  // Check numeric criteria.
  if (traits$countVowels.call(this, sounds) > this.maxNVowels ||
      traits$maxConsequtiveVowels.call(this, sounds) > this.maxConseqVow ||
      traits$maxConsequtiveConsonants.call(this, sounds) > this.maxConseqCons) {
    return false
  }

  // If there's only one sound, check if it's among the first sounds of pairs.
  if (sounds.length === 1) {
    for (var pair of this.pairSet) {
      if (pair[0] === sounds[0]) return true
    }
  }

  // Check if the pair sequence is valid per Traits.validPairs.
  if (sounds.length > 1 && !traits$validPairs.call(this, sounds)) {
    return false
  }

  return true
}

// Checks whether the given sequence of sounds satisfies the criteria for a
// complete word. This is defined as follows:
//   1) the sequence satisfies the partial criteria per Traits.validPart();
//   2) the sequence satisfies the complete criteria per Traits.checkPart().
function traits$validComplete(...sounds: string[]): boolean {
  return traits$validPart.call(this, ...sounds) && traits$checkPart.call(this, ...sounds)
}

// Takes a valid partial word and checks if it's also a valid complete word,
// using the following criteria:
//   1) the number of vowels must fit within the bounds;
//   2) the number of sounds must fit within the bounds.
// The behaviour of this method for input values other than partial words is
// undefined.
function traits$checkPart(...sounds: string[]): boolean {
  // Check vowel count.
  var nVow = traits$countVowels.call(this, sounds)
  if (nVow < this.minNVowels || nVow > this.maxNVowels) {
    return false
  }
  // Check sound count.
  if (sounds.length < this.minNSounds || sounds.length > this.maxNSounds) {
    return false
  }
  return true
}

// Verifies the validity of the sequence of sound pairs comprising the given
// word. Defined as follows:
//   1) the sequence must consist of sound pairs in the given traits; this is
//      implicitly guaranteed by the current tree traversal algorithms, so we
//      skip this check to save performance;
//   2) no sound pair immediately follows itself (e.g. "tata" in "ratatater");
//   3) no sound pair occurs more than twice.
function traits$validPairs(sounds: string[]): boolean {
  if (sounds.length < 2) return true

  // Variables to keep track of the last three pairs, up to current. This is
  // used for checking condition (2).
  var secondLastPair: Pair
  var lastPair: Pair
  var pair: Pair

  // Loop over the sequence, checking each condition.
  var prev: string
  for (let index = 0; index < sounds.length; index++) {
    let current = sounds[index]
    if (!index) {
      prev = current
      continue
    }

    [secondLastPair, lastPair, pair] = [lastPair, pair, new Pair(prev, current)]

    // Check for condition (2). This can only be done starting at index 3.
    if (index >= 3) {
      if (secondLastPair === pair) {
        return false
      }
    }

    // Check for condition (3).
    if (countPair(sounds.slice(0, index), prev, current) > 2) {
      return false
    }

    prev = current
  }

  return true
}

// Returns the biggest number of consequtive vowels that occurs in the given
// sound sequence.
function traits$maxConsequtiveVowels(sounds: string[]): number {
  var count, max = 0
  var known = traits$knownVowels.call(this)
  for (let sound of sounds) {
    if (!known.has(sound)) count = 0
    else max = Math.max(max, ++count)
  }
  return max
}

// Returns the biggest number of consequtive consonants that occurs in the given
// sound sequence.
function traits$maxConsequtiveConsonants(sounds: string[]): number {
  var count = 0
  var max = 0
  var known = traits$knownVowels.call(this)
  for (let sound of sounds) {
    if (known.has(sound)) count = 0
    else max = Math.max(max, ++count)
  }
  return max
}

// Counts how many sounds from the given sequence occur among own known vowels.
function traits$countVowels(sounds: string[]): number {
  var count = 0
  var known = traits$knownVowels.call(this)
  for (let sound of sounds) if (known.has(sound)) count++
  return count
}
