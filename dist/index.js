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

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*********************************** Tree ************************************/

var Tree = (function (_ref) {
  function Tree() {
    _classCallCheck(this, Tree);

    this.nodes = null;
    this.visited = false;
  }

  _inherits(Tree, _ref);

  _prototypeProperties(Tree, {
    sprout: {

      // Creates child nodes for a tree from the given pairs on the given path.

      value: function sprout(pairs) {
        for (var _len = arguments.length, path = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          path[_key - 1] = arguments[_key];
        }

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
    },
    validate: {
      value: function validate(value) {
        if (!(value instanceof Tree)) {
          throw new TypeError("expected a Tree object, got: " + value);
        }
      },
      writable: true,
      configurable: true
    }
  }, {
    at: {
      value: function at() {
        for (var _len = arguments.length, path = Array(_len), _key = 0; _key < _len; _key++) {
          path[_key] = arguments[_key];
        }

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

var StringSet = (function (_ref2) {
  function StringSet(values) {
    var _this = this;

    _classCallCheck(this, StringSet);

    _.each(values, function (value) {
      string$validate(value);
      _this.add(value);
    });
  }

  _inherits(StringSet, _ref2);

  _prototypeProperties(StringSet, null, {
    has: {
      value: function has(value) {
        string$validate(value);
        return this[value] === null;
      },
      writable: true,
      configurable: true
    },
    add: {
      value: function add(value) {
        string$validate(value);
        this[value] = null;
      },
      writable: true,
      configurable: true
    },
    del: {
      value: function del(value) {
        string$validate(value);
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
    var _this = this;

    _classCallCheck(this, PairSet);

    if (!pairs) {
      return;
    }if (!(pairs instanceof Array)) {
      throw new TypeError("expected an array of Pairs, got: " + pairs);
    }
    _.each(pairs, function (pair) {
      Pair.validate(pair);
      _this.add(pair);
    });
  }

  _inherits(PairSet, Array);

  _prototypeProperties(PairSet, null, {
    has: {
      value: function has(pair) {
        Pair.validate(pair);
        return _.any(this, function (existing) {
          return pair[0] === existing[0] && pair[1] === existing[1];
        });
      },
      writable: true,
      configurable: true
    },
    add: {
      value: function add(pair) {
        Pair.validate(pair);
        if (!this.has(pair)) this.push(pair);
      },
      writable: true,
      configurable: true
    },
    del: {
      value: function del(pair) {
        Pair.validate(pair);
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

var Pair = (function (_ref3) {
  function Pair(one, two) {
    _classCallCheck(this, Pair);

    string$validate(one);
    string$validate(two);
    this[0] = one;
    this[1] = two;
  }

  _inherits(Pair, _ref3);

  _prototypeProperties(Pair, {
    validate: {
      value: function validate(value) {
        if (!(value instanceof Pair)) {
          throw new TypeError("expected a Pair, got: " + value);
        }
      },
      writable: true,
      configurable: true
    }
  });

  return Pair;
})(null);
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

    this.minNSounds = 0;
    this.maxNSounds = 0;
    this.minNVowels = 0;
    this.maxNVowels = 0;
    this.maxConseqVow = 0;
    this.maxConseqCons = 0;
    this.soundSet = new StringSet();
    this.pairSet = new PairSet();

    if (words instanceof Array) this.examine(words);
  }

  _inherits(Traits, _ref);

  _prototypeProperties(Traits, {
    validate: {
      value: function validate(value) {
        if (!(value instanceof Traits)) {
          throw new TypeError("expected a Traits object, got: " + value);
        }
      },
      writable: true,
      configurable: true
    }
  }, {
    examine: {

      // Examines an array of words and merges their traits into self.

      value: function examine(words) {
        _.each(words, traits$examineWord.bind(this));
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
          state.trip(function () {
            for (var _len = arguments.length, sounds = Array(_len), _key = 0; _key < _len; _key++) {
              sounds[_key] = arguments[_key];
            }

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
  var _this = this;

  string$validate(word);

  // Make sure the length is okay.
  if (!validLength(word)) {
    throw new Error("the word is too short or too long");
  }

  // Split into sounds.
  var sounds = getSounds(word, traits$knownSounds.call(this));

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
  _.each(sounds, function (sound) {
    return _this.soundSet.add(sound);
  });

  // Find set of pairs of sounds.
  _.each(getPairs(sounds), function (pair) {
    return _this.pairSet.add(pair);
  });
}

function traits$knownSounds() {
  if (this.knownSounds instanceof StringSet && this.knownSounds.size) {
    return this.knownSounds;
  }
  return knownSounds;
}

function traits$knownVowels() {
  if (this.knownVowels instanceof StringSet && this.knownVowels.size) {
    return this.knownVowels;
  }
  return knownVowels;
}

// Checks whether the given combination of sounds satisfies the conditions for
// a partial word. This is defined as follows:
//   1) the sounds don't exceed any of the numeric criteria in the given traits;
//   2) if there's only one sound, it must be the first sound in at least one
//      of the sound pairs in the given traits;
//   3) if there's at least one pair, the sequence of pairs must be valid as
//      defined in Traits.validPairs.
function traits$validPart() {
  for (var _len = arguments.length, sounds = Array(_len), _key = 0; _key < _len; _key++) {
    sounds[_key] = arguments[_key];
  }

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

  // Check if the pair sequence is valid per Traits.validPairs.
  if (sounds.length > 1 && !traits$validPairs.call(this, sounds)) {
    return false;
  }

  return true;
}

// Checks whether the given sequence of sounds satisfies the criteria for a
// complete word. This is defined as follows:
//   1) the sequence satisfies the partial criteria per Traits.validPart();
//   2) the sequence satisfies the complete criteria per Traits.checkPart().
function traits$validComplete() {
  for (var _len = arguments.length, sounds = Array(_len), _key = 0; _key < _len; _key++) {
    sounds[_key] = arguments[_key];
  }

  return traits$validPart.call.apply(traits$validPart, [this].concat(sounds)) && traits$checkPart.call.apply(traits$checkPart, [this].concat(sounds));
}

// Takes a valid partial word and checks if it's also a valid complete word,
// using the following criteria:
//   1) the number of vowels must fit within the bounds;
//   2) the number of sounds must fit within the bounds.
// The behaviour of this method for input values other than partial words is
// undefined.
function traits$checkPart() {
  for (var _len = arguments.length, sounds = Array(_len), _key = 0; _key < _len; _key++) {
    sounds[_key] = arguments[_key];
  }

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

    var _ref2 = [lastPair, pair, new Pair(prev, current)];

    var _ref22 = _slicedToArray(_ref2, 3);

    secondLastPair = _ref22[0];
    lastPair = _ref22[1];
    pair = _ref22[2];

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
  var known = traits$knownVowels.call(this);
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
  var known = traits$knownVowels.call(this);
  _.each(sounds, function (sound) {
    if (known.has(sound)) count = 0;else max = Math.max(max, ++count);
  });
  return max;
}

// Counts how many sounds from the given sequence occur among own known vowels.
function traits$countVowels(sounds) {
  var count = 0;
  var known = traits$knownVowels.call(this);
  _.each(sounds, function (sound) {
    if (known.has(sound)) count++;
  });
  return count;
}

// Minimum and maximum number of sounds.

// Minimum and maximum number of vowels.

// Maximum number of consequtive vowels.

// Maximum number of consequtive consonants.

// Set of sounds that occur in the words.

// Set of pairs of sounds that occur in the words.

// Replacement sound set to use instead of the default `knownSounds`.

// Replacement sound set to use instead of the default `knownVowels`.
"use strict";

/**
 * Defines known sounds.
 */

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
"use strict";

var _toConsumableArray = function (arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*********************************** State ***********************************/

var State = (function (_ref) {
  function State(traits) {
    _classCallCheck(this, State);

    Traits.validate(traits);
    this.traits = traits;
    this.tree = new Tree();
  }

  _inherits(State, _ref);

  _prototypeProperties(State, {
    validate: {
      value: function validate(value) {
        if (!(value instanceof State)) {
          throw new TypeError("expected a State object, got: " + value);
        }
      },
      writable: true,
      configurable: true
    }
  }, {
    walk: {

      // Walks the virtual tree of the state's traits, caching the visited parts in
      // the state's inner tree. This caching lets us skip repeated
      // Traits.validPart() checks, individual visited nodes, and fully visited
      // subtrees. This significantly speeds up state.trip() traversals that restart
      // from the root on each call, and lets us avoid revisiting nodes. This method
      // also randomises the order of visiting subtrees from each node.

      value: function walk(iterator) {
        var _this = this;

        var _tree;

        for (var _len = arguments.length, sounds = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          sounds[_key - 1] = arguments[_key];
        }

        // Find or create a matching node for this path. If it doesn't have child
        // nodes yet, make a shallow map to track valid paths.
        var node = (_tree = this.tree).at.apply(_tree, sounds);
        if (node.nodes === null) {
          var _Tree;

          node.nodes = (_Tree = Tree).sprout.apply(_Tree, [this.traits.pairSet].concat(sounds));
        }

        // Loop over remaining child nodes and investigate their subtrees.
        _.each(_.shuffle(_.keys(node.nodes)), function (sound) {
          var _traits$validPart, _ref2;

          var path = sounds.concat(sound);
          // Invalidate the path if it doesn't qualify as a partial word.
          if (!(_traits$validPart = traits$validPart).call.apply(_traits$validPart, [_this.traits].concat(_toConsumableArray(path)))) {
            delete node.nodes[sound];
            return;
          }
          // (1)(2) -> pre-order, (2)(1) -> post-order. Post-order is required by
          // state.walkRandom(); it slows down state.Words() by about 10-15%, which
          // doesn't warrant its own separate algorithm.
          // (2) Continue recursively.
          (_ref2 = _this).walk.apply(_ref2, [iterator].concat(_toConsumableArray(path)));
          // (1) If this path hasn't yet been visited, feed it to the iterator.
          if (!node.at(sound).visited) {
            iterator.apply(undefined, _toConsumableArray(path));
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

        this.walk(function () {
          for (var _len = arguments.length, sounds = Array(_len), _key = 0; _key < _len; _key++) {
            sounds[_key] = arguments[_key];
          }

          _.each(_.shuffle(_.range(sounds.length)), function (index) {
            var _tree;

            if (!index) return;
            var path = sounds.slice(0, index + 1);
            var node = (_tree = _this.tree).at.apply(_tree, _toConsumableArray(path));
            if (!node.visited) {
              var _traits$checkPart;

              node.visited = true;
              if ((_traits$checkPart = traits$checkPart).call.apply(_traits$checkPart, [_this.traits].concat(_toConsumableArray(path)))) {
                iterator.apply(undefined, _toConsumableArray(path));
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
          this.walkRandom(function () {
            for (var _len = arguments.length, sounds = Array(_len), _key = 0; _key < _len; _key++) {
              sounds[_key] = arguments[_key];
            }

            iterator.apply(undefined, sounds);
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
"use strict";

/********************************* Utilities *********************************/

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
// occur in this sequence.
function getPairs(sounds) {
  var pairs = new PairSet();
  for (var i = 0; i < sounds.length - 1; i++) {
    pairs.add(new Pair(sounds[i], sounds[i + 1]));
  }
  return pairs;
}

function validLength(word) {
  return word.length > 1 && word.length < 33;
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

/************************* Validators for Primitives *************************/

function string$validate(value) {
  if (typeof value !== "string") {
    throw new TypeError("expected a string, got: " + value);
  }
}
// Check for a known monograph.
// Otherwise throw an error.
    module.exports = Traits;
    if (typeof process === 'object' && process !== null && process.env.CODEX_ENV === 'testing') Traits.Pair = Pair;
    if (typeof process === 'object' && process !== null && process.env.CODEX_ENV === 'testing') Traits.PairSet = PairSet;
    Traits.StringSet = StringSet;
  });