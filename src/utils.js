
/********************************* Utilities *********************************/

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
