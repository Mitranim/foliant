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
    if (!pairs) return
    if (!(pairs instanceof Array)) {
      throw new TypeError('expected an array of Pairs, got: ' + pairs)
    }
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
