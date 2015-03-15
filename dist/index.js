(function(factory) {
    if (typeof module !== 'undefined' && module.exports) {
      factory(module, require('lodash'));
    } else if (typeof angular !== 'undefined' && angular.module) {
      var mod = {exports: {}}
      factory(mod, window._);
      angular.module('foliant', []).value('Traits', mod.exports);
    }
  })(function(module, _) {
    "use strict";

var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) { _arr.push(_step.value); if (i && _arr.length === i) break; } return _arr; } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/********************************** Traits ***********************************/

/*--------------------------------- Public ----------------------------------*/

var Traits = (function (_ref) {
  function Traits(words) {
    _classCallCheck(this, Traits);

    // Minimum and maximum number of sounds.
    this.minNSounds = 0;
    this.maxNSounds = 0;
    // Minimum and maximum number of vowels.
    this.minNVowels = 0;
    this.maxNVowels = 0;
    // Maximum number of consequtive vowels.
    this.maxConseqVow = 0;
    // Maximum number of consequtive consonants.
    this.maxConseqCons = 0;
    // Set of sounds that occur in the words.
    this.soundSet = new StringSet();
    // Set of pairs of sounds that occur in the words.
    this.pairSet = new PairSet();

    // Replacement sound set to use instead of the default `knownSounds`.
    this.knownSounds = null;
    // Replacement sound set to use instead of the default `knownVowels`.
    this.knownVowels = null;

    if (words instanceof Array) this.examine(words);
  }

  _inherits(Traits, _ref);

  _prototypeProperties(Traits, null, {
    examine: {

      // Examines an array of words and merges their traits into self.

      value: function examine(words) {
        if (!(words instanceof Array)) {
          throw new TypeError("the argument to Traits#examine must be an array of strings");
        }
        _.each(words, traits$examineWord, this);
      },
      writable: true,
      configurable: true
    },
    generator: {

      // Creates a generator function that returns a new word on each call. The
      // words are guaranteed to never repeat and be randomly distributed in the
      // traits' word set. When the set is exhausted, further calls return "".

      value: function generator() {
        var state = new State(this);
        return function () {
          var result = "";
          state.trip(function (sounds) {
            result = sounds.join("");
          });
          return result;
        };
      },
      writable: true,
      configurable: true
    }
  });

  return Traits;
})(null);

/*--------------------------------- Private ---------------------------------*/

// Takes a word, extracts its characteristics, and merges them into self. If the
// word doesn't satisfy our limitations, returns an error.
function traits$examineWord(word) {
  assertString(word);

  // Validate the length.
  if (word.length < 2 && word.length > 32) {
    throw new Error("the word is too short or too long");
  }

  // Split into sounds.
  var sounds = getSounds(word, this.knownSounds || knownSounds);

  // Mandate at least two sounds.
  if (sounds.length < 2) {
    throw new Error("a word must have at least two sounds, found: " + sounds);
  }

  // Merge min and max number of consequtive sounds.
  this.minNSounds = Math.min(this.minNSounds || sounds.length, sounds.length);
  this.maxNSounds = Math.max(this.maxNSounds, sounds.length);

  // Merge min and max total number of vowels.
  var nVow = traits$countVowels.call(this, sounds);
  this.minNVowels = Math.min(this.minNVowels || nVow, nVow);
  this.maxNVowels = Math.max(this.maxNVowels, nVow);

  // Merge max number of consequtive vowels.
  this.maxConseqVow = Math.max(this.maxConseqVow, traits$maxConsequtiveVowels.call(this, sounds));

  // Merge max number of consequtive consonants.
  this.maxConseqCons = Math.max(this.maxConseqCons, traits$maxConsequtiveConsonants.call(this, sounds));

  // Merge set of used sounds.
  _.each(sounds, this.soundSet.add, this.soundSet);

  // Find set of pairs of sounds.
  _.each(getPairs(sounds), this.pairSet.add, this.pairSet);
}

