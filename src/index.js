/********************************** Traits ***********************************/

/*--------------------------------- Public ----------------------------------*/

class Traits extends null {

  constructor(words: ?string[]) {
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

  // Examines an array of words and merges their traits into self.
  examine(words: ?string[]) {
    _.each(words, traits$examineWord.bind(this))
  }

  // Creates a generator function that returns a new word on each call. The
  // words are guaranteed to never repeat and be randomly distributed in the
  // traits' word set. When the set is exhausted, further calls return "".
  generator() {
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

  // Validate the length.
  if (word.length < 2 && word.length > 32) {
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
  var nVow = traits$countVowels.call(this, sounds)
  this.minNVowels = Math.min(this.minNVowels || nVow, nVow)
  this.maxNVowels = Math.max(this.maxNVowels, nVow)

  // Merge max number of consequtive vowels.
  this.maxConseqVow = Math.max(this.maxConseqVow, traits$maxConsequtiveVowels.call(this, sounds))

  // Merge max number of consequtive consonants.
  this.maxConseqCons = Math.max(this.maxConseqCons, traits$maxConsequtiveConsonants.call(this, sounds))

  // Merge set of used sounds.
  _.each(sounds, sound => this.soundSet.add(sound))

  // Find set of pairs of sounds.
  _.each(getPairs(sounds), pair => this.pairSet.add(pair))
}

function traits$knownSounds(): StringSet {
  if (this.knownSounds instanceof StringSet && this.knownSounds.size) {
    return this.knownSounds
  }
  return knownSounds
}

function traits$knownVowels() {
  if (this.knownVowels instanceof StringSet && this.knownVowels.size) {
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
//      defined in Traits#validPairs.
function traits$validPart(...sounds: string[]): boolean {
  // Check numeric criteria.
  if (traits$countVowels.call(this, sounds) > this.maxNVowels ||
      traits$maxConsequtiveVowels.call(this, sounds) > this.maxConseqVow ||
      traits$maxConsequtiveConsonants.call(this, sounds) > this.maxConseqCons) {
    return false
  }

  // If there's only one sound, check if it's among the first sounds of pairs.
  if (sounds.length === 1) {
    if (_.any(this.pairSet, pair => pair[0] === sounds[0])) return true
  }

  // Check if the pair sequence is valid per Traits#validPairs.
  if (sounds.length > 1 && !traits$validPairs.call(this, sounds)) {
    return false
  }

  return true
}

// Checks whether the given sequence of sounds satisfies the criteria for a
// complete word. This is defined as follows:
//   1) the sequence satisfies the partial criteria per Traits#validPart();
//   2) the sequence satisfies the complete criteria per Traits#checkPart().
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
  _.each(sounds, sound => {
    if (!known.has(sound)) count = 0
    else max = Math.max(max, ++count)
  })
  return max
}

// Returns the biggest number of consequtive consonants that occurs in the given
// sound sequence.
function traits$maxConsequtiveConsonants(sounds: string[]): number {
  var count = 0
  var max = 0
  var known = traits$knownVowels.call(this)
  _.each(sounds, sound => {
    if (known.has(sound)) count = 0
    else max = Math.max(max, ++count)
  })
  return max
}

// Counts how many sounds from the given sequence occur among own known vowels.
function traits$countVowels(sounds: string[]): number {
  var count = 0
  var known = traits$knownVowels.call(this)
  _.each(sounds, sound => {if (known.has(sound)) count++})
  return count
}

/*********************************** State ***********************************/

class State extends null {

  constructor(traits: Traits) {
    Traits.validate(traits)
    this.traits = traits
    this.tree = new Tree()
  }

  // Walks the virtual tree of the state's traits, caching the visited parts in
  // the state's inner tree. This caching lets us skip repeated
  // Traits#validPart() checks, individual visited nodes, and fully visited
  // subtrees. This significantly speeds up State#trip() traversals that restart
  // from the root on each call, and lets us avoid revisiting nodes. This method
  // also randomises the order of visiting subtrees from each node.
  walk(iterator: (...sounds: string[]) => void, ...sounds: string[]): void {

    // Find or create a matching node for this path. If it doesn't have child
    // nodes yet, make a shallow map to track valid paths.
    var node = this.tree.at(...sounds)
    if (node.nodes === null) {
      node.nodes = Tree.sprout(this.traits.pairSet, ...sounds)
    }

    // Loop over remaining child nodes and investigate their subtrees.
    _.each(_.shuffle(_.keys(node.nodes)), sound => {
      var path = sounds.concat(sound)
      // Invalidate the path if it doesn't qualify as a partial word.
      if (!traits$validPart.call(this.traits, ...path)) {
        delete node.nodes[sound]
        return
      }
      // (1)(2) -> pre-order, (2)(1) -> post-order. Post-order is required by
      // State#walkRandom().
      // (2) Continue recursively.
      this.walk(iterator, ...path)
      // (1) If this path hasn't yet been visited, feed it to the iterator.
      if (!node.at(sound).visited) {
        iterator(...path)
      }
      // If this code is reached, the subtree is used up, so we forget about it.
      delete node.nodes[sound]
    })
  }

  // Walks the state's virtual tree; for each path given to the wrapper
  // function, we visit its subpaths in random order, marking the corresponding
  // nodes as visited. For the distribution to be random, the tree needs to be
  // traversed in post-order. We only visit paths that qualify as valid complete
  // words and haven't been visited before.
  walkRandom(iterator: (...sounds: string[]) => void): void {
    this.walk((...sounds: string[]) => {
      _.each(_.shuffle(_.range(sounds.length)), index => {
        if (!index) return
        var path = sounds.slice(0, index + 1)
        var node = this.tree.at(...path)
        if (!node.visited) {
          node.visited = true
          if (traits$checkPart.call(this.traits, ...path)) {
            iterator(...path)
          }
        }
      })
    })
  }

  trip(iterator: (...sounds: string[]) => void): void {
    try {
      this.walkRandom((...sounds) => {
        iterator(...sounds)
        throw null
      })
    } catch (err) {
      if (err !== null) throw err
    }
  }

  static validate(value: ?State) {
    if (!(value instanceof State)) {
      throw new TypeError('expected a State object, got: ' + value)
    }
  }

}

/*********************************** Tree ************************************/

class Tree extends null {

  constructor() {
    // Map of strings to Tree objects. Keys represent node values (sounds).
    this.nodes = null
    this.visited = false
  }

  at(...path: string[]): Tree {
    var node = this
    _.each(path, value => {
      if (!node.nodes[value]) node.nodes[value] = new Tree()
      node = node.nodes[value]
    })
    return node
  }

  // Creates child nodes for a tree from the given pairs on the given path.
  static sprout(pairs: PairSet, ...path: string[]): {} {
    var nodes = Object.create(null)

    // If no sound were passed, start from the root.
    if (!path.length) {
      _.each(pairs, pair => {
        nodes[pair[0]] = nodes[pair[0]] || new Tree()
      })
    }
    // Otherwise continue from the given path.
    else {
      // [ ... sounds ... ( last sound ] <- pair -> next sound )
      //
      // We investigate pairs that begin with the last sound of the given
      // preceding sounds. Their second sounds form a set that, when individually
      // appended to the preceding sounds, form foundation paths for child
      // subtrees. We register these second sounds on the child node map.
      _.each(pairs, pair => {
        if (pair[0] === path[path.length - 1]) {
          nodes[pair[1]] = new Tree()
        }
      })
    }

    return nodes
  }

  static validate(value: ?Tree) {
    if (!(value instanceof Tree)) {
      throw new TypeError('expected a Tree object, got: ' + value)
    }
  }

}

/********************************* StringSet *********************************/

// Behaves like a set of strings. Does not conform to the Set API.
class StringSet extends null {

  constructor(values?: string[]) {
    _.each(values, value => {
      string$validate(value)
      this.add(value)
    })
  }

  has(value: string): boolean {
    string$validate(value)
    return this[value] === null
  }

  add(value: string) {
    string$validate(value)
    this[value] = null
  }

  del(value: string) {
    string$validate(value)
    delete this[value]
  }

}

/********************************** PairSet **********************************/

// Behaves like a set of pairs of strings. Does not conform to the Set API.
class PairSet extends Array {

  constructor(pairs?: Pair[]) {
    _.each(pairs, pair => {
      Pair.validate(pair)
      this.add(pair)
    })
  }

  has(pair: ?Pair): boolean {
    Pair.validate(pair)
    return _.any(this, existing => {
      return pair[0] === existing[0] && pair[1] === existing[1]
    })
  }

  add(pair: ?Pair): void {
    Pair.validate(pair)
    if (!this.has(pair)) this.push(pair)
  }

  del(pair: ?Pair): void {
    Pair.validate(pair)
    _.remove(this, existing => {
      return pair[0] === existing[0] && pair[1] === existing[1]
    })
  }

}

/*********************************** Pair ************************************/

// Pair of strings.
class Pair extends null {

  constructor(one: string, two: string) {
    string$validate(one)
    string$validate(two)
    this[0] = one
    this[1] = two
  }

  static validate(value: ?Pair) {
    if (!(value instanceof Pair)) {
      throw new TypeError('expected a Pair, got: ' + value)
    }
  }
}

/********************************* Utilities *********************************/

// Takes a word and splits it into a series of known glyphs representing sounds.
function getSounds(word: string, known: StringSet): string[] {
  var sounds = []

  // Loop over the word, matching known glyphs. Break if no match is found.
  for (let i = 0; i < word.length; i++) {
    // Check for a known digraph.
    var digraph = word[i] + word[i+1]
    if (digraph.length > 1 && known.has(digraph)) {
      sounds.push(digraph)
      i++
    // Check for a known monograph.
    } else if (known.has(word[i])) {
      sounds.push(word[i])
    // Otherwise throw an error.
    } else {
      throw new Error('encountered unknown symbol: ' + word[i])
    }
  }

  return sounds
}

// Takes a sequence of sounds and returns the set of consequtive pairs that
// occur in it.
function getPairs(sounds: string[]): PairSet {
  var pairs = new PairSet()
  for (let i = 0; i < sounds.length - 1; i++) {
    pairs.add(new Pair(sounds[i], sounds[i + 1]))
  }
  return pairs
}

// Counts the occurrences of the given pair of strings in the given sequence.
function countPair(strings: string[], prev: string, current: string): number {
  var count = 0
  var ownPrev: string
  for (let index = 0; index < strings.length; index++) {
    let ownCurrent = strings[index]
    if (!index) {
      ownPrev = ownCurrent
      continue
    }
    if (ownPrev === prev && ownCurrent === current) count++
  }
  return count
}

// Validates the given value as a string.
function string$validate(value: ?string): void {
  if (typeof value !== 'string') {
    throw new TypeError('expected a string, got: ' + value)
  }
}

/******************************* Known Sounds ********************************/

// Glyphs and digraphs in common English use. This doesn't represent all common
// phonemes.
const knownSounds = new StringSet([
  // Digraphs
  'ae', 'ch', 'ng', 'ph', 'sh', 'th', 'zh',
  // ISO basic Latin monographs
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
  'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
])

// Vowel glyphs and digraphs in common English use.
const knownVowels = new StringSet([
  // Digraphs
  'ae',
  // ISO basic Latin monographs
  'a', 'e', 'i', 'o', 'u', 'y'
])
