/*********************************** Tree ************************************/

class Tree extends null {

  nodes: ?{[key: string]: Tree};
  visited: boolean;

  constructor() {
    this.nodes = null
    this.visited = false
  }

  at(...path: string[]): Tree {
    var node = this
    for (let value of path) {
      if (!node.nodes[value]) node.nodes[value] = new Tree()
      node = node.nodes[value]
    }
    return node
  }

  // Creates child nodes for a tree from the given pairs on the given path.
  static sprout(pairs: PairSet, ...path: string[]): {} {
    var nodes = Object.create(null)

    // If no sound were passed, start from the root.
    if (!path.length) {
      for (var pair of pairs) {
        nodes[pair[0]] = nodes[pair[0]] || new Tree()
      }
    }
    // Otherwise continue from the given path.
    else {
      // [ ... sounds ... ( last sound ] <- pair -> next sound )
      //
      // We investigate pairs that begin with the last sound of the given
      // preceding sounds. Their second sounds form a set that, when individually
      // appended to the preceding sounds, form foundation paths for child
      // subtrees. We register these second sounds on the child node map.
      for (var pair of pairs) {
        if (pair[0] === path[path.length - 1]) {
          nodes[pair[1]] = new Tree()
        }
      }
    }

    return nodes
  }

  static validate(value: ?Tree) {
    if (!(value instanceof Tree)) {
      throw new TypeError('expected a Tree object, got: ' + value)
    }
  }

}

/********************************** PairSet **********************************/

// Behaves like a set of pairs of strings. Not compliant with the Set API.
class PairSet extends Array {

  constructor(pairs?: Pair[]) {
    if (!pairs) return
    if (!(pairs instanceof Array)) {
      throw new TypeError('expected an array of Pairs, got: ' + pairs)
    }
    for (let pair of pairs) {
      Pair.validate(pair)
      this.add(pair)
    }
  }

  has(pair: ?Pair): boolean {
    Pair.validate(pair)
    for (let existing of this) {
      if (pair[0] === existing[0] && pair[1] === existing[1]) return true
    }
    return false
  }

  add(pair: ?Pair): void {
    Pair.validate(pair)
    if (!this.has(pair)) this.push(pair)
  }

  del(pair: ?Pair): void {
    Pair.validate(pair)
    for (let i = 0; i < this.length; i++) {
      let existing = this[i]
      if (pair[0] === existing[0] && pair[1] === existing[1]) {
        this.splice(i, 1)
        return
      }
    }
  }

}

/*********************************** Pair ************************************/

// Pair of strings.
class Pair extends null {

  0: string;
  1: string;

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

function getSounds(word: string, known: Set): string[] {
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
// occur in this sequence.
function getPairs(sounds: string[]): PairSet {
  var pairs = new PairSet()
  for (let i = 0; i < sounds.length - 1; i++) {
    pairs.add(new Pair(sounds[i], sounds[i + 1]))
  }
  return pairs
}

function validLength(word: string): boolean {
  return word.length > 1 && word.length < 33
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

/************************* Validators for Primitives *************************/

function string$validate(value: ?string): void {
  if (typeof value !== 'string') {
    throw new TypeError('expected a string, got: ' + value)
  }
}
