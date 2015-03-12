/**
 * Defines known sounds.
 */

// Glyphs and digraphs in common English use. This doesn't represent all common
// phonemes.
const knownSounds = new Set([
  // Digraphs
  'ae', 'ch', 'ng', 'ph', 'sh', 'th', 'zh',
  // ISO basic Latin monographs
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
  'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
])

// Vowel glyphs and digraphs in common English use.
const knownVowels = new Set([
  // Digraphs
  'ae',
  // ISO basic Latin monographs
  'a', 'e', 'i', 'o', 'u', 'y',
])