// Checks whether the given combination of sounds satisfies the conditions for
// a partial word. This is defined as follows:
//   1) the sounds don't exceed any of the numeric criteria in the given traits;
//   2) if there's only one sound, it must be the first sound in at least one
//      of the sound pairs in the given traits;
//   3) if there's at least one pair, the sequence of pairs must be valid as
//      defined in Traits#validPairs.
function traits$validPart(sounds) {
  // Check numeric criteria.
  if (traits$countVowels.call(this, sounds) > this.maxNVowels || traits$maxConsequtiveVowels.call(this, sounds) > this.maxConseqVow || traits$maxConsequtiveConsonants.call(this, sounds) > this.maxConseqCons) {
    return false;
  }

  // If there's only one sound, check if it's among the first sounds of pairs.
  if (sounds.length === 1) {
    if (_.any(this.pairSet, function (pair) {
      return pair[0] === sounds[0];
    })) {
      return true;
    }
  }

  // Check if the pair sequence is valid per Traits#validPairs.
  if (sounds.length > 1 && !traits$validPairs.call(this, sounds)) {
    return false;
  }

  return true;
}

// Takes a valid partial word and checks if it's also a valid complete word,
// using the following criteria:
//   1) the number of vowels must fit within the bounds;
//   2) the number of sounds must fit within the bounds.
// The behaviour of this method for input values other than partial words is
// undefined.
function traits$validComplete(sounds) {
  // Check vowel count.
  var nVow = traits$countVowels.call(this, sounds);
  if (nVow < this.minNVowels || nVow > this.maxNVowels) {
    return false;
  }
  // Check sound count.
  if (sounds.length < this.minNSounds || sounds.length > this.maxNSounds) {
    return false;
  }
  return true;
}

// Verifies the validity of the sequence of sound pairs comprising the given
// word. Defined as follows:
//   1) the sequence must consist of sound pairs in the given traits; this is
//      implicitly guaranteed by the current tree traversal algorithms, so we
//      skip this check to save performance;
//   2) no sound pair immediately follows itself (e.g. "tata" in "ratatater");
//   3) no sound pair occurs more than twice.
function traits$validPairs(sounds) {
  if (sounds.length < 2) {
    return true;
  } // Variables to keep track of the last three pairs, up to current. This is
  // used for checking condition (2).
  var secondLastPair;
  var lastPair;
  var pair;

  // Loop over the sequence, checking each condition.
  var prev;
  for (var index = 0; index < sounds.length; index++) {
    var current = sounds[index];
    if (!index) {
      prev = current;
      continue;
    }

    var _ref6 = [lastPair, pair, new Pair(prev, current)];

    var _ref62 = _slicedToArray(_ref6, 3);

    secondLastPair = _ref62[0];
    lastPair = _ref62[1];
    pair = _ref62[2];

    // Check for condition (2). This can only be done starting at index 3.
    if (index >= 3) {
      if (secondLastPair === pair) {
        return false;
      }
    }

    // Check for condition (3).
    if (countPair(sounds.slice(0, index), prev, current) > 2) {
      return false;
    }

    prev = current;
  }

  return true;
}

// Returns the biggest number of consequtive vowels that occurs in the given
// sound sequence.
function traits$maxConsequtiveVowels(sounds) {
  var count,
      max = 0;
  var known = this.knownVowels || knownVowels;
  _.each(sounds, function (sound) {
    if (!known.has(sound)) count = 0;else max = Math.max(max, ++count);
  });
  return max;
}

// Returns the biggest number of consequtive consonants that occurs in the given
// sound sequence.
function traits$maxConsequtiveConsonants(sounds) {
  var count = 0;
  var max = 0;
  var known = this.knownVowels || knownVowels;
  _.each(sounds, function (sound) {
    if (known.has(sound)) count = 0;else max = Math.max(max, ++count);
  });
  return max;
}

// Counts how many sounds from the given sequence occur among own known vowels.
function traits$countVowels(sounds) {
  var count = 0;
  var known = this.knownVowels || knownVowels;
  _.each(sounds, function (sound) {
    if (known.has(sound)) count++;
  });
  return count;
}

/*********************************** State ***********************************/

