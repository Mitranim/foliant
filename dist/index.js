(function(factory) {
  if (typeof module !== 'undefined' && module.exports) {
    factory(module, require('lodash'));
  } else if (typeof angular !== 'undefined' && angular.module) {
    var mod = {exports: {}}
    factory(mod, window._);
    angular.module('foliant', []).value('Traits', mod.exports);
  }
})(function(module, _) {
  /* global _ */

/**
 * Style per http://standardjs.com
 */

/** ******************************** Pair ************************************/

// Pair of strings.
'use strict';

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Pair = function Pair(one, two) {
  _classCallCheck(this, Pair);

  assertString(one);
  assertString(two);
  this[0] = one;
  this[1] = two;
}

/** ****************************** StringSet *********************************/

// Behaves like a set of strings.
;

var StringSet = (function () {
  function StringSet(values) {
    _classCallCheck(this, StringSet);

    if (values) values.forEach(this.add, this);
  }

  /** ******************************* PairSet **********************************/

  // Behaves like a set of pairs of strings. Does not conform to the Set API.

  _createClass(StringSet, [{
    key: 'has',
    value: function has(value) {
      return this[value] === null;
    }
  }, {
    key: 'add',
    value: function add(value) {
      this[value] = null;
    }
  }, {
    key: 'del',
    value: function del(value) {
      delete this[value];
    }
  }]);

  return StringSet;
})();

var PairSet = (function (_Array) {
  _inherits(PairSet, _Array);

  function PairSet(pairs) {
    _classCallCheck(this, PairSet);

    _get(Object.getPrototypeOf(PairSet.prototype), 'constructor', this).call(this);
    if (pairs) pairs.forEach(this.add, this);
  }

  /** ****************************** Constants *********************************/

  // Glyphs and digraphs in common English use. This doesn't represent all common
  // phonemes.

  _createClass(PairSet, [{
    key: 'has',
    value: function has(pair) {
      return _.any(this, function (existing) {
        return pair[0] === existing[0] && pair[1] === existing[1];
      });
    }
  }, {
    key: 'add',
    value: function add(pair) {
      if (!this.has(pair)) this.push(pair);
    }
  }, {
    key: 'del',
    value: function del(pair) {
      _.remove(this, function (existing) {
        return pair[0] === existing[0] && pair[1] === existing[1];
      });
    }
  }]);

  return PairSet;
})(Array);

var knownSounds = new StringSet([
// Digraphs
'ae', 'ch', 'ng', 'ph', 'sh', 'th', 'zh',
// ISO basic Latin monographs
'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']);

// Vowel glyphs and digraphs in common English use.
var knownVowels = new StringSet([
// Digraphs
'ae',
// ISO basic Latin monographs
'a', 'e', 'i', 'o', 'u', 'y']);

/** ******************************* Traits ***********************************/

/* -------------------------------- Public ----------------------------------*/

var Traits = (function () {
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
    this.knownSounds = null;
    this.knownVowels = null;

    if (words instanceof Array) this.examine(words);
  }

  /* -------------------------------- Private ---------------------------------*/

  // Takes a word, extracts its characteristics, and merges them into self. If the
  // word doesn't satisfy our limitations, returns an error.

  // Examines an array of words and merges their traits into self.

  _createClass(Traits, [{
    key: 'examine',
    value: function examine(words) {
      if (!(words instanceof Array)) {
        throw new TypeError('the argument to Traits#examine must be an array of strings');
      }
      words.forEach(traits$examineWord, this);
    }

    // Creates a generator function that returns a new word on each call. The
    // words are guaranteed to never repeat and be randomly distributed in the
    // traits' word set. When the set is exhausted, further calls return "".
  }, {
    key: 'generator',
    value: function generator() {
      var state = new State(this);
      return function () {
        var result = '';
        state.trip(function (sounds) {
          result = sounds.join('');
        });
        return result;
      };
    }
  }]);

  return Traits;
})();

function traits$examineWord(word) {
  assertString(word);

  // Validate the length.
  if (word.length < 2 && word.length > 32) {
    throw new Error('the word is too short or too long');
  }

  // Split into sounds.
  var sounds = getSounds(word, this.knownSounds || knownSounds);

  // Mandate at least two sounds.
  if (sounds.length < 2) {
    throw new Error('a word must have at least two sounds, found: ' + sounds);
  }

  // Merge min and max total number of sounds.
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
  sounds.forEach(this.soundSet.add, this.soundSet);

  // Find set of pairs of sounds.
  getPairs(sounds).forEach(this.pairSet.add, this.pairSet);
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
    })) return true;
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
  if (sounds.length < 2) return true;

  // Variables to keep track of the last three pairs, up to current. This is
  // used for checking condition (2).
  var secondLastPair = undefined;
  var lastPair = undefined;
  var pair = undefined;

  // Loop over the sequence, checking each condition.
  var prev = undefined;
  for (var index = 0; index < sounds.length; index++) {
    var current = sounds[index];
    if (!index) {
      prev = current;
      continue;
    }

    // Check for condition (2). This can only be done starting at index 3.
    var _ref = [lastPair, pair, new Pair(prev, current)];
    secondLastPair = _ref[0];
    lastPair = _ref[1];
    pair = _ref[2];
    if (index >= 3) {
      if (secondLastPair === pair) return false;
    }

    // Check for condition (3).
    if (countPair(sounds.slice(0, index + 1), prev, current) > 2) {
      return false;
    }

    prev = current;
  }

  return true;
}

