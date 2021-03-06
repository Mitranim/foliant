/* global _ */

/**
 * Style per http://standardjs.com
 */

/** ******************************** Pair ************************************/

// Pair of strings.
class Pair {

  constructor (one: string, two: string) {
    assertString(one)
    assertString(two)
    this[0] = one
    this[1] = two
  }

}

/** ****************************** StringSet *********************************/

// Behaves like a set of strings.
class StringSet {

  constructor (values: ?string[]) {
    if (values) values.forEach(this.add, this)
  }

  has (value: string) {return this[value] === null}
  add (value: string) {this[value] = null}
  del (value: string) {delete this[value]}

}

/** ******************************* PairSet **********************************/

// Behaves like a set of pairs of strings. Does not conform to the Set API.
class PairSet extends Array {

  constructor (pairs: ?Pair[]) {
    super()
    if (pairs) pairs.forEach(this.add, this)
  }

  has (pair: Pair) {
    return _.any(this, existing => {
      return pair[0] === existing[0] && pair[1] === existing[1]
    })
  }

  add (pair: Pair) {
    if (!this.has(pair)) this.push(pair)
  }

  del (pair: Pair) {
    _.remove(this, existing => {
      return pair[0] === existing[0] && pair[1] === existing[1]
    })
  }

}

/** ****************************** Constants *********************************/

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

/** ******************************* Traits ***********************************/

/* -------------------------------- Public ----------------------------------*/

class Traits {

  // Minimum and maximum number of sounds.
  minNSounds = 0
  maxNSounds = 0

  // Minimum and maximum number of vowels.
  minNVowels = 0
  maxNVowels = 0

  // Maximum number of consequtive vowels.
  maxConseqVow = 0
  // Maximum number of consequtive consonants.
  maxConseqCons = 0

  // Set of sounds that occur in the words.
  soundSet = new StringSet()
  // Set of pairs of sounds that occur in the words.
  pairSet = new PairSet()

  // Replacement sound set to use instead of the default `knownSounds`.
  knownSounds = null
  // Replacement sound set to use instead of the default `knownVowels`.
  knownVowels = null

  constructor (words: ?string[]) {
    if (words instanceof Array) this.examine(words)
  }

  // Examines an array of words and merges their traits into self.
  examine (words: string[]) {
    if (!(words instanceof Array)) {
      throw new TypeError('the argument to Traits#examine must be an array of strings')
    }
    words.forEach(traits$examineWord, this)
  }

  // Creates a generator function that returns a new word on each call. The
  // words are guaranteed to never repeat and be randomly distributed in the
  // traits' word set. When the set is exhausted, further calls return "".
  generator () {
    const state = new State(this)
    return function (): string {
      let result = ''
      state.trip((sounds: string[]) => {result = sounds.join('')})
      return result
    }
  }

}

/* -------------------------------- Private ---------------------------------*/

// Takes a word, extracts its characteristics, and merges them into self. If the
// word doesn't satisfy our limitations, returns an error.
function traits$examineWord (word: string) {
  assertString(word)

  // Validate the length.
  if (word.length < 2 && word.length > 32) {
    throw new Error('the word is too short or too long')
  }

  // Split into sounds.
  const sounds = getSounds(word, this.knownSounds || knownSounds)

  // Mandate at least two sounds.
  if (sounds.length < 2) {
    throw new Error('a word must have at least two sounds, found: ' + sounds)
  }

  // Merge min and max total number of sounds.
  this.minNSounds = Math.min(this.minNSounds || sounds.length, sounds.length)
  this.maxNSounds = Math.max(this.maxNSounds, sounds.length)

  // Merge min and max total number of vowels.
  const nVow = traits$countVowels.call(this, sounds)
  this.minNVowels = Math.min(this.minNVowels || nVow, nVow)
  this.maxNVowels = Math.max(this.maxNVowels, nVow)

  // Merge max number of consequtive vowels.
  this.maxConseqVow = Math.max(this.maxConseqVow, traits$maxConsequtiveVowels.call(this, sounds))

  // Merge max number of consequtive consonants.
  this.maxConseqCons = Math.max(this.maxConseqCons, traits$maxConsequtiveConsonants.call(this, sounds))

  // Merge set of used sounds.
  sounds.forEach(this.soundSet.add, this.soundSet)

  // Find set of pairs of sounds.
  getPairs(sounds).forEach(this.pairSet.add, this.pairSet)
}