var State = (function (_ref2) {
  function State(traits) {
    _classCallCheck(this, State);

    this.traits = traits;
    this.tree = new Tree();
  }

  _inherits(State, _ref2);

  _prototypeProperties(State, null, {
    walk: {

      // Walks the virtual tree of the state's traits, caching the visited parts in
      // the state's inner tree. This caching lets us skip repeated
      // Traits#validPart() checks, individual visited nodes, and fully visited
      // subtrees. This significantly speeds up State#trip() traversals that restart
      // from the root on each call, and lets us avoid revisiting nodes. This method
      // also randomises the order of visiting subtrees from each node.

      value: function walk(iterator, sounds) {
        var _this = this;

        if (!(sounds instanceof Array)) sounds = [];

        // Find or create a matching node for this path. If it doesn't have child
        // nodes yet, make a shallow map to track valid paths.
        var node = this.tree.at(sounds);
        if (node.nodes === null) {
          node.nodes = Tree.sprout(this.traits.pairSet, sounds);
        }

        // Loop over remaining child nodes and investigate their subtrees.
        _.each(_.shuffle(_.keys(node.nodes)), function (sound) {
          var path = sounds.concat(sound);
          // Invalidate the path if it doesn't qualify as a partial word.
          if (!traits$validPart.call(_this.traits, path)) {
            delete node.nodes[sound];
            return;
          }
          // (1)(2) -> pre-order, (2)(1) -> post-order. Post-order is required by
          // State#walkRandom().
          // (2) Continue recursively.
          _this.walk(iterator, path);
          // (1) If this path hasn't yet been visited, feed it to the iterator.
          if (!node.at([sound]).visited) {
            iterator(path);
          }
          // If this code is reached, the subtree is used up, so we forget about it.
          delete node.nodes[sound];
        });
      },
      writable: true,
      configurable: true
    },
    walkRandom: {

      // Walks the state's virtual tree; for each path given to the wrapper
      // function, we visit its subpaths in random order, marking the corresponding
      // nodes as visited. For the distribution to be random, the tree needs to be
      // traversed in post-order. We only visit paths that qualify as valid complete
      // words and haven't been visited before.

      value: function walkRandom(iterator) {
        var _this = this;

        this.walk(function (sounds) {
          _.each(_.shuffle(_.range(sounds.length)), function (index) {
            if (!index) return;
            var path = sounds.slice(0, index + 1);
            var node = _this.tree.at(path);
            if (!node.visited) {
              node.visited = true;
              if (traits$validComplete.call(_this.traits, path)) {
                iterator(path);
              }
            }
          });
        });
      },
      writable: true,
      configurable: true
    },
    trip: {
      value: function trip(iterator) {
        try {
          this.walkRandom(function (sounds) {
            iterator(sounds);
            throw null;
          });
        } catch (err) {
          if (err !== null) throw err;
        }
      },
      writable: true,
      configurable: true
    }
  });

  return State;
})(null);

/*********************************** Tree ************************************/

var Tree = (function (_ref3) {
  function Tree() {
    _classCallCheck(this, Tree);

    // Map of strings to Tree objects. Keys represent node values (sounds).
    this.nodes = null;
    this.visited = false;
  }

  _inherits(Tree, _ref3);

  _prototypeProperties(Tree, {
    sprout: {

      // Creates child nodes for a tree from the given pairs on the given path.

      value: function sprout(pairs, path) {
        var nodes = Object.create(null);

        // If no sound were passed, start from the root.
        if (!path.length) {
          _.each(pairs, function (pair) {
            nodes[pair[0]] = nodes[pair[0]] || new Tree();
          });
        }
        // Otherwise continue from the given path.
        else {
          // [ ... sounds ... ( last sound ] <- pair -> next sound )
          //
          // We investigate pairs that begin with the last sound of the given
          // preceding sounds. Their second sounds form a set that, when individually
          // appended to the preceding sounds, form foundation paths for child
          // subtrees. We register these second sounds on the child node map.
          _.each(pairs, function (pair) {
            if (pair[0] === path[path.length - 1]) {
              nodes[pair[1]] = new Tree();
            }
          });
        }

        return nodes;
      },
      writable: true,
      configurable: true
    }
  }, {
    at: {
      value: function at(path) {
        var node = this;
        _.each(path, function (value) {
          if (!node.nodes[value]) node.nodes[value] = new Tree();
          node = node.nodes[value];
        });
        return node;
      },
      writable: true,
      configurable: true
    }
  });

  return Tree;
})(null);

/********************************* StringSet *********************************/

// Behaves like a set of strings. Does not conform to the Set API.

