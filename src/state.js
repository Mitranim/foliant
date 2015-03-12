/*********************************** State ***********************************/

class State extends null {

  traits: Traits;
  tree: Tree;

  constructor(traits: Traits) {
    Traits.validate(traits)
    this.traits = traits
    this.tree = new Tree()
  }

  // Walks the virtual tree of the state's traits, caching the visited parts in
  // the state's inner tree. This caching lets us skip repeated
  // Traits.validPart() checks, individual visited nodes, and fully visited
  // subtrees. This significantly speeds up state.trip() traversals that restart
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
      // state.walkRandom(); it slows down state.Words() by about 10-15%, which
      // doesn't warrant its own separate algorithm.
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