// Checks whether the given combination of sounds satisfies the conditions for
// a partial word. This is defined as follows:
//   1) the sounds don't exceed any of the numeric criteria in the given traits;
//   2) if there's only one sound, it must be the first sound in at least one
//      of the sound pairs in the given traits;
//   3) if there's at least one pair, the sequence of pairs must be valid as
//      defined in Traits#validPairs.
function traits$validPart (sounds: string[]): boolean {
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

// Takes a valid partial word and checks if it's also a valid complete word,
// using the following criteria:
//   1) the number of vowels must fit within the bounds;
//   2) the number of sounds must fit within the bounds.
// The behaviour of this method for input values other than partial words is
// undefined.
function traits$validComplete (sounds: string[]): boolean {
  // Check vowel count.
  const nVow = traits$countVowels.call(this, sounds)
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
function traits$validPairs (sounds: string[]): boolean {
  if (sounds.length < 2) return true

  // Variables to keep track of the last three pairs, up to current. This is
  // used for checking condition (2).
  let secondLastPair: Pair
  let lastPair: Pair
  let pair: Pair

  // Loop over the sequence, checking each condition.
  let prev: string
  for (let index = 0; index < sounds.length; index++) {
    let current: string = sounds[index]
    if (!index) {
      prev = current
      continue
    }

    [secondLastPair, lastPair, pair] = [lastPair, pair, new Pair(prev, current)]

    // Check for condition (2). This can only be done starting at index 3.
    if (index >= 3) {
      if (secondLastPair === pair) return false
    }

    // Check for condition (3).
    if (countPair(sounds.slice(0, index + 1), prev, current) > 2) {
      return false
    }

    prev = current
  }

  return true
}

// Returns the biggest number of consequtive vowels that occurs in the given
// sound sequence.
function traits$maxConsequtiveVowels (sounds: string[]): number {
  let count = 0
  let max = 0
  const known = this.knownVowels || knownVowels
  sounds.forEach(sound => {
    if (!known.has(sound)) count = 0
    else max = Math.max(max, ++count)
  })
  return max
}

// Returns the biggest number of consequtive consonants that occurs in the given
// sound sequence.
function traits$maxConsequtiveConsonants (sounds: string[]): number {
  let count = 0
  let max = 0
  const known = this.knownVowels || knownVowels
  sounds.forEach(sound => {
    if (known.has(sound)) count = 0
    else max = Math.max(max, ++count)
  })
  return max
}

// Counts how many sounds from the given sequence occur among own known vowels.
function traits$countVowels (sounds: string[]): number {
  const known = this.knownVowels || knownVowels
  let count = 0
  sounds.forEach(sound => {if (known.has(sound)) count++})
  return count
}

/** ******************************** State ***********************************/

class State {

  tree = new Tree()

  constructor (traits: Traits) {
    this.traits = traits
  }

  // Walks the virtual tree of the state's traits, caching the visited parts in
  // the state's inner tree. This caching lets us skip repeated
  // Traits#validPart() checks, individual visited nodes, and fully visited
  // subtrees. This significantly speeds up State#trip() traversals that restart
  // from the root on each call, and lets us avoid revisiting nodes. This method
  // also randomises the order of visiting subtrees from each node.
  walk (iterator: Function, sounds: ?string[]) {
    if (!(sounds instanceof Array)) sounds = []

    // Find or create a matching node for this path. If it doesn't have child
    // nodes yet, make a shallow map to track valid paths.
    const node = this.tree.at(sounds)
    if (node.nodes === null) {
      node.nodes = Tree.sprout(this.traits.pairSet, sounds)
    }

    // Loop over remaining child nodes and investigate their subtrees.
    _.shuffle(_.keys(node.nodes)).forEach(sound => {
      const path = sounds.concat(sound)
      // Invalidate the path if it doesn't qualify as a partial word.
      if (!traits$validPart.call(this.traits, path)) {
        delete node.nodes[sound]
        return
      }
      // (1)(2) -> pre-order, (2)(1) -> post-order. Post-order is required by
      // State#walkRandom().
      // (2) Continue recursively.
      this.walk(iterator, path)
      // (1) If this path hasn't yet been visited, feed it to the iterator.
      if (!node.at([sound]).visited) iterator(path)
      // If this code is reached, the subtree is used up, so we forget about it.
      delete node.nodes[sound]
    })
  }

  // Walks the state's virtual tree; for each path given to the wrapper
  // function, we visit its subpaths in random order, marking the corresponding
  // nodes as visited. For the distribution to be random, the tree needs to be
  // traversed in post-order. We only visit paths that qualify as valid complete
  // words and haven't been visited before.
  walkRandom (iterator: Function) {
    this.walk((sounds: string[]) => {
      _.shuffle(_.range(sounds.length)).forEach(index => {
        if (!index) return

        const path = sounds.slice(0, index + 1)
        const node = this.tree.at(path)

        if (!node.visited) {
          node.visited = true
          if (traits$validComplete.call(this.traits, path)) {
            iterator(path)
          }
        }
      })
    })
  }

  trip (iterator: Function) {
    try {
      this.walkRandom((sounds: string[]) => {
        iterator(sounds)
        throw null // eslint-disable-line
      })
    } catch (err) {
      if (err !== null) throw err
    }
  }

}

/** ******************************** Tree ************************************/

class Tree {

  // Map of strings to Tree objects. Keys represent node values (sounds).
  nodes = null
  visited = false

  at (path: string[]): Tree {
    let node = this
    path.forEach(value => {
      if (!node.nodes[value]) node.nodes[value] = new Tree()
      node = node.nodes[value]
    })
    return node
  }

  // Creates child nodes for a tree from the given pairs on the given path.
  static sprout (pairs: PairSet, path: string[]): {} {
    const nodes = Object.create(null)

    // If no sound were passed, start from the root.
    if (!path.length) {
      pairs.forEach(pair => {
        nodes[pair[0]] = nodes[pair[0]] || new Tree()
      })
    } else {
      // Otherwise continue from the given path.
      // [ ... sounds ... ( last sound ] <- pair -> next sound )
      //
      // We investigate pairs that begin with the last sound of the given
      // preceding sounds. Their second sounds form a set that, when individually
      // appended to the preceding sounds, form foundation paths for child
      // subtrees. We register these second sounds on the child node map.
      pairs.forEach(pair => {
        if (pair[0] === path[path.length - 1]) {
          nodes[pair[1]] = new Tree()
        }
      })
    }

    return nodes
  }

}

/** ****************************** Utilities *********************************/

// Takes a word and splits it into a series of known glyphs representing sounds.
function getSounds (word: string, known: StringSet): string[] {
  const sounds = []

  // Loop over the word, matching known glyphs. Break if no match is found.
  for (let i = 0; i < word.length; i++) {
    // Check for a known digraph.
    const digraph = word[i] + word[i + 1]
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
function getPairs (sounds: string[]): PairSet {
  const pairs = new PairSet()
  for (let i = 0; i < sounds.length - 1; i++) {
    pairs.add(new Pair(sounds[i], sounds[i + 1]))
  }
  return pairs
}

// Counts the occurrences of the given pair of strings in the given sequence.
function countPair (strings: string[], prev: string, current: string): number {
  let count = 0
  let ownPrev: string
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

// Asserts that the given value is a string.
function assertString (value: ?string) {
  if (typeof value !== 'string') {
    throw new TypeError('expected a string, got: ' + value)
  }
}