var StringSet = (function (_ref4) {
  function StringSet(values) {
    _classCallCheck(this, StringSet);

    _.each(values, this.add, this);
  }

  _inherits(StringSet, _ref4);

  _prototypeProperties(StringSet, null, {
    has: {
      value: function has(value) {
        return this[value] === null;
      },
      writable: true,
      configurable: true
    },
    add: {
      value: function add(value) {
        this[value] = null;
      },
      writable: true,
      configurable: true
    },
    del: {
      value: function del(value) {
        delete this[value];
      },
      writable: true,
      configurable: true
    }
  });

  return StringSet;
})(null);

/********************************** PairSet **********************************/

// Behaves like a set of pairs of strings. Does not conform to the Set API.

var PairSet = (function (Array) {
  function PairSet(pairs) {
    _classCallCheck(this, PairSet);

    _.each(pairs, this.add, this);
  }

  _inherits(PairSet, Array);

  _prototypeProperties(PairSet, null, {
    has: {
      value: function has(pair) {
        return _.any(this, function (existing) {
          return pair[0] === existing[0] && pair[1] === existing[1];
        });
      },
      writable: true,
      configurable: true
    },
    add: {
      value: function add(pair) {
        if (!this.has(pair)) this.push(pair);
      },
      writable: true,
      configurable: true
    },
    del: {
      value: function del(pair) {
        _.remove(this, function (existing) {
          return pair[0] === existing[0] && pair[1] === existing[1];
        });
      },
      writable: true,
      configurable: true
    }
  });

  return PairSet;
})(Array);

/*********************************** Pair ************************************/

// Pair of strings.

var Pair = (function (_ref5) {
  function Pair(one, two) {
    _classCallCheck(this, Pair);

    assertString(one);
    assertString(two);
    this[0] = one;
    this[1] = two;
  }

  _inherits(Pair, _ref5);

  return Pair;
})(null);

/********************************* Utilities *********************************/

// Takes a word and splits it into a series of known glyphs representing sounds.
function getSounds(word, known) {
  var sounds = [];

  // Loop over the word, matching known glyphs. Break if no match is found.
  for (var i = 0; i < word.length; i++) {
    // Check for a known digraph.
    var digraph = word[i] + word[i + 1];
    if (digraph.length > 1 && known.has(digraph)) {
      sounds.push(digraph);
      i++;
    } else if (known.has(word[i])) {
      sounds.push(word[i]);
    } else {
      throw new Error("encountered unknown symbol: " + word[i]);
    }
  }

  return sounds;
}

// Takes a sequence of sounds and returns the set of consequtive pairs that
// occur in it.
function getPairs(sounds) {
  var pairs = new PairSet();
  for (var i = 0; i < sounds.length - 1; i++) {
    pairs.add(new Pair(sounds[i], sounds[i + 1]));
  }
  return pairs;
}

// Counts the occurrences of the given pair of strings in the given sequence.
function countPair(strings, prev, current) {
  var count = 0;
  var ownPrev;
  for (var index = 0; index < strings.length; index++) {
    var ownCurrent = strings[index];
    if (!index) {
      ownPrev = ownCurrent;
      continue;
    }
    if (ownPrev === prev && ownCurrent === current) count++;
  }
  return count;
}

// Asserts that the given value is a string.
function assertString(value) {
  if (typeof value !== "string") {
    throw new TypeError("expected a string, got: " + value);
  }
}

/******************************* Known Sounds ********************************/

// Glyphs and digraphs in common English use. This doesn't represent all common
// phonemes.
var knownSounds = new StringSet([
// Digraphs
"ae", "ch", "ng", "ph", "sh", "th", "zh",
// ISO basic Latin monographs
"a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"]);

// Vowel glyphs and digraphs in common English use.
var knownVowels = new StringSet([
// Digraphs
"ae",
// ISO basic Latin monographs
"a", "e", "i", "o", "u", "y"]);
// Check for a known monograph.
// Otherwise throw an error.
    module.exports = Traits;
    if (typeof process === 'object' && process !== null && process.env.CODEX_ENV === 'testing') Traits.Pair = Pair;
    if (typeof process === 'object' && process !== null && process.env.CODEX_ENV === 'testing') Traits.PairSet = PairSet;
    Traits.StringSet = StringSet;
  });