// Returns the biggest number of consequtive vowels that occurs in the given
// sound sequence.
function traits$maxConsequtiveVowels(sounds) {
  var count = 0;
  var max = 0;
  var known = this.knownVowels || knownVowels;
  sounds.forEach(function (sound) {
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
  sounds.forEach(function (sound) {
    if (known.has(sound)) count = 0;else max = Math.max(max, ++count);
  });
  return max;
}

// Counts how many sounds from the given sequence occur among own known vowels.
function traits$countVowels(sounds) {
  var known = this.knownVowels || knownVowels;
  var count = 0;
  sounds.forEach(function (sound) {
    if (known.has(sound)) count++;
  });
  return count;
}

/** ******************************** State ***********************************/

var State = (function () {
  function State(traits) {
    _classCallCheck(this, State);

    this.tree = new Tree();

    this.traits = traits;
  }

  /** ******************************** Tree ************************************/

  // Walks the virtual tree of the state's traits, caching the visited parts in
  // the state's inner tree. This caching lets us skip repeated
  // Traits#validPart() checks, individual visited nodes, and fully visited
  // subtrees. This significantly speeds up State#trip() traversals that restart
  // from the root on each call, and lets us avoid revisiting nodes. This method
  // also randomises the order of visiting subtrees from each node.

  _createClass(State, [{
    key: 'walk',
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
      _.shuffle(_.keys(node.nodes)).forEach(function (sound) {
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
        if (!node.at([sound]).visited) iterator(path);
        // If this code is reached, the subtree is used up, so we forget about it.
        delete node.nodes[sound];
      });
    }

    // Walks the state's virtual tree; for each path given to the wrapper
    // function, we visit its subpaths in random order, marking the corresponding
    // nodes as visited. For the distribution to be random, the tree needs to be
    // traversed in post-order. We only visit paths that qualify as valid complete
    // words and haven't been visited before.
  }, {
    key: 'walkRandom',
    value: function walkRandom(iterator) {
      var _this2 = this;

      this.walk(function (sounds) {
        _.shuffle(_.range(sounds.length)).forEach(function (index) {
          if (!index) return;

          var path = sounds.slice(0, index + 1);
          var node = _this2.tree.at(path);

          if (!node.visited) {
            node.visited = true;
            if (traits$validComplete.call(_this2.traits, path)) {
              iterator(path);
            }
          }
        });
      });
    }
  }, {
    key: 'trip',
    value: function trip(iterator) {
      try {
        this.walkRandom(function (sounds) {
          iterator(sounds);
          throw null; // eslint-disable-line
        });
      } catch (err) {
        if (err !== null) throw err;
      }
    }
  }]);

  return State;
})();

var Tree = (function () {
  function Tree() {
    _classCallCheck(this, Tree);

    this.nodes = null;
    this.visited = false;
  }

  /** ****************************** Utilities *********************************/

  // Takes a word and splits it into a series of known glyphs representing sounds.

  _createClass(Tree, [{
    key: 'at',
    value: function at(path) {
      var node = this;
      path.forEach(function (value) {
        if (!node.nodes[value]) node.nodes[value] = new Tree();
        node = node.nodes[value];
      });
      return node;
    }

    // Creates child nodes for a tree from the given pairs on the given path.
  }], [{
    key: 'sprout',
    value: function sprout(pairs, path) {
      var nodes = Object.create(null);

      // If no sound were passed, start from the root.
      if (!path.length) {
        pairs.forEach(function (pair) {
          nodes[pair[0]] = nodes[pair[0]] || new Tree();
        });
      } else {
        // Otherwise continue from the given path.
        // [ ... sounds ... ( last sound ] <- pair -> next sound )
        //
        // We investigate pairs that begin with the last sound of the given
        // preceding sounds. Their second sounds form a set that, when individually
        // appended to the preceding sounds, form foundation paths for child
        // subtrees. We register these second sounds on the child node map.
        pairs.forEach(function (pair) {
          if (pair[0] === path[path.length - 1]) {
            nodes[pair[1]] = new Tree();
          }
        });
      }

      return nodes;
    }
  }]);

  return Tree;
})();

function getSounds(word, known) {
  var sounds = [];

  // Loop over the word, matching known glyphs. Break if no match is found.
  for (var i = 0; i < word.length; i++) {
    // Check for a known digraph.
    var digraph = word[i] + word[i + 1];
    if (digraph.length > 1 && known.has(digraph)) {
      sounds.push(digraph);
      i++;
      // Check for a known monograph.
    } else if (known.has(word[i])) {
        sounds.push(word[i]);
        // Otherwise throw an error.
      } else {
          throw new Error('encountered unknown symbol: ' + word[i]);
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
  var ownPrev = undefined;
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
  if (typeof value !== 'string') {
    throw new TypeError('expected a string, got: ' + value);
  }
}

// Minimum and maximum number of sounds.

// Minimum and maximum number of vowels.

// Maximum number of consequtive vowels.

// Maximum number of consequtive consonants.

// Set of sounds that occur in the words.

// Set of pairs of sounds that occur in the words.

// Replacement sound set to use instead of the default `knownSounds`.

// Replacement sound set to use instead of the default `knownVowels`.

// Map of strings to Tree objects. Keys represent node values (sounds).
  module.exports = Traits;
  if (typeof process === 'object' && process !== null && process.env.CODEX_ENV === 'testing') Traits.Pair = Pair;
  if (typeof process === 'object' && process !== null && process.env.CODEX_ENV === 'testing') Traits.PairSet = PairSet;
  Traits.StringSet = StringSet;
